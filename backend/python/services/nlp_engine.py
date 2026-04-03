"""
services/nlp_engine.py
Core NLP pipeline:
  • Red-flag clause detection via regex + spaCy patterns
  • Sentiment analysis (transformers / VADER fallback)
  • Policy summarisation (extractive + bullet generation)
  • Data-collection / sharing / retention extraction
"""

import re
import asyncio
import logging
from typing import Any
from functools import lru_cache

logger = logging.getLogger("datashield.nlp")

# ─── Optional heavy imports (graceful fallback) ────────────────────────────────
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except Exception:
    nlp = None
    SPACY_AVAILABLE = False
    logger.warning("spaCy model not found – falling back to regex-only mode")

try:
    from transformers import pipeline as hf_pipeline
    _sentiment_pipe = hf_pipeline(
        "sentiment-analysis",
        model="nlptown/bert-base-multilingual-uncased-sentiment",
        truncation=True,
        max_length=512,
    )
    TRANSFORMERS_AVAILABLE = True
except Exception:
    _sentiment_pipe = None
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers not available – using VADER/rule-based sentiment")

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _vader = SentimentIntensityAnalyzer()
    VADER_AVAILABLE = True
except Exception:
    _vader = None
    VADER_AVAILABLE = False


# ─── Red-flag patterns ─────────────────────────────────────────────────────────
RED_FLAG_PATTERNS = [
    {
        "category": "data_selling",
        "severity": "critical",
        "patterns": [
            r"sell\s+(your|user|personal)\s+data",
            r"sell\s+information\s+to\s+third\s+parties",
            r"monetize\s+(your|user)\s+(data|information)",
        ],
        "explanation": "This policy allows the company to sell your personal data to third parties.",
    },
    {
        "category": "indefinite_retention",
        "severity": "danger",
        "patterns": [
            r"retain\s+(your\s+)?(data|information)\s+indefinitely",
            r"keep\s+(your\s+)?(data|information)\s+forever",
            r"no\s+deletion\s+(right|option|policy)",
        ],
        "explanation": "Your data may be kept forever with no guaranteed deletion.",
    },
    {
        "category": "third_party_sharing",
        "severity": "danger",
        "patterns": [
            r"share\s+(with|to)\s+(advertising|marketing|analytics)\s+partners",
            r"disclose\s+(your\s+)?information\s+to\s+third[\s-]parties",
            r"transfer\s+(your\s+)?data\s+to\s+affiliates",
        ],
        "explanation": "Your data is shared with advertising or marketing partners.",
    },
    {
        "category": "hidden_tracking",
        "severity": "danger",
        "patterns": [
            r"track(ing)?\s+your\s+(location|movements|browsing)",
            r"(monitor|record)\s+(all\s+)?(your\s+)?(activity|behavior|usage)",
            r"cross[\s-]site\s+tracking",
            r"fingerprint(ing)?",
        ],
        "explanation": "The service tracks your location, browsing, or online behaviour.",
    },
    {
        "category": "no_opt_out",
        "severity": "warn",
        "patterns": [
            r"(cannot|can't|no)\s+opt[\s-]out",
            r"mandatory\s+(data\s+)?(collection|sharing)",
            r"by\s+using\s+this\s+service\s+you\s+(agree|consent)\s+to",
        ],
        "explanation": "Users cannot opt out of certain data collection or sharing practices.",
    },
    {
        "category": "government_disclosure",
        "severity": "warn",
        "patterns": [
            r"comply\s+with\s+(law\s+enforcement|government)\s+request",
            r"disclose\s+(to\s+)?(government|authorities|law\s+enforcement)",
            r"national\s+security\s+(letter|request)",
        ],
        "explanation": "The company may share your data with government or law enforcement.",
    },
    {
        "category": "biometric_data",
        "severity": "critical",
        "patterns": [
            r"collect\s+(biometric|facial|fingerprint)\s+data",
            r"face\s+(scan|recognition|detection)",
            r"voice\s+print",
        ],
        "explanation": "The service collects biometric data such as facial scans or fingerprints.",
    },
    {
        "category": "children_data",
        "severity": "critical",
        "patterns": [
            r"collect\s+(data|information)\s+from\s+children",
            r"users\s+under\s+(13|16|18)",
            r"coppa",
        ],
        "explanation": "Policy references children's data — verify COPPA/GDPR-K compliance.",
    },
]

