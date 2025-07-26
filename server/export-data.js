const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const ActivityLog = require('./models/ActivityLog');
const Cart = require('./models/Cart');
const Message = require('./models/Message');
const Settings = require('./models/Settings');

async function exportData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Export data from each collection
    const products = await Product.find();
    const users = await User.find();
    const orders = await Order.find();
    const activityLogs = await ActivityLog.find();
    const carts = await Cart.find();
    const messages = await Message.find();
    const settings = await Settings.find();

    const exportData = {
      products,
      users,
      orders,
      activityLogs,
      carts,
      messages,
      settings
    };

    // Write to file
    fs.writeFileSync(
      path.join(__dirname, 'export-data.json'),
      JSON.stringify(exportData, null, 2)
    );

    console.log('Data exported successfully to export-data.json');
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

exportData();
