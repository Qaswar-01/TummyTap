const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_ordering_db');
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    // await User.deleteMany({});

    // Create admin user with your specified credentials
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@demo.com',
        number: '1234567890',
        password: 'admin123',
        isAdmin: true,
        address: '123 Admin Street, Admin City'
      });
      await adminUser.save();
      console.log('Admin user created: admin@demo.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create regular user
    const userExists = await User.findOne({ email: 'user@demo.com' });
    if (!userExists) {
      const regularUser = new User({
        name: 'Demo User',
        email: 'user@demo.com',
        number: '0987654321',
        password: 'user123',
        isAdmin: false,
        address: '456 User Avenue, User City'
      });
      await regularUser.save();
      console.log('Regular user created: user@demo.com / user123');
    } else {
      console.log('Regular user already exists');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();