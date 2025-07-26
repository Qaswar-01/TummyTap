const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get activity logs with pagination and filtering
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      user, 
      resource, 
      action,
      startDate,
      endDate 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (user) filter.user = user;
    if (resource) filter.resource = resource;
    if (action) filter.action = action;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Activity by action
    const actionSummary = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Activity by resource
    const resourceSummary = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily activity
    const dailyActivity = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Most active users
    const activeUsers = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          count: 1
        }
      }
    ]);

    res.json({
      actionSummary,
      resourceSummary,
      dailyActivity,
      activeUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear old logs
router.delete('/cleanup', adminAuth, async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    // Log this cleanup activity
    await ActivityLog.logActivity(
      req.user._id,
      'cleanup',
      'activity_logs',
      null,
      { deletedCount: result.deletedCount, days },
      req
    );

    res.json({ 
      message: `Cleaned up ${result.deletedCount} old activity logs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;