"""
Regression tests for bugs found during the full test pass.
They need no database, no internet and no API key:  python -m pytest test_regressions.py
"""
import asyncio
import time
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy.engine import make_url


# ---- 1. database URLs must escape special characters in passwords and names ----
def test_sql_url_escapes_special_characters():
    from utils.sql_url import build_sql_url

    url = build_sql_url("mysql", "special", "p@ss/w:rd#1", "127.0.0.1", 3307, "shop_test?charset=latin1")
    assert url.host == "127.0.0.1"
    assert url.port == 3307
    assert url.password == "p@ss/w:rd#1"
    assert url.database == "shop_test?charset=latin1"
    # the rendered string must parse back to the same values (the old f-string did not)
    back = make_url(url.render_as_string(hide_password=False))
    assert (back.host, back.password, back.database) == ("127.0.0.1", "p@ss/w:rd#1", "shop_test?charset=latin1")


def test_sql_url_drivers_and_default_ports():
    from utils.sql_url import build_sql_url

    assert build_sql_url("mysql", "u", "p", "h", None, "d").drivername == "mysql+pymysql"
    assert build_sql_url("mysql", "u", "p", "h", None, "d").port == 3306
    assert build_sql_url("psql", "u", "p", "h", "", "d").drivername == "postgresql+psycopg2"
    assert build_sql_url("psql", "u", "p", "h", "", "d").port == 5432


def test_sql_agent_uses_the_safe_builder():
    from ai.agents.sql_agent import SQLAgent

    url = SQLAgent()._build_connection_url(
        {"type": "mysql", "details": {"host": "h", "port": 3306, "username": "u", "password": "a@b/c:d", "database": "db"}}
    )
    assert url.password == "a@b/c:d" and url.host == "h"


# ---- 2. upload filenames can never leave the user's folder ----
def test_safe_upload_filename():
    from datasources.router import _safe_upload_filename as f

    assert f("sales.csv") == "sales.csv"
    assert f("../../evil.csv") == "evil.csv"
    assert f("..\\..\\evil.xlsx") == "evil.xlsx"
    assert f("C:\\Windows\\evil.csv") == "evil.csv"
    assert f("DATA.CSV") == "DATA.csv"
    assert f("shell.py") is None
    assert f("report.csv.exe") is None
    assert f(".csv") is None
    assert f("") is None and f(None) is None
    assert len(f("a" * 300 + ".csv")) <= 124


# ---- 3. silent audio must not become text ----
def test_silence_is_not_transcribed():
    from ai.speech import _looks_like_silence

    quiet = SimpleNamespace(segments=[{"no_speech_prob": 0.92}])
    assert _looks_like_silence(quiet, "anything")
    assert _looks_like_silence(SimpleNamespace(segments=[]), "You")
    assert _looks_like_silence(SimpleNamespace(segments=[]), "Thank you.")
    speech = SimpleNamespace(segments=[{"no_speech_prob": 0.02}])
    assert not _looks_like_silence(speech, "Show me the total amount for each region")


# ---- 4. autocomplete must give the reasoning model enough room to answer ----
def test_autocomplete_token_budget(monkeypatch):
    import ai.autocomplete as ac

    seen = {}

    class FakeCompletions:
        def create(self, **kwargs):
            seen.update(kwargs)
            msg = SimpleNamespace(content='["total amount by region", "total amount per product"]')
            return SimpleNamespace(choices=[SimpleNamespace(message=msg)])

    fake = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))
    monkeypatch.setattr(ac, "get_groq_client", lambda: fake)
    out = asyncio.run(ac.autocomplete._generate_suggestions("total am", "table sales(amount)", "pandas", 2))
    assert seen["max_completion_tokens"] >= 1000, "200 tokens made the model return an empty answer"
    assert out == ["total amount by region", "total amount per product"]


# ---- 5. CSV export must be fast (one response, not one chunk per row) ----
def test_csv_export_is_fast_and_complete():
    from app import app
    from auth.dependencies import require_user

    app.dependency_overrides[require_user] = lambda: {"id": "test-user", "email": "t@t.test"}
    try:
        client = TestClient(app)
        rows = [{"a": i, "b": "x" * 20} for i in range(3000)]
        t = time.time()
        r = client.post("/ai/export/csv", json={"results": rows})
        elapsed = time.time() - t
        assert r.status_code == 200
        assert r.text.count("\n") == 3001  # header + 3000 rows
        assert int(r.headers["content-length"]) == len(r.content)
        assert elapsed < 3, f"export of 3000 rows took {elapsed:.1f}s (the old streaming version took ~3s per 3000 rows)"
    finally:
        app.dependency_overrides.clear()
