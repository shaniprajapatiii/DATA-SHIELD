"""
services/scraper.py
Async web scraper using requests + BeautifulSoup.
Discovers privacy policy URLs, extracts full text,
and detects permission-related signals in HTML.
"""

import re
import asyncio
import logging
from urllib.parse import urljoin, urlparse
from typing import Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("datashield.scraper")

# ─── Constants ─────────────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

TIMEOUT = 15  # seconds

# Keywords that suggest a link leads to a privacy policy
POLICY_LINK_KEYWORDS = [
    "privacy", "privacy-policy", "privacy_policy",
    "terms", "terms-of-service", "tos", "legal",
    "data-policy", "cookie-policy",
]

# HTML permission signals
PERMISSION_SIGNALS = {
    "microphone": [
        r"getUserMedia", r"MediaRecorder", r"AudioContext",
        r"microphone", r"audio-capture",
    ],
    "camera": [
        r"getUserMedia", r"ImageCapture", r"video/webrtc",
        r"facingMode", r"camera", r"webcam",
    ],
    "location": [
        r"geolocation", r"getCurrentPosition", r"watchPosition",
        r"navigator\.geolocation",
    ],
    "clipboard": [
        r"navigator\.clipboard", r"readText", r"writeText",
        r"ClipboardEvent", r"clipboard-read",
    ],
    "notifications": [
        r"Notification\.requestPermission", r"pushManager",
        r"ServiceWorkerRegistration", r"PushSubscription",
    ],
    "storage": [
        r"localStorage", r"sessionStorage", r"indexedDB",
        r"openDatabase",
    ],
    "contacts": [
        r"navigator\.contacts", r"ContactsManager",
    ],
    "sensors": [
        r"DeviceMotionEvent", r"DeviceOrientationEvent",
        r"AmbientLightSensor", r"Accelerometer",
    ],
    "bluetooth": [
        r"navigator\.bluetooth", r"BluetoothDevice",
    ],
    "usb": [
        r"navigator\.usb", r"USBDevice",
    ],
}

PERMISSION_RISK = {
    "microphone":    "high",
    "camera":        "high",
    "location":      "high",
    "clipboard":     "medium",
    "notifications": "low",
    "storage":       "medium",
    "contacts":      "critical",
    "sensors":       "medium",
    "bluetooth":     "medium",
    "usb":           "high",
}


# ─── Public async wrapper ──────────────────────────────────────────────────────
async def scrape_page(url: str, permissions_only: bool = False) -> Optional[dict]:
    """
    Async entry point – offloads blocking I/O to thread pool.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _scrape_sync, url, permissions_only)


# ─── Synchronous implementation ───────────────────────────────────────────────
def _scrape_sync(url: str, permissions_only: bool = False) -> Optional[dict]:
    try:
        # 1. Fetch the landing page
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        resp.raise_for_status()
    except requests.exceptions.SSLError:
        logger.warning(f"SSL error for {url}, retrying without verification")
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT,
                                allow_redirects=True, verify=False)
        except Exception as exc:
            logger.error(f"Scrape failed for {url}: {exc}")
            return None
    except Exception as exc:
        logger.error(f"Scrape failed for {url}: {exc}")
        return None

    soup       = BeautifulSoup(resp.text, "html.parser")
    page_title = soup.title.string.strip() if soup.title else urlparse(url).netloc
    permissions = detect_permissions_from_html(resp.text, url)

    if permissions_only:
        return {"url": url, "page_title": page_title, "permissions": permissions}

    # 2. Find the privacy policy link
    policy_url, policy_text = _find_and_fetch_policy(soup, url)

    # 3. If policy not found on linked page, extract from current page
    if not policy_text:
        policy_text = _extract_text_from_soup(soup)
        policy_url  = url

    return {
        "url":          url,
        "page_title":   page_title,
        "policy_url":   policy_url,
        "policy_text":  policy_text,
        "permissions":  permissions,
        "html_size":    len(resp.text),
    }


def _find_and_fetch_policy(soup: BeautifulSoup, base_url: str) -> tuple[Optional[str], Optional[str]]:
    """
    Searches anchor tags for privacy/terms links, fetches the best candidate.
    Returns (policy_url, policy_text).
    """
    candidates = []

    for a in soup.find_all("a", href=True):
        href = a["href"].lower()
        text = a.get_text(strip=True).lower()
        score = 0

        for kw in POLICY_LINK_KEYWORDS:
            if kw in href: score += 2
            if kw in text: score += 1

        if score > 0:
            full_url = urljoin(base_url, a["href"])
            candidates.append((score, full_url))

    if not candidates:
        return None, None

    candidates.sort(key=lambda x: x[0], reverse=True)
    best_url = candidates[0][1]

    try:
        resp = requests.get(best_url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        policy_soup = BeautifulSoup(resp.text, "html.parser")
        text        = _extract_text_from_soup(policy_soup)
        return best_url, text
    except Exception as exc:
        logger.warning(f"Could not fetch policy page {best_url}: {exc}")
        return None, None


def _extract_text_from_soup(soup: BeautifulSoup) -> str:
    """
    Extracts clean readable text from a BeautifulSoup object.
    Removes script, style, nav, footer, header blocks.
    """
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
        tag.decompose()

    # Prefer main content areas
    main = (
        soup.find("main") or
        soup.find("article") or
        soup.find(id=re.compile(r"(content|policy|privacy|terms)", re.I)) or
        soup.find(class_=re.compile(r"(content|policy|privacy|terms)", re.I)) or
        soup.body
    )

    if not main:
        return soup.get_text(separator=" ", strip=True)

    text = main.get_text(separator=" ", strip=True)
    # Collapse whitespace
    text = re.sub(r'\s{2,}', ' ', text)
    return text[:50_000]  # cap at 50k chars to avoid memory issues


def detect_permissions_from_html(html: str, url: str = "") -> list[dict]:
    """
    Scans raw HTML/JS for permission API usage patterns.
    Public function — used by both scraper and extension router.
    """
    detected = []
    for permission, patterns in PERMISSION_SIGNALS.items():
        for pattern in patterns:
            if re.search(pattern, html, re.IGNORECASE):
                detected.append({
                    "name":        permission,
                    "detected":    True,
                    "risk":        PERMISSION_RISK.get(permission, "medium"),
                    "description": f"Page requests or uses '{permission}' API",
                })
                break  # one match per permission category is enough

    return detected