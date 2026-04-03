const express  = require('express');
const router   = express.Router();
const axios    = require('axios');

const authMiddleware  = require('../middleware/auth');
const scanController  = require('../controllers/scanController');

const PYTHON_ENGINE = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

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
    if (err.response) {
      // Python engine returned an error
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Scan URL error:', err.message);
    res.status(500).json({ error: 'Scan failed. Please try again.' });
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
