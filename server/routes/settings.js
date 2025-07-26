const express = require('express');
const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all settings grouped by category
router.get('/', adminAuth, async (req, res) => {
    try {
        const settings = await Settings.find().sort({ category: 1, key: 1 });

        // Group settings by category
        const groupedSettings = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});

        res.json(groupedSettings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific setting by key
router.get('/:key', adminAuth, async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update or create setting
router.put('/:key', [
    adminAuth,
    body('value').notEmpty().withMessage('Value is required'),
    body('type').isIn(['string', 'number', 'boolean', 'object', 'array']).withMessage('Invalid type'),
    body('description').optional().isString(),
    body('category').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { value, type, description, category } = req.body;
        const key = req.params.key;

        // Convert value based on type
        let convertedValue = value;
        switch (type) {
            case 'number':
                convertedValue = Number(value);
                break;
            case 'boolean':
                convertedValue = Boolean(value);
                break;
            case 'object':
                convertedValue = typeof value === 'string' ? JSON.parse(value) : value;
                break;
            case 'array':
                if (typeof value === 'string') {
                    // Handle comma-separated values like "cash,card,paypal"
                    if (value.startsWith('[') && value.endsWith(']')) {
                        // It's already JSON array format
                        convertedValue = JSON.parse(value);
                    } else {
                        // It's comma-separated values
                        convertedValue = value.split(',').map(item => item.trim());
                    }
                } else {
                    convertedValue = value;
                }
                break;
        }

        const setting = await Settings.setValue(
            key,
            convertedValue,
            type,
            description || '',
            category || 'general'
        );

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'update',
            'settings',
            setting._id,
            { key, oldValue: setting.value, newValue: convertedValue },
            req
        );

        res.json(setting);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete setting
router.delete('/:key', adminAuth, async (req, res) => {
    try {
        const setting = await Settings.findOneAndDelete({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'delete',
            'settings',
            setting._id,
            { key: req.params.key, value: setting.value },
            req
        );

        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize default settings
router.post('/initialize', adminAuth, async (req, res) => {
    try {
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

        let created = 0;
        for (const setting of defaultSettings) {
            const existing = await Settings.findOne({ key: setting.key });
            if (!existing) {
                await Settings.create(setting);
                created++;
            }
        }

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'initialize',
            'settings',
            null,
            { createdCount: created },
            req
        );

        res.json({
            message: `Initialized ${created} default settings`,
            created
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk update settings
router.put('/', adminAuth, async (req, res) => {
    try {
        const { settings } = req.body;
        if (!Array.isArray(settings)) {
            return res.status(400).json({ message: 'Settings must be an array' });
        }

        const results = [];
        for (const setting of settings) {
            const { key, value, type, description, category } = setting;

            // Convert value based on type
            let convertedValue = value;
            switch (type) {
                case 'number':
                    convertedValue = Number(value);
                    break;
                case 'boolean':
                    convertedValue = Boolean(value);
                    break;
                case 'object':
                case 'array':
                    convertedValue = typeof value === 'string' ? JSON.parse(value) : value;
                    break;
            }

            const updatedSetting = await Settings.setValue(
                key,
                convertedValue,
                type,
                description || '',
                category || 'general'
            );

            results.push(updatedSetting);
        }

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'bulk_update',
            'settings',
            null,
            { updatedCount: results.length, keys: settings.map(s => s.key) },
            req
        );

        res.json({
            message: `Updated ${results.length} settings`,
            settings: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export settings (backup)
router.get('/export/backup', adminAuth, async (req, res) => {
    try {
        const settings = await Settings.find().select('-_id -__v -createdAt -updatedAt');

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'export',
            'settings',
            null,
            { exportCount: settings.length },
            req
        );

        res.json({
            exportDate: new Date().toISOString(),
            settings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Import settings (restore)
router.post('/import/restore', adminAuth, async (req, res) => {
    try {
        const { settings, overwrite = false } = req.body;

        if (!Array.isArray(settings)) {
            return res.status(400).json({ message: 'Settings must be an array' });
        }

        let imported = 0;
        let skipped = 0;

        for (const setting of settings) {
            const existing = await Settings.findOne({ key: setting.key });

            if (existing && !overwrite) {
                skipped++;
                continue;
            }

            await Settings.setValue(
                setting.key,
                setting.value,
                setting.type,
                setting.description,
                setting.category
            );
            imported++;
        }

        // Log activity
        await ActivityLog.logActivity(
            req.user._id,
            'import',
            'settings',
            null,
            { imported, skipped, overwrite },
            req
        );

        res.json({
            message: `Imported ${imported} settings, skipped ${skipped}`,
            imported,
            skipped
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;