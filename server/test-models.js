// Test script to check if models can be required
try {
  console.log('Testing Settings model...');
  const Settings = require('./models/Settings');
  console.log('Settings model loaded successfully');
  
  console.log('Testing ActivityLog model...');
  const ActivityLog = require('./models/ActivityLog');
  console.log('ActivityLog model loaded successfully');
  
  console.log('All models loaded successfully!');
} catch (error) {
  console.error('Error loading models:', error);
}