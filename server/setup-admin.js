const mongoose = require('mongoose');
const User = require('./models/User');
const Settings = require('./models/Settings');
require('dotenv').config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create default admin user if none exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@foodorder.com',
        number: '1234567890',
        password: 'admin123',
        isAdmin: true,
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created');
      console.log('Email: admin@foodorder.com');
      console.log('Password: admin123');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Initialize default settings
    const defaultSettings = [
      // General Settings
      { key: 'site_name', value: 'Food Ordering System', type: 'string', description: 'Website name', category: 'general' },
      { key: 'site_description', value: 'Best food ordering platform', type: 'string', description: 'Website description', category: 'general' },
      { key: 'contact_email', value: 'admin@foodorder.com', type: 'string', description: 'Contact email address', category: 'general' },
      { key: 'contact_phone', value: '+1234567890', type: 'string', description: 'Contact phone number', category: 'general' },
      { key: 'maintenance_mode', value: false, type: 'boolean', description: 'Enable maintenance mode', category: 'general' },
      
      // Order Settings
      { key: 'min_order_amount', value: 10, type: 'number', description: 'Minimum order amount', category: 'orders' },
      { key: 'delivery_fee', value: 5, type: 'number', description: 'Delivery fee', category: 'orders' },
      { key: 'free_delivery_threshold', value: 50, type: 'number', description: 'Free delivery threshold', category: 'orders' },
      { key: 'order_timeout', value: 30, type: 'number', description: 'Order timeout in minutes', category: 'orders' },
      
      // Payment Settings
      { key: 'payment_methods', value: ['cash', 'card', 'paypal'], type: 'array', description: 'Available payment methods', category: 'payment' },
      { key: 'currency', value: 'USD', type: 'string', description: 'Default currency', category: 'payment' },
      { key: 'tax_rate', value: 8.5, type: 'number', description: 'Tax rate percentage', category: 'payment' },
      
      // Email Settings
      { key: 'smtp_host', value: 'smtp.gmail.com', type: 'string', description: 'SMTP host', category: 'email' },
      { key: 'smtp_port', value: 587, type: 'number', description: 'SMTP port', category: 'email' },
      { key: 'smtp_username', value: '', type: 'string', description: 'SMTP username', category: 'email' },
      { key: 'smtp_password', value: '', type: 'string', description: 'SMTP password', category: 'email' },
      { key: 'email_from', value: 'noreply@foodorder.com', type: 'string', description: 'From email address', category: 'email' },
      
      // Security Settings
      { key: 'max_login_attempts', value: 5, type: 'number', description: 'Maximum login attempts', category: 'security' },
      { key: 'session_timeout', value: 24, type: 'number', description: 'Session timeout in hours', category: 'security' },
      { key: 'password_min_length', value: 8, type: 'number', description: 'Minimum password length', category: 'security' },
      { key: 'require_email_verification', value: true, type: 'boolean', description: 'Require email verification', category: 'security' },
      
      // Notification Settings
      { key: 'admin_notifications', value: true, type: 'boolean', description: 'Enable admin notifications', category: 'notifications' },
      { key: 'order_notifications', value: true, type: 'boolean', description: 'Enable order notifications', category: 'notifications' },
      { key: 'email_notifications', value: true, type: 'boolean', description: 'Enable email notifications', category: 'notifications' }
    ];

    let settingsCreated = 0;
    for (const setting of defaultSettings) {
      const existing = await Settings.findOne({ key: setting.key });
      if (!existing) {
        await Settings.create(setting);
        settingsCreated++;
      }
    }

    console.log(`✅ Created ${settingsCreated} default settings`);

    // Initialize email templates
    const emailTemplates = [
      {
        key: 'email_template_welcome',
        value: {
          subject: 'Welcome to {{site_name}}!',
          body: `
            <h1>Welcome to {{site_name}}!</h1>
            <p>Hi {{user_name}},</p>
            <p>Thank you for joining our food ordering platform. We're excited to have you on board!</p>
            <p>You can now:</p>
            <ul>
              <li>Browse our delicious menu</li>
              <li>Place orders for delivery</li>
              <li>Track your order status</li>
              <li>Save your favorite items</li>
            </ul>
            <p>If you have any questions, feel free to contact us at {{contact_email}}.</p>
            <p>Happy ordering!</p>
            <p>The {{site_name}} Team</p>
          `
        },
        type: 'object',
        description: 'Welcome email template',
        category: 'email_templates'
      },
      {
        key: 'email_template_order_confirmation',
        value: {
          subject: 'Order Confirmation #{{order_id}}',
          body: `
            <h1>Order Confirmation</h1>
            <p>Hi {{user_name}},</p>
            <p>Thank you for your order! Here are the details:</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
              <h3>Order #{{order_id}}</h3>
              <p><strong>Total:</strong> ${{order_total}}</p>
              <p><strong>Status:</strong> {{order_status}}</p>
              <p><strong>Estimated Delivery:</strong> {{delivery_time}}</p>
            </div>
            <p>You can track your order status in your account dashboard.</p>
            <p>Thank you for choosing {{site_name}}!</p>
          `
        },
        type: 'object',
        description: 'Order confirmation email template',
        category: 'email_templates'
      }
    ];

    let templatesCreated = 0;
    for (const template of emailTemplates) {
      const existing = await Settings.findOne({ key: template.key });
      if (!existing) {
        await Settings.create(template);
        templatesCreated++;
      }
    }

    console.log(`✅ Created ${templatesCreated} email templates`);

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Login to admin panel: http://localhost:3000/admin');
    console.log('3. Change the default admin password');
    console.log('4. Configure your settings in the admin panel');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run setup
setupAdmin();