# Admin Panel Features

This food ordering system now includes a comprehensive admin panel with PHP-like functionality for managing your application.

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Setup admin functionality:**
   ```bash
   cd server
   npm run setup-admin
   ```

3. **Start the application:**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev
   
   # Terminal 2 - Client
   cd client && npm run dev
   ```

4. **Access admin panel:**
   - URL: `http://localhost:3000/admin`
   - Default credentials:
     - Email: `admin@foodorder.com`
     - Password: `admin123`
   - ⚠️ **Change the default password immediately after first login!**

## 📊 Admin Features

### 1. Dashboard
- **System Overview**: Real-time statistics and metrics
- **Quick Stats**: Orders, revenue, users, products
- **Security Status**: Failed logins, maintenance mode, system health
- **Recent Activity**: Latest orders and user activities
- **Quick Actions**: Direct access to key admin functions

### 2. User Management
- **User Listing**: Paginated view of all users with search and filters
- **User Actions**: 
  - Edit user details (name, email, phone, status)
  - Toggle admin privileges
  - Activate/deactivate users
  - Reset passwords
  - Delete users
- **Bulk Operations**: Select multiple users for batch actions
- **Role Management**: Promote users to admin or demote admins
- **Export**: Download user data as JSON

### 3. System Management
- **System Information**: 
  - Server details (platform, architecture, uptime)
  - Database statistics and collection info
  - Memory and CPU usage
  - Node.js version and process info
- **Security Audit**:
  - User statistics and login attempts
  - Failed login monitoring
  - Password reset tracking
  - System error monitoring
- **System Actions**:
  - Create database backups
  - Clear cache and temporary data
  - Toggle maintenance mode
  - Refresh system data

### 4. Settings Management
- **Categorized Settings**: Organized by functionality
  - General (site name, contact info, maintenance mode)
  - Orders (minimum amount, delivery fees, timeouts)
  - Payment (methods, currency, tax rates)
  - Email (SMTP configuration)
  - Security (login attempts, session timeout)
  - Notifications (admin alerts, email notifications)
- **Setting Types**: String, number, boolean, object, array
- **Bulk Operations**: Update multiple settings at once
- **Import/Export**: Backup and restore settings
- **Default Initialization**: One-click setup of default values

### 5. Email Templates
- **Template Management**: 
  - Welcome emails
  - Order confirmations
  - Order delivery notifications
  - Password reset emails
- **Template Editor**: HTML editor with variable support
- **Preview System**: See how emails will look with sample data
- **Variable Support**: Dynamic content with placeholders
  - `{{site_name}}`, `{{user_name}}`, `{{order_id}}`, etc.

### 6. Activity Logging
- **Comprehensive Tracking**: All admin actions are logged
- **Filterable Logs**: Search by user, action, resource, date range
- **Activity Summary**: Charts and statistics
- **User Activity**: Track most active users and admins
- **Security Events**: Monitor login attempts and security issues
- **Cleanup Tools**: Remove old logs automatically

### 7. Analytics & Reporting
- **Sales Analytics**: Monthly revenue and order trends
- **Category Performance**: Sales by product category
- **User Analytics**: Registration and activity patterns
- **System Performance**: Database and server metrics

## 🔐 Security Features

### Authentication & Authorization
- **Role-based Access**: Admin-only routes and functions
- **JWT Authentication**: Secure token-based auth
- **Session Management**: Configurable timeout settings
- **Password Security**: Minimum length requirements

### Activity Monitoring
- **Login Tracking**: Monitor successful and failed attempts
- **Action Logging**: All admin actions are recorded
- **Security Audit**: Regular security status reports
- **Maintenance Mode**: Disable public access when needed

### Data Protection
- **Input Validation**: All forms use validation
- **SQL Injection Prevention**: MongoDB with proper queries
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Secure form submissions

## 🛠️ Technical Implementation

### Backend (Node.js/Express)
- **Modular Routes**: Organized admin endpoints
- **Middleware**: Authentication and validation
- **Models**: MongoDB schemas for all data
- **Activity Logging**: Automatic action tracking
- **Error Handling**: Comprehensive error management

### Frontend (React)
- **Modern UI**: Clean, responsive admin interface
- **Component-based**: Reusable UI components
- **State Management**: React hooks and context
- **Form Handling**: Validation and error display
- **Real-time Updates**: Live data refresh

### Database (MongoDB)
- **Flexible Schema**: Easy to extend and modify
- **Indexing**: Optimized queries for performance
- **Aggregation**: Complex analytics queries
- **Backup Support**: Export/import functionality

## 📝 API Endpoints

### Admin Routes (`/api/admin/`)
- `GET /dashboard` - Dashboard statistics
- `GET /users` - User management
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/bulk-action` - Bulk user operations
- `GET /system/info` - System information
- `GET /system/database-stats` - Database statistics
- `POST /system/backup` - Create backup
- `GET /security/audit` - Security audit

### Settings Routes (`/api/settings/`)
- `GET /` - Get all settings
- `PUT /:key` - Update setting
- `DELETE /:key` - Delete setting
- `POST /initialize` - Initialize defaults
- `GET /export/backup` - Export settings
- `POST /import/restore` - Import settings

### Activity Logs (`/api/activity-logs/`)
- `GET /` - Get activity logs
- `GET /summary` - Activity summary
- `DELETE /cleanup` - Clean old logs

## 🎨 Customization

### Adding New Settings
1. Add to default settings in `setup-admin.js`
2. Update settings categories in frontend
3. Add validation rules if needed

### Adding New Admin Pages
1. Create React component in `client/src/pages/admin/`
2. Add route to `AdminLayout.jsx`
3. Create corresponding API endpoints
4. Add activity logging for actions

### Extending User Management
1. Add fields to User model
2. Update user forms and validation
3. Add to export functionality
4. Update activity logging

## 🔧 Configuration

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/foodorder
JWT_SECRET=your-secret-key
PORT=5000
```

### Default Settings
All configurable through the admin panel:
- Site information and branding
- Order processing rules
- Payment and pricing
- Email configuration
- Security policies
- Notification preferences

## 📚 Usage Examples

### Creating Admin User Programmatically
```javascript
const user = new User({
  name: 'Admin Name',
  email: 'admin@example.com',
  number: '1234567890',
  password: 'securepassword',
  isAdmin: true,
  isActive: true
});
await user.save();
```

### Adding Custom Settings
```javascript
await Settings.setValue(
  'custom_setting',
  'custom_value',
  'string',
  'Description of setting',
  'custom_category'
);
```

### Logging Admin Actions
```javascript
await ActivityLog.logActivity(
  userId,
  'action_name',
  'resource_type',
  resourceId,
  { additional: 'data' },
  req
);
```

## 🚀 Production Deployment

1. **Security Checklist**:
   - Change default admin password
   - Configure proper SMTP settings
   - Set strong JWT secret
   - Enable HTTPS
   - Configure firewall rules

2. **Performance Optimization**:
   - Set up database indexes
   - Configure caching
   - Optimize image uploads
   - Set up CDN for static assets

3. **Monitoring**:
   - Set up log rotation
   - Monitor system resources
   - Configure backup schedules
   - Set up error alerting

## 🤝 Support

For issues or questions about the admin panel:
1. Check the activity logs for error details
2. Review system information for resource issues
3. Check security audit for authentication problems
4. Use the backup/restore functionality for data recovery

The admin panel provides comprehensive tools for managing your food ordering system, similar to popular PHP admin frameworks but built with modern JavaScript technologies.