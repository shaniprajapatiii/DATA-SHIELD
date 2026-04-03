const express = require('express');
const router  = express.Router();
const axios   = require('axios');

const authMiddleware = require('../../middleware/auth');
const Scan           = require('../../models/Scan');

const PYTHON_ENGINE = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

// ─── GET /api/policy/summary/:scanId ─────────────────────────────────────────
// Return bullet-point AI summary for a previously saved scan
router.get('/summary/:scanId', authMiddleware, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.scanId,
      userId: req.user.id,
    });
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    res.json({
      scanId: scan._id,
      targetUrl: scan.targetUrl,
      summary: scan.summary,
      sentiment: scan.sentiment,
      policyFindings: scan.policyFindings,
      riskScore: scan.riskScore,
      createdAt: scan.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch summary' });
  }
});

// ─── POST /api/policy/live-summary ───────────────────────────────────────────
// On-the-fly NLP summary without saving (useful for quick lookups)
router.post('/live-summary', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const response = await axios.post(`${PYTHON_ENGINE}/policy/summarize`, { url }, {
      timeout: 45000,
    });

    res.json(response.data);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(500).json({ error: 'Live summary failed' });
  }
});

// ─── POST /api/policy/track ───────────────────────────────────────────────────
// Subscribe user to track policy changes for a URL
router.post('/track', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    // Upsert a tracking record in the scan collection
    await Scan.updateOne(
      { userId: req.user.id, targetUrl: url, tracked: true },
      {
        $setOnInsert: {
          userId: req.user.id,
          targetUrl: url,
          tracked: true,
          riskScore: null,
          trackingSince: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ message: `Now tracking policy changes for ${url}` });
  } catch (err) {
    res.status(500).json({ error: 'Tracking setup failed' });
  }
});

// ─── GET /api/policy/tracked ─────────────────────────────────────────────────
// List all URLs the user is tracking
router.get('/tracked', authMiddleware, async (req, res) => {
  try {
    const tracked = await Scan.find(
      { userId: req.user.id, tracked: true },
      { targetUrl: 1, riskScore: 1, lastChecked: 1, trackingSince: 1 }
    ).sort({ trackingSince: -1 });

    res.json({ tracked });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch tracked sites' });
  }
});

// ─── DELETE /api/policy/track/:url ───────────────────────────────────────────
router.delete('/track', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    await Scan.deleteOne({ userId: req.user.id, targetUrl: url, tracked: true });
    res.json({ message: `Stopped tracking ${url}` });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove tracking' });
  }
});

// ─── GET /api/policy/redflags ─────────────────────────────────────────────────
// Get aggregated red-flag stats across all of user's scans
router.get('/redflags', authMiddleware, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user.id }, { redFlags: 1, targetUrl: 1 });
    const allFlags = scans.flatMap((s) =>
      (s.redFlags || []).map((f) => ({ ...f, site: s.targetUrl }))
    );

    // Count by category
    const counts = allFlags.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});

    res.json({ total: allFlags.length, byCategory: counts, flags: allFlags });
  } catch (err) {
    res.status(500).json({ error: 'Could not aggregate red flags' });
  }
});

module.exports = router;
