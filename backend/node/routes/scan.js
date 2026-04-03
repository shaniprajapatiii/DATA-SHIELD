const express  = require('express');
const router   = express.Router();
const axios    = require('axios');

const authMiddleware  = require('../middleware/auth');
const scanController  = require('../controllers/scanController');

const PYTHON_ENGINE = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

async function runPermissionFallback(url, userId) {
  const fallbackResp = await axios.post(
    `${PYTHON_ENGINE}/scan/permissions`,
    { url },
    { timeout: 30000 }
  );

  const fallback = fallbackResp.data;
  const fallbackResult = {
    success: true,
    target_url: url,
    page_title: null,
    policy_url: null,
    risk_score: fallback.risk_score,
    risk_label: fallback.risk_label,
    score_breakdown: {},
    permissions: fallback.permissions || [],
    red_flags: [],
    policy_findings: {},
    sentiment: { overall: 'neutral', confidence: 0 },
    summary: {
      tldr: 'Privacy policy/terms could not be extracted. Risk score is based on detected permissions only.',
      bullets: [
        'No policy text was extracted from this URL.',
        'Displayed risk is computed from permission/API signals.',
      ],
      collected: 'Unknown (policy unavailable)',
      sharedWith: 'Unknown (policy unavailable)',
      retainedFor: 'Unknown (policy unavailable)',
    },
    scan_duration_ms: null,
    engine_version: '1.0.0',
    partial: true,
    fallback_reason: 'policy_not_found',
  };

  const saved = await scanController.saveScan({
    userId,
    targetUrl: url,
    riskScore: fallbackResult.risk_score,
    permissions: fallbackResult.permissions,
    policyFindings: fallbackResult.policy_findings,
    redFlags: fallbackResult.red_flags,
    sentiment: fallbackResult.sentiment,
    summary: fallbackResult.summary,
  });

  return { ...fallbackResult, scanId: saved._id };
}

// ─── POST /api/scan/url ───────────────────────────────────────────────────────
// Scan a website URL for privacy risks
router.post('/url', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Proxy to Python FastAPI engine
    const response = await axios.post(`${PYTHON_ENGINE}/analyze/url`, { url }, {
      timeout: 60000, // 60 second timeout for heavy scraping
    });

    const result = response.data;

    // Persist scan result for authenticated user
    const saved = await scanController.saveScan({
      userId: req.user.id,
      targetUrl: url,
      riskScore: result.risk_score,
      permissions: result.permissions,
      policyFindings: result.policy_findings,
      redFlags: result.red_flags,
      sentiment: result.sentiment,
      summary: result.summary,
    });

    res.json({ ...result, scanId: saved._id });
  } catch (err) {
    // If policy extraction fails, fall back to permission-only analysis.
    if (err.response?.status === 422) {
      try {
        const fallbackResult = await runPermissionFallback(url, req.user.id);
        return res.json(fallbackResult);
      } catch (fallbackErr) {
        if (fallbackErr.response) {
          return res.status(fallbackErr.response.status).json(fallbackErr.response.data);
        }

        console.error('Permission fallback failed:', fallbackErr.message);
      }
    }

    if (err.response) {
      // Python engine returned an error
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Scan URL error:', err.message);
    res.status(500).json({ error: 'Scan failed. Please try again.' });
  }
});

// ─── POST /api/scan/permissions ──────────────────────────────────────────────
// Direct permission-based scan endpoint for explicit fallback flows.
router.post('/permissions', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const fallbackResult = await runPermissionFallback(url, req.user.id);
    res.json(fallbackResult);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }

    console.error('Permission scan error:', err.message);
    res.status(500).json({ error: 'Permission scan failed. Please try again.' });
  }
});

// ─── POST /api/scan/text ─────────────────────────────────────────────────────
// Paste raw policy text for analysis
router.post('/text', authMiddleware, async (req, res) => {
  try {
    const { text, label } = req.body;
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Policy text is too short' });
    }

    const response = await axios.post(`${PYTHON_ENGINE}/analyze/text`, { text, label }, {
      timeout: 30000,
    });

    const result = response.data;

    const saved = await scanController.saveScan({
      userId: req.user.id,
      targetUrl: label || 'Pasted Text',
      riskScore: result.risk_score,
      policyFindings: result.policy_findings,
      redFlags: result.red_flags,
      sentiment: result.sentiment,
      summary: result.summary,
    });

    res.json({ ...result, scanId: saved._id });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: 'Text analysis failed' });
  }
});

// ─── POST /api/scan/compare ───────────────────────────────────────────────────
// Side-by-side comparison of two URLs
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { urlA, urlB } = req.body;
    if (!urlA || !urlB) {
      return res.status(400).json({ error: 'Two URLs required for comparison' });
    }

    const [respA, respB] = await Promise.all([
      axios.post(`${PYTHON_ENGINE}/analyze/url`, { url: urlA }, { timeout: 60000 }),
      axios.post(`${PYTHON_ENGINE}/analyze/url`, { url: urlB }, { timeout: 60000 }),
    ]);

    res.json({
      comparison: true,
      siteA: { url: urlA, ...respA.data },
      siteB: { url: urlB, ...respB.data },
      winner: respA.data.risk_score <= respB.data.risk_score ? 'A' : 'B',
    });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: 'Comparison failed' });
  }
});

// ─── GET /api/scan/history ────────────────────────────────────────────────────
// Fetch user's scan history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const history = await scanController.getUserScans(req.user.id, page, limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch scan history' });
  }
});

// ─── GET /api/scan/:id ────────────────────────────────────────────────────────
// Fetch a single scan result
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const scan = await scanController.getScanById(req.params.id, req.user.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch scan' });
  }
});

// ─── DELETE /api/scan/:id ─────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await scanController.deleteScan(req.params.id, req.user.id);
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
