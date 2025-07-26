// Test script to check if routes can be required
try {
  console.log('Testing settings route...');
  const settingsRoute = require('./routes/settings');
  console.log('Settings route loaded successfully');
  console.log('Type:', typeof settingsRoute);
  
  console.log('Testing activity-logs route...');
  const activityLogsRoute = require('./routes/activity-logs');
  console.log('Activity-logs route loaded successfully');
  console.log('Type:', typeof activityLogsRoute);
  
  console.log('All routes loaded successfully!');
} catch (error) {
  console.error('Error loading routes:', error);
}