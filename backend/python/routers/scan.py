"""
/scan router
Dedicated endpoints for permission scanning and real-time risk detection.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import asyncio

from services.scraper import scrape_page, detect_permissions_from_html
from services.scorer  import compute_risk_score, label_from_score

router = APIRouter()


class PermissionScanRequest(BaseModel):
    url: str


class BatchScanRequest(BaseModel):
    urls: List[str]
    max_concurrent: Optional[int] = 5


class ExtensionScanRequest(BaseModel):
    """Payload sent by the browser extension's content script."""
    url:       str
    html:      Optional[str] = None   # page HTML already captured by content.js
    cookies:   Optional[List[dict]] = []
    headers:   Optional[dict] = {}


# ─── POST /scan/permissions ───────────────────────────────────────────────────
@router.post("/permissions")
async def scan_permissions(body: PermissionScanRequest):
    """
    Detect permission signals for a given URL:
    camera, microphone, location, clipboard, contacts, storage, notifications.
    """
    result = await scrape_page(body.url, permissions_only=True)
    if not result:
        raise HTTPException(status_code=422, detail="Could not access this URL")

    permissions = result.get("permissions", [])
    score       = compute_risk_score(permissions=permissions, nlp_output={}, red_flags=[])

    return {
        "url":         body.url,
        "permissions": permissions,
        "risk_score":  score["total_score"],
        "risk_label":  score["label"],
    }


# ─── POST /scan/batch ─────────────────────────────────────────────────────────
@router.post("/batch")
async def batch_scan(body: BatchScanRequest):
    """
    Concurrently scan up to `max_concurrent` URLs.
    Returns a list of risk summaries sorted by risk score descending.
    """
    if len(body.urls) > 20:
        raise HTTPException(status_code=400, detail="Max 20 URLs per batch request")

    semaphore = asyncio.Semaphore(body.max_concurrent)

    async def _scan_one(url: str):
        async with semaphore:
            try:
                result = await scrape_page(url, permissions_only=True)
                permissions = result.get("permissions", []) if result else []
                score = compute_risk_score(permissions=permissions, nlp_output={}, red_flags=[])
                return {
                    "url":        url,
                    "risk_score": score["total_score"],
                    "risk_label": score["label"],
                    "permissions": permissions,
                    "error":      None,
                }
            except Exception as exc:
                return {"url": url, "risk_score": None, "error": str(exc)}

    results = await asyncio.gather(*[_scan_one(u) for u in body.urls])
    results.sort(key=lambda x: x["risk_score"] or 0, reverse=True)
    return {"results": results, "total": len(results)}


# ─── POST /scan/extension ────────────────────────────────────────────────────
@router.post("/extension")
async def extension_scan(body: ExtensionScanRequest):
    """
    Receives pre-fetched HTML from the browser extension's content.js.
    Skips scraping — analyses the already-captured DOM.
    """
    permissions = []

    if body.html:
        permissions = detect_permissions_from_html(body.html, body.url)

    # Analyse request headers for tracking signals
    tracking_headers = []
    risky_headers = ["set-cookie", "x-tracking-id", "x-adtech", "x-amzn-trace-id"]
    for header in risky_headers:
        if header in {k.lower() for k in body.headers.keys()}:
            tracking_headers.append(header)

    if tracking_headers:
        permissions.append({
            "name": "tracking_headers",
            "detected": True,
            "risk": "medium",
            "description": f"Tracking/fingerprinting headers detected: {', '.join(tracking_headers)}",
        })

    score = compute_risk_score(permissions=permissions, nlp_output={}, red_flags=[])

    return {
        "url":              body.url,
        "permissions":      permissions,
        "tracking_headers": tracking_headers,
        "risk_score":       score["total_score"],
        "risk_label":       score["label"],
        "cookie_count":     len(body.cookies),
        "source":           "extension",
    }


# ─── GET /scan/risk-labels ────────────────────────────────────────────────────
@router.get("/risk-labels")
def risk_labels():
    """
    Returns the scoring thresholds used by DataShield.
    Useful for clients to render colour-coded badges.
    """
    return {
        "labels": [
            {"label": "safe",     "min": 0,  "max": 20,  "color": "#22c55e"},
            {"label": "low",      "min": 21, "max": 40,  "color": "#84cc16"},
            {"label": "moderate", "min": 41, "max": 60,  "color": "#eab308"},
            {"label": "high",     "min": 61, "max": 80,  "color": "#f97316"},
            {"label": "critical", "min": 81, "max": 100, "color": "#ef4444"},
        ]
    }