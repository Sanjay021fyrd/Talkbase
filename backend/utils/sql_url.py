"""Build SQLAlchemy connection URLs safely.

Passwords, user names and database names may contain characters such as @ / : # ? %.
Using URL.create() escapes them correctly, whereas pasting them into an f-string does not.
"""
from sqlalchemy.engine import URL


def build_sql_url(db_type: str, username: str, password: str, host: str, port, database: str) -> URL:
    driver = "mysql+pymysql" if str(db_type) == "mysql" else "postgresql+psycopg2"
    default_port = 3306 if str(db_type) == "mysql" else 5432
    return URL.create(
        drivername=driver,
        username=username or None,
        password=password or None,
        host=host or "localhost",
        port=int(port) if port not in (None, "") else default_port,
        database=database or None,
    )
