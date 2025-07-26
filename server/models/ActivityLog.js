const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true // e.g., 'user', 'product', 'order', 'settings'
  },
  resourceId: {
    type: String,
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(userId, action, resource, resourceId = null, details = {}, req = null) {
  const logData = {
    user: userId,
    action,
    resource,
    resourceId,
    details
  };

  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
  }

  return await this.create(logData);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);