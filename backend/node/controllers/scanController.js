const Scan = require('../models/Scan');
const User = require('../models/User');

/**
 * saveScan
 * Persists a new scan result to MongoDB and increments the user's counter.
 * @param {Object} data  - Scan fields to save
 * @returns {Promise<Scan>}
 */
const saveScan = async (data) => {
  const scan = await Scan.create({
    userId:          data.userId,
    targetUrl:       data.targetUrl,
    riskScore:       data.riskScore,
    scoreBreakdown:  data.scoreBreakdown  || {},
    permissions:     data.permissions     || [],
    redFlags:        data.redFlags        || [],
    policyFindings:  data.policyFindings  || {},
    sentiment:       data.sentiment       || {},
    summary:         data.summary         || {},
    policyText:      data.policyText      || null,
    policyUrl:       data.policyUrl       || null,
    pageTitle:       data.pageTitle       || null,
    source:          data.source          || 'web',
    scanDurationMs:  data.scanDurationMs  || null,
  });

  // Increment user quota counter (non-blocking)
  User.findByIdAndUpdate(data.userId, {
    $inc: {
      'apiUsage.scansThisMonth': 1,
      'apiUsage.totalScans': 1,
    },
  }).catch((err) => console.error('Failed to update scan count:', err));

  return scan;
};

/**
 * getUserScans
 * Returns paginated scan history for a user.
 */
const getUserScans = async (userId, page = 1, limit = 10) => {
  const skip  = (page - 1) * limit;
  const total = await Scan.countDocuments({ userId });
  const scans = await Scan.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-policyText'); // exclude raw text for list view

  return {
    scans,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * getScanById
 * Returns a single scan — only if it belongs to the requesting user.
 */
const getScanById = async (scanId, userId) => {
  return Scan.findOne({ _id: scanId, userId }).select('-policyText');
};

/**
 * deleteScan
 * Removes a scan document — only the owner can delete.
 */
const deleteScan = async (scanId, userId) => {
  const result = await Scan.deleteOne({ _id: scanId, userId });
  if (result.deletedCount === 0) {
    throw new Error('Scan not found or not authorized');
  }
  return true;
};

/**
 * getAggregatedStats
 * Returns risk distribution stats for a user's dashboard.
 */
const getAggregatedStats = async (userId) => {
  const stats = await Scan.aggregate([
    { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
    {
      $group: {
        _id:            '$riskLabel',
        count:          { $sum: 1 },
        avgScore:       { $avg: '$riskScore' },
        latestScan:     { $max: '$createdAt' },
      },
    },
    { $sort: { avgScore: -1 } },
  ]);

  return stats;
};

module.exports = {
  saveScan,
  getUserScans,
  getScanById,
  deleteScan,
  getAggregatedStats,
};