# ─── Data extraction patterns ──────────────────────────────────────────────────
COLLECTION_PATTERNS = [
    r"we\s+collect\s+([^.]{10,120})",
    r"information\s+(we\s+)?collect\s+includes?\s+([^.]{10,120})",
    r"data\s+collected\s+(?:by\s+us\s+)?includes?\s+([^.]{10,120})",
]

SHARING_PATTERNS = [
    r"we\s+(?:may\s+)?share\s+(?:your\s+)?(?:data|information)\s+with\s+([^.]{5,100})",
    r"disclosed?\s+to\s+([^.]{5,100})",
    r"(?:sold?|transferred?)\s+to\s+([^.]{5,100})",
]

RETENTION_PATTERNS = [
    r"retain\s+(?:your\s+)?(?:data|information)\s+for\s+([\d]+)\s+(day|month|year)s?",
    r"stored?\s+for\s+(?:up\s+to\s+)?([\d]+)\s+(day|month|year)s?",
    r"deleted?\s+after\s+([\d]+)\s+(day|month|year)s?",
]


# ─── Main Analysis Function ────────────────────────────────────────────────────
async def analyze_policy_text(text: str) -> dict[str, Any]:
    """
    Full NLP analysis pipeline.  Returns structured findings.
    """
    loop = asyncio.get_event_loop()
    # Run CPU-bound work in a thread pool
    result = await loop.run_in_executor(None, _run_analysis, text)
    return result


