"""
services/scorer.py
Computes DataShield's proprietary 0–100 risk score from:
  • Permission signals (what APIs the page requests)
  • NLP output     (red flags, sentiment, policy findings)
  • Transparency   (presence of GDPR/CCPA/COPPA mentions)

Higher score = more risky.
"""

from typing import Any

# ─── Weight Configuration ─────────────────────────────────────────────────────
WEIGHTS = {
    "permission":   0.35,   # 35% – hardware/API access requests
    "red_flag":     0.40,   # 40% – dangerous policy clauses
    "sentiment":    0.15,   # 15% – overall tone of the policy
    "transparency": 0.10,   # 10% – compliance mentions & clarity
}

# Risk scores per permission level
PERMISSION_RISK_SCORES = {
    "critical": 100,
    "high":      75,
    "medium":    45,
    "low":       20,
}

# Red-flag severity scores
RED_FLAG_SEVERITY_SCORES = {
    "critical": 100,
    "danger":    80,
    "warn":      50,
    "info":      20,
}


# ─── Main Scorer ──────────────────────────────────────────────────────────────
def compute_risk_score(
    permissions: list[dict],
    nlp_output:  dict[str, Any],
    red_flags:   list[dict],
) -> dict[str, Any]:
    """
    Returns:
      {
        "total_score": int  (0–100),
        "label":       str  ("safe" | "low" | "moderate" | "high" | "critical"),
        "breakdown": {
          "permission_score":   int,
          "red_flag_score":     int,
          "sentiment_score":    int,
          "transparency_score": int,
        }
      }
    """

    # 1 ── Permission sub-score ──────────────────────────────────────────────
    perm_score = _score_permissions(permissions)

    # 2 ── Red-flag sub-score ────────────────────────────────────────────────
    flag_score = _score_red_flags(red_flags)

    # 3 ── Sentiment sub-score ────────────────────────────────────────────────
    sentiment_score = _score_sentiment(nlp_output.get("sentiment", {}))

    # 4 ── Transparency sub-score ─────────────────────────────────────────────
    transparency_score = _score_transparency(nlp_output.get("policy_findings", {}))

    # 5 ── Weighted total ─────────────────────────────────────────────────────
    total = (
        perm_score         * WEIGHTS["permission"]   +
        flag_score         * WEIGHTS["red_flag"]     +
        sentiment_score    * WEIGHTS["sentiment"]    +
        transparency_score * WEIGHTS["transparency"]
    )
    total = min(100, max(0, round(total)))

    return {
        "total_score": total,
        "label":       label_from_score(total),
        "breakdown": {
            "permission_score":   round(perm_score),
            "red_flag_score":     round(flag_score),
            "sentiment_score":    round(sentiment_score),
            "transparency_score": round(transparency_score),
        },
    }


# ─── Sub-scorers ──────────────────────────────────────────────────────────────
def _score_permissions(permissions: list[dict]) -> float:
    """
    Averages the risk scores of detected permissions.
    If nothing is detected → neutral 30.
    """
    detected = [p for p in permissions if p.get("detected")]
    if not detected:
        return 30.0  # no detectable permissions = slightly suspicious (no transparency)

    scores = [
        PERMISSION_RISK_SCORES.get(p.get("risk", "medium"), 45)
        for p in detected
    ]
    # Average but apply a ceiling-multiplier for many risky permissions
    avg = sum(scores) / len(scores)
    multiplier = min(1.3, 1 + 0.05 * len(detected))  # up to 30% boost
    return min(100, avg * multiplier)


def _score_red_flags(red_flags: list[dict]) -> float:
    """
    Each red flag contributes to the score; critical flags dominate.
    """
    if not red_flags:
        return 10.0  # clean policy

    scores = [
        RED_FLAG_SEVERITY_SCORES.get(flag.get("severity", "warn"), 50)
        for flag in red_flags
    ]
    # Use weighted average: the worst flag counts double
    scores.sort(reverse=True)
    if len(scores) == 1:
        return float(scores[0])

    # Top flag × 2, rest × 1, then normalise
    weighted = scores[0] * 2 + sum(scores[1:])
    normalised = weighted / (len(scores) + 1)
    # Boost for sheer quantity of flags
    quantity_boost = min(20, len(scores) * 3)
    return min(100, normalised + quantity_boost)


def _score_sentiment(sentiment: dict) -> float:
    """
    Maps sentiment label → risk score.
    Hostile language = higher risk.
    """
    label = sentiment.get("overall", "neutral")
    mapping = {
        "hostile":    80.0,
        "neutral":    40.0,
        "protective": 10.0,
    }
    return mapping.get(label, 40.0)


def _score_transparency(findings: dict) -> float:
    """
    Lower transparency = higher risk.
    We reward GDPR/CCPA/COPPA mentions, explicit data lists, retention periods.
    """
    score = 60.0  # start at moderate risk

    if findings.get("gdpr_compliant"):  score -= 15
    if findings.get("ccpa_compliant"):  score -= 10
    if findings.get("coppa_compliant"): score -= 5

    if findings.get("data_collected"):  score -= 10
    if findings.get("retention_days"):  score -= 10

    # If they share with many third parties, increase risk
    third_parties = len(findings.get("shared_with") or [])
    score += min(30, third_parties * 8)

    return min(100, max(0, score))


# ─── Label Helper ─────────────────────────────────────────────────────────────
def label_from_score(score: int) -> str:
    if score <= 20:  return "safe"
    if score <= 40:  return "low"
    if score <= 60:  return "moderate"
    if score <= 80:  return "high"
    return "critical"


# ─── Recommendation Generator ─────────────────────────────────────────────────
def generate_recommendations(score_result: dict, permissions: list, red_flags: list) -> list[str]:
    """
    Returns actionable recommendations based on what was found.
    """
    recs = []
    label = score_result.get("label", "moderate")

    if label in ("high", "critical"):
        recs.append("Consider using an alternative service with better privacy practices.")

    # Permission-specific advice
    detected_perms = {p["name"] for p in permissions if p.get("detected")}
    if "location" in detected_perms:
        recs.append("Deny location access in your browser or OS settings.")
    if "microphone" in detected_perms:
        recs.append("Revoke microphone permissions unless essential to the service.")
    if "camera" in detected_perms:
        recs.append("Revoke camera permissions and cover your webcam when not in use.")
    if "notifications" in detected_perms:
        recs.append("Block notification permissions to prevent push-based tracking.")

    # Red-flag specific advice
    categories = {f["category"] for f in red_flags}
    if "data_selling" in categories:
        recs.append("This service may sell your data — avoid submitting sensitive information.")
    if "indefinite_retention" in categories:
        recs.append("Request data deletion via the company's privacy contact or DPA.")
    if "third_party_sharing" in categories:
        recs.append("Use a VPN and/or browser tracking protection to limit data exposure.")
    if "no_opt_out" in categories:
        recs.append("Review the full policy for any buried opt-out mechanisms.")

    if not recs:
        recs.append("No immediate action required. Continue monitoring for policy changes.")

    return recs