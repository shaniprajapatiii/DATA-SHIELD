const mongoose = require('mongoose');

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true },   // e.g. 'microphone'
  risk: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  description: String,
  detected: { type: Boolean, default: false },
}, { _id: false });

const redFlagSchema = new mongoose.Schema({
  category: String,  // 'data_sharing' | 'retention' | 'third_party' | 'consent' …
  severity: { type: String, enum: ['info', 'warn', 'danger', 'critical'] },
  clause: String,  // extracted text snippet
  explanation: String,  // plain-English explanation
  lineRef: Number,  // line in original policy
}, { _id: false });

const policyFindingSchema = new mongoose.Schema({
  dataCollected: [String],
  sharedWith: [String],
  retentionDays: Number,
  thirdParties: [String],
  gdprCompliant: Boolean,
  ccpaCompliant: Boolean,
  coppaCompliant: Boolean,
}, { _id: false });

// ─── Main Scan Schema ─────────────────────────────────────────────────────────
const scanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Risk Scoring ──────────────────────────────────────────────────────────
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    riskLabel: {
      type: String,
      enum: ['safe', 'low', 'moderate', 'high', 'critical'],
      default: null,
    },
    scoreBreakdown: {
      permissionScore: { type: Number, default: 0 },
      sentimentScore: { type: Number, default: 0 },
      redFlagScore: { type: Number, default: 0 },
      transparencyScore: { type: Number, default: 0 },
    },

    // ── Findings ──────────────────────────────────────────────────────────────
    permissions: [permissionSchema],
    redFlags: [redFlagSchema],
    policyFindings: policyFindingSchema,

    // ── NLP Output ───────────────────────────────────────────────────────────
    sentiment: {
      overall: { type: String, enum: ['hostile', 'neutral', 'protective'] },
      score: Number,
      details: mongoose.Schema.Types.Mixed,
    },
    summary: {
      bullets: [String],   // 3–5 key bullets
      tldr: String,     // one-sentence summary
      highlights: [String],   // best and worst clauses
    },

    // ── Raw Data ─────────────────────────────────────────────────────────────
    policyText: {
      type: String,
      select: false,   // excluded from default queries (can be large)
    },
    policyUrl: String,
    pageTitle: String,

    // ── Change Tracking ───────────────────────────────────────────────────────
    tracked: { type: Boolean, default: false },
    trackingSince: Date,
    lastChecked: Date,
    changeHistory: [
      {
        date: Date,
        riskScore: Number,
        diff: String,  // summary of what changed
      },
    ],

    // ── Meta ──────────────────────────────────────────────────────────────────
    source: {
      type: String,
      enum: ['web', 'extension', 'api', 'paste'],
      default: 'web',
    },
    scanDurationMs: Number,
    engineVersion: { type: String, default: '1.0.0' },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save: derive riskLabel from score ─────────────────────────────────
scanSchema.pre('save', function (next) {
  if (this.riskScore !== null && this.riskScore !== undefined) {
    if (this.riskScore <= 20) this.riskLabel = 'safe';
    else if (this.riskScore <= 40) this.riskLabel = 'low';
    else if (this.riskScore <= 60) this.riskLabel = 'moderate';
    else if (this.riskScore <= 80) this.riskLabel = 'high';
    else this.riskLabel = 'critical';
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ targetUrl: 1 });
scanSchema.index({ riskScore: -1 });
scanSchema.index({ tracked: 1, userId: 1 });

module.exports = mongoose.model('Scan', scanSchema);
