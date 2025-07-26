const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/Message');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    // Calculate revenue
    const pendingRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const completedRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get other counts
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const unreadMessages = await Message.countDocuments({ isRead: false });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        pendingRevenue: pendingRevenue[0]?.total || 0,
        completedRevenue: completedRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
        totalAdmins,
        unreadMessages
      },
      recentOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ isAdmin: false });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', [
  adminAuth,
  body('name').optional().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail(),
  body('number').optional().isLength({ min: 10, max: 10 }),
  body('isActive').optional().isBoolean(),
  body('isAdmin').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, number, isActive, isAdmin } = req.body;
    const oldData = { ...user.toObject() };

    if (name) user.name = name;
    if (email) user.email = email;
    if (number) user.number = number;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;

    await user.save();

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'update',
      'user',
      user._id,
      { oldData, newData: user.toObject() },
      req
    );

    res.json({ message: 'User updated successfully', user: user.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'delete',
      'user',
      req.params.id,
      { deletedUser: user.toObject() },
      req
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new admin user
router.post('/users/admin', [
  adminAuth,
  body('name').isLength({ min: 1, max: 50 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('number').isLength({ min: 10, max: 10 }).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, number, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newAdmin = new User({
      name,
      email,
      number,
      password,
      isAdmin: true,
      isActive: true
    });

    await newAdmin.save();

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'create',
      'admin_user',
      newAdmin._id,
      { createdAdmin: { name, email, number } },
      req
    );

    res.status(201).json({ 
      message: 'Admin user created successfully',
      user: { ...newAdmin.toObject(), password: undefined }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', [
  adminAuth,
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { newPassword } = req.body;
    user.password = newPassword;
    await user.save();

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'reset_password',
      'user',
      user._id,
      { targetUser: user.email },
      req
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk user actions
router.post('/users/bulk-action', [
  adminAuth,
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('Invalid action'),
  body('userIds').isArray().withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, userIds } = req.body;
    let result = { success: 0, failed: 0, errors: [] };

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (!user) {
          result.failed++;
          result.errors.push(`User ${userId} not found`);
          continue;
        }

        if (user.isAdmin && (action === 'delete' || action === 'deactivate')) {
          result.failed++;
          result.errors.push(`Cannot ${action} admin user ${user.email}`);
          continue;
        }

        switch (action) {
          case 'activate':
            user.isActive = true;
            await user.save();
            break;
          case 'deactivate':
            user.isActive = false;
            await user.save();
            break;
          case 'delete':
            await User.findByIdAndDelete(userId);
            break;
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Error processing user ${userId}: ${error.message}`);
      }
    }

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'bulk_action',
      'users',
      null,
      { action, userIds, result },
      req
    );

    res.json({
      message: `Bulk action completed: ${result.success} successful, ${result.failed} failed`,
      result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Monthly sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category-wise sales
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          itemCount: { $sum: '$items.quantity' }
        }
      }
    ]);

    res.json({
      monthlySales,
      categorySales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// System information
router.get('/system/info', adminAuth, async (req, res) => {
  try {
    const os = require('os');
    const process = require('process');
    
    const systemInfo = {
      server: {
        platform: os.platform(),
        architecture: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length
      },
      node: {
        version: process.version,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid
      },
      database: {
        connected: require('mongoose').connection.readyState === 1,
        collections: await require('mongoose').connection.db.listCollections().toArray()
      }
    };

    res.json(systemInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// System statistics for analytics page
router.get('/system-stats', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Weekly stats
    const weeklyOrders = await Order.countDocuments({
      createdAt: { $gte: weekAgo }
    });
    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Monthly stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: monthAgo }
    });
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: monthAgo }, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: monthAgo }
    });

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          name: { $first: '$product.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      weekly: {
        orders: weeklyOrders,
        revenue: weeklyRevenue[0]?.total || 0
      },
      monthly: {
        orders: monthlyOrders,
        revenue: monthlyRevenue[0]?.total || 0,
        newUsers: newUsers
      },
      topProducts: topProducts
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Database statistics
router.get('/system/database-stats', adminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Get basic database info
    let stats = {};
    try {
      stats = await db.stats();
    } catch (error) {
      console.error('Error getting database stats:', error);
      stats = {
        db: db.databaseName,
        collections: 'N/A',
        dataSize: 'N/A',
        storageSize: 'N/A',
        indexes: 'N/A'
      };
    }

    const collections = await db.listCollections().toArray();
    
    const collectionStats = {};
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).estimatedDocumentCount();
        const indexes = await db.collection(collection.name).indexes();

        collectionStats[collection.name] = {
          count: count,
          size: 'N/A', // Size info not easily available in newer MongoDB versions
          avgObjSize: 'N/A',
          storageSize: 'N/A',
          indexes: indexes.length
        };
      } catch (error) {
        console.error(`Error getting stats for collection ${collection.name}:`, error);
        collectionStats[collection.name] = {
          count: 0,
          size: 'Error',
          avgObjSize: 'Error',
          storageSize: 'Error',
          indexes: 0
        };
      }
    }

    res.json({
      database: stats,
      collections: collectionStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cache/temporary data
router.post('/system/clear-cache', adminAuth, async (req, res) => {
  try {
    // Clear old activity logs (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const deletedLogs = await ActivityLog.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });

    // Log this action
    await ActivityLog.logActivity(
      req.user._id,
      'clear_cache',
      'system',
      null,
      { deletedLogs: deletedLogs.deletedCount },
      req
    );

    res.json({
      message: 'Cache cleared successfully',
      deletedLogs: deletedLogs.deletedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backup database
router.post('/system/backup', adminAuth, async (req, res) => {
  try {
    const collections = ['users', 'products', 'orders', 'messages', 'settings'];
    const backup = {
      timestamp: new Date().toISOString(),
      data: {}
    };

    for (const collectionName of collections) {
      const Model = require(`../models/${collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1)}`);
      backup.data[collectionName] = await Model.find({});
    }

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'backup',
      'system',
      null,
      { collections, recordCount: Object.values(backup.data).reduce((sum, arr) => sum + arr.length, 0) },
      req
    );

    res.json(backup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email template management
router.get('/email-templates', adminAuth, async (req, res) => {
  try {
    const templates = await Settings.find({ category: 'email_templates' });
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/email-templates/:templateName', [
  adminAuth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Body is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, body } = req.body;
    const templateName = req.params.templateName;

    const template = await Settings.setValue(
      `email_template_${templateName}`,
      { subject, body },
      'object',
      `Email template for ${templateName}`,
      'email_templates'
    );

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'update',
      'email_template',
      template._id,
      { templateName, subject },
      req
    );

    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Security audit
router.get('/security/audit', adminAuth, async (req, res) => {
  try {
    const audit = {
      users: {
        total: await User.countDocuments(),
        admins: await User.countDocuments({ isAdmin: true }),
        inactive: await User.countDocuments({ isActive: false }),
        recentLogins: await ActivityLog.countDocuments({
          action: 'login',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      },
      security: {
        failedLogins: await ActivityLog.countDocuments({
          action: 'failed_login',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        passwordResets: await ActivityLog.countDocuments({
          action: 'reset_password',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      },
      system: {
        maintenanceMode: await Settings.getValue('maintenance_mode', false),
        lastBackup: await ActivityLog.findOne({ action: 'backup' }).sort({ createdAt: -1 }),
        recentErrors: await ActivityLog.countDocuments({
          action: 'error',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
      }
    };

    res.json(audit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle maintenance mode
router.post('/system/maintenance', adminAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    await Settings.setValue('maintenance_mode', enabled, 'boolean', 'System maintenance mode');

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      enabled ? 'enable_maintenance' : 'disable_maintenance',
      'system',
      null,
      { maintenanceMode: enabled },
      req
    );

    res.json({ 
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = user.isAdmin;
    user.isAdmin = isAdmin;
    await user.save();

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'role_change',
      'user',
      user._id,
      { 
        targetUser: user.email,
        oldRole: oldRole ? 'admin' : 'user',
        newRole: isAdmin ? 'admin' : 'user'
      },
      req
    );

    res.json({ 
      message: `User role updated to ${isAdmin ? 'admin' : 'user'}`,
      user: user.toObject()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export users
router.get('/export/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        number: user.number,
        address: user.address,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    };

    // Log activity
    await ActivityLog.logActivity(
      req.user._id,
      'export',
      'users',
      null,
      { exportedCount: users.length },
      req
    );

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;