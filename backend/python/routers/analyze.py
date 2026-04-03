"""
/analyze router
Accepts a URL or raw text, runs the full DataShield pipeline,
and returns a structured risk report.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
import time

from services.scraper    import scrape_page
from services.nlp_engine import analyze_policy_text
from services.scorer     import compute_risk_score

router = APIRouter()


# ─── Request / Response Models ─────────────────────────────────────────────────
class UrlRequest(BaseModel):
    url: str


class TextRequest(BaseModel):
    text: str
    label: Optional[str] = "Custom Policy"


class SummarizeRequest(BaseModel):
    url: str


# ─── POST /analyze/url ────────────────────────────────────────────────────────
@router.post("/url")
async def analyze_url(body: UrlRequest):
    """
    Full pipeline:
    1. Scrape the target URL for policy text + permission signals
    2. Run NLP analysis
    3. Compute risk score
    4. Return structured report
    """
    start = time.time()

    # Step 1 – Scrape
    scrape_result = await scrape_page(body.url)
    if not scrape_result or not scrape_result.get("policy_text"):
        raise HTTPException(
            status_code=422,
            detail="Could not extract policy text from this URL. Try pasting the text directly.",
        )

    # Step 2 – NLP
    nlp_result = await analyze_policy_text(scrape_result["policy_text"])

    # Step 3 – Score
    score_result = compute_risk_score(
        permissions   = scrape_result.get("permissions", []),
        nlp_output    = nlp_result,
        red_flags     = nlp_result.get("red_flags", []),
    )

    duration_ms = round((time.time() - start) * 1000)

    return {
        "success":        True,
        "target_url":     body.url,
        "page_title":     scrape_result.get("page_title"),
        "policy_url":     scrape_result.get("policy_url"),
        "risk_score":     score_result["total_score"],
        "risk_label":     score_result["label"],
        "score_breakdown":score_result["breakdown"],
        "permissions":    scrape_result.get("permissions", []),
        "red_flags":      nlp_result.get("red_flags", []),
        "policy_findings":nlp_result.get("policy_findings", {}),
        "sentiment":      nlp_result.get("sentiment", {}),
        "summary":        nlp_result.get("summary", {}),
        "scan_duration_ms": duration_ms,
        "engine_version": "1.0.0",
    }


# ─── POST /analyze/text ───────────────────────────────────────────────────────
@router.post("/text")
async def analyze_text(body: TextRequest):
    """
    Analyse raw pasted policy text (no scraping step).
    """
    start = time.time()

    if len(body.text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Text too short for analysis")

    nlp_result  = await analyze_policy_text(body.text)
    score_result = compute_risk_score(
        permissions=[],
        nlp_output=nlp_result,
        red_flags=nlp_result.get("red_flags", []),
    )

    duration_ms = round((time.time() - start) * 1000)

    return {
        "success":        True,
        "target_url":     body.label,
        "risk_score":     score_result["total_score"],
        "risk_label":     score_result["label"],
        "score_breakdown":score_result["breakdown"],
        "permissions":    [],
        "red_flags":      nlp_result.get("red_flags", []),
        "policy_findings":nlp_result.get("policy_findings", {}),
        "sentiment":      nlp_result.get("sentiment", {}),
        "summary":        nlp_result.get("summary", {}),
        "scan_duration_ms": duration_ms,
    }


# ─── POST /analyze/policy/summarize ──────────────────────────────────────────
@router.post("/summarize", tags=["Policy"])
async def summarize_policy(body: SummarizeRequest):
    """
    Lightweight summary endpoint — scrapes and summarises without full scoring.
    Used for quick lookups from the policy router.
    """
    scrape_result = await scrape_page(body.url)
    if not scrape_result or not scrape_result.get("policy_text"):
        raise HTTPException(status_code=422, detail="Could not extract policy text")

    nlp_result = await analyze_policy_text(scrape_result["policy_text"])

    return {
        "success":        True,
        "target_url":     body.url,
        "page_title":     scrape_result.get("page_title"),
        "summary":        nlp_result.get("summary", {}),
        "sentiment":      nlp_result.get("sentiment", {}),
        "policy_findings":nlp_result.get("policy_findings", {}),
        "red_flags":      nlp_result.get("red_flags", []),
    }