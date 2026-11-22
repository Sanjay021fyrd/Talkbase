import logging
from typing import Optional
from groq import Groq
from ai.llm.groq import get_groq_client

logger = logging.getLogger(__name__)


# Words Whisper tends to invent when it is given silence or noise.
_SILENCE_HALLUCINATIONS = {"you", "thank you", "thanks for watching", "thanks for listening", "bye", "bye bye"}


def _looks_like_silence(transcription, text: str) -> bool:
    """True when Whisper itself says there is no speech, or when the text is a known silence artefact."""
    segments = getattr(transcription, "segments", None) or []
    probs = []
    for seg in segments:
        p = seg.get("no_speech_prob") if isinstance(seg, dict) else getattr(seg, "no_speech_prob", None)
        if p is not None:
            probs.append(p)
    if probs and min(probs) > 0.6:
        return True
    return text.strip().lower().strip(" .!?,") in _SILENCE_HALLUCINATIONS


async def transcribe_audio(
    file_bytes: bytes,
    filename: str,
    language: Optional[str] = None,
) -> str:
    """
    Transcribe audio bytes using Groq Whisper and return English text.

    If the spoken language is not English, Whisper's translation endpoint
    is used so the output is always in English.
    """
    client = get_groq_client()
    if client is None:
        raise RuntimeError("Groq client unavailable – check GROQ_API_KEY")

    try:
        # Step 1: Transcribe (detect language automatically)
        transcription = client.audio.transcriptions.create(
            file=(filename, file_bytes),
            model="whisper-large-v3",
            temperature=0,
            response_format="verbose_json",
        )

        detected_language = getattr(transcription, "language", None) or "en"
        text = transcription.text or ""

        if _looks_like_silence(transcription, text):
            logger.info("Whisper result discarded: audio looks silent (text=%r)", text)
            return ""

        logger.info(
            "Whisper transcription – detected_language=%s, length=%d",
            detected_language,
            len(text),
        )

        # Step 2: If not English, use the translation endpoint
        if detected_language != "en" and text:
            translation = client.audio.translations.create(
                file=(filename, file_bytes),
                model="whisper-large-v3",
                temperature=0,
                response_format="verbose_json",
            )
            text = translation.text or text
            logger.info("Whisper translated to English, length=%d", len(text))

        return text.strip()

    except Exception as e:
        logger.error("Speech-to-text failed: %s", e)
        raise
