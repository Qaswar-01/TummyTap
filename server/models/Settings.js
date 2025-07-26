const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'general'
  }
}, {
  timestamps: true
});

// Static method to get setting value
settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting value
settingsSchema.statics.setValue = async function(key, value, type = 'string', description = '', category = 'general') {
  return await this.findOneAndUpdate(
    { key },
    { value, type, description, category },
    { upsert: true, new: true }
  );
};

module.exports = mongoose.model('Settings', settingsSchema);