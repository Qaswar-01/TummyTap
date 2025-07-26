require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering_db');
    console.log('Connected to MongoDB');

    // Find and update admin@demo.com password
    const existingDemo = await User.findOne({ email: 'admin@demo.com' });
    if (existingDemo) {
      existingDemo.password = 'admin123';
      existingDemo.isAdmin = true; // Ensure admin status
      await existingDemo.save();
      console.log('Updated admin@demo.com password to admin123');
    } else {
      console.log('admin@demo.com not found');
    }

    // Also check for old admin@example.com and update
    const oldAdmin = await User.findOne({ email: 'admin@example.com' });
    if (oldAdmin) {
      oldAdmin.email = 'admin@demo.com';
      oldAdmin.password = 'admin123';
      oldAdmin.isAdmin = true;
      await oldAdmin.save();
      console.log('Updated old admin to new credentials');
    }

    console.log('Admin update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