def _run_analysis(text: str) -> dict[str, Any]:
    text_lower = text.lower()

    red_flags      = _detect_red_flags(text_lower, text)
    policy_findings = _extract_policy_findings(text_lower, text)
    sentiment      = _analyze_sentiment(text)
    summary        = _summarize(text, red_flags, policy_findings)

    return {
        "red_flags":       red_flags,
        "policy_findings": policy_findings,
        "sentiment":       sentiment,
        "summary":         summary,
        "word_count":      len(text.split()),
        "reading_time_min": max(1, len(text.split()) // 200),
    }


def _detect_red_flags(text_lower: str, text_original: str) -> list[dict]:
    flags = []
    for rule in RED_FLAG_PATTERNS:
        for pattern in rule["patterns"]:
            match = re.search(pattern, text_lower)
            if match:
                # Extract surrounding clause (up to 200 chars)
                start = max(0, match.start() - 40)
                end   = min(len(text_original), match.end() + 160)
                clause = "…" + text_original[start:end].strip() + "…"

                flags.append({
                    "category":    rule["category"],
                    "severity":    rule["severity"],
                    "clause":      clause,
                    "explanation": rule["explanation"],
                })
                break  # one match per rule is enough
    return flags


def _extract_policy_findings(text_lower: str, text_original: str) -> dict:
    findings = {
        "data_collected": [],
        "shared_with":    [],
        "retention_days": None,
        "third_parties":  [],
        "gdpr_compliant": "gdpr" in text_lower,
        "ccpa_compliant": "ccpa" in text_lower or "california" in text_lower,
        "coppa_compliant": "coppa" in text_lower,
    }

    # Data collected
    for pattern in COLLECTION_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            findings["data_collected"].append(match.group(1).strip()[:120])
    findings["data_collected"] = list(set(findings["data_collected"]))[:8]

    # Shared with
    for pattern in SHARING_PATTERNS:
        for match in re.finditer(pattern, text_lower):
            findings["shared_with"].append(match.group(1).strip()[:80])
    findings["shared_with"] = list(set(findings["shared_with"]))[:6]

    # Retention
    for pattern in RETENTION_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            qty  = int(match.group(1))
            unit = match.group(2)
            multipliers = {"day": 1, "month": 30, "year": 365}
            findings["retention_days"] = qty * multipliers.get(unit, 1)
            break

    return findings


def _analyze_sentiment(text: str) -> dict:
    """
    Classify policy tone as 'hostile', 'neutral', or 'protective'.
    Uses transformers if available, otherwise VADER, otherwise rule-based.
    """
    chunks = _chunk_text(text, max_chars=450)

    if TRANSFORMERS_AVAILABLE and _sentiment_pipe and chunks:
        try:
            raw = _sentiment_pipe(chunks[:8])  # analyse first 8 chunks
            avg_stars = sum(
                int(r["label"].split()[0]) for r in raw
            ) / len(raw)
            # 1–2 stars = hostile, 3 = neutral, 4–5 = protective
            if avg_stars < 2.5:
                overall, score = "hostile", round(1 - avg_stars / 5, 2)
            elif avg_stars < 3.5:
                overall, score = "neutral", 0.5
            else:
                overall, score = "protective", round(avg_stars / 5, 2)

            return {"overall": overall, "score": score, "method": "transformers"}
        except Exception as exc:
            logger.warning(f"Transformer sentiment failed: {exc}")

    if VADER_AVAILABLE and _vader and chunks:
        scores = [_vader.polarity_scores(c)["compound"] for c in chunks[:12]]
        avg = sum(scores) / len(scores)
        if avg < -0.2:
            overall = "hostile"
        elif avg < 0.2:
            overall = "neutral"
        else:
            overall = "protective"
        return {"overall": overall, "score": round((avg + 1) / 2, 2), "method": "vader"}

    # Rule-based fallback
    hostile_words   = ["may sell", "can share", "without notice", "no right", "waive"]
    protective_words = ["never sell", "cannot share", "you control", "opt out", "delete your data"]
    text_lower = text.lower()
    h_count = sum(1 for w in hostile_words   if w in text_lower)
    p_count = sum(1 for w in protective_words if w in text_lower)

    if h_count > p_count:
        return {"overall": "hostile",    "score": 0.25, "method": "rule-based"}
    if p_count > h_count:
        return {"overall": "protective", "score": 0.75, "method": "rule-based"}
    return {"overall": "neutral", "score": 0.5, "method": "rule-based"}


def _summarize(text: str, red_flags: list, findings: dict) -> dict:
    """
    Generate bullet-point summary and TL;DR.
    """
    bullets = []

    # Data collected bullet
    if findings["data_collected"]:
        items = ", ".join(findings["data_collected"][:3])
        bullets.append(f"Collects: {items}.")
    else:
        bullets.append("Data collected is not clearly disclosed.")

    # Sharing bullet
    if findings["shared_with"]:
        entities = ", ".join(findings["shared_with"][:3])
        bullets.append(f"Shared with: {entities}.")
    else:
        bullets.append("No explicit third-party data sharing disclosed.")

    # Retention bullet
    if findings["retention_days"]:
        years = round(findings["retention_days"] / 365, 1)
        bullets.append(f"Data retained for approximately {years} year(s).")
    else:
        bullets.append("Data retention period not specified.")

    # Compliance bullet
    compliances = []
    if findings["gdpr_compliant"]:  compliances.append("GDPR")
    if findings["ccpa_compliant"]:  compliances.append("CCPA")
    if findings["coppa_compliant"]: compliances.append("COPPA")
    if compliances:
        bullets.append(f"References: {', '.join(compliances)} compliance.")
    else:
        bullets.append("No major compliance frameworks (GDPR/CCPA/COPPA) mentioned.")

    # Red flag bullet
    critical = [f for f in red_flags if f["severity"] in ("critical", "danger")]
    if critical:
        bullets.append(f"⚠ {len(critical)} critical privacy risk(s) detected.")

    # TL;DR
    flag_count = len(red_flags)
    tldr = (
        f"This policy contains {flag_count} privacy risk(s). "
        + ("Exercise caution before using this service." if flag_count > 2 else
           "Review the highlighted clauses before proceeding.")
    )

    highlights = [f["explanation"] for f in red_flags[:3]]

    return {"bullets": bullets, "tldr": tldr, "highlights": highlights}


def _chunk_text(text: str, max_chars: int = 450) -> list[str]:
    """Split text into chunks of max_chars for model inference."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks, current = [], ""
    for sentence in sentences:
        if len(current) + len(sentence) < max_chars:
            current += " " + sentence
        else:
            if current.strip():
                chunks.append(current.strip())
            current = sentence
    if current.strip():
        chunks.append(current.strip())
    return chunks
