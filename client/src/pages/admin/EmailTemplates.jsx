import { useState, useEffect } from 'react';
import { Mail, Edit, Save, X, Plus, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const defaultTemplates = [
    {
      name: 'welcome',
      displayName: 'Welcome Email',
      description: 'Sent to new users after registration',
      defaultSubject: 'Welcome to {{site_name}}!',
      defaultBody: `
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
    {
      name: 'order_confirmation',
      displayName: 'Order Confirmation',
      description: 'Sent when an order is placed',
      defaultSubject: 'Order Confirmation #{{order_id}}',
      defaultBody: `
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
    {
      name: 'order_delivered',
      displayName: 'Order Delivered',
      description: 'Sent when an order is delivered',
      defaultSubject: 'Your order has been delivered!',
      defaultBody: `
        <h1>Order Delivered!</h1>
        <p>Hi {{user_name}},</p>
        <p>Great news! Your order #{{order_id}} has been successfully delivered.</p>
        <p>We hope you enjoy your meal!</p>
        <p>Please rate your experience and let us know how we did.</p>
        <p>Thank you for choosing {{site_name}}!</p>
      `
    },
    {
      name: 'password_reset',
      displayName: 'Password Reset',
      description: 'Sent when user requests password reset',
      defaultSubject: 'Reset your password',
      defaultBody: `
        <h1>Password Reset Request</h1>
        <p>Hi {{user_name}},</p>
        <p>You requested to reset your password for your {{site_name}} account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{reset_link}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching email templates...');
      const response = await axios.get('/api/admin/email-templates');
      console.log('Email templates response:', response.data);
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
      // Set empty array so component still renders
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (templateName, subject, body) => {
    try {
      await axios.put(`/api/admin/email-templates/${templateName}`, {
        subject,
        body
      });
      toast.success('Template saved successfully');
      fetchTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const getTemplateData = (templateName) => {
    const existing = templates.find(t => t.key === `email_template_${templateName}`);
    const defaultTemplate = defaultTemplates.find(t => t.name === templateName);
    
    if (existing) {
      return {
        subject: existing.value.subject,
        body: existing.value.body,
        ...defaultTemplate
      };
    }
    
    return defaultTemplate ? {
      subject: defaultTemplate.defaultSubject,
      body: defaultTemplate.defaultBody,
      ...defaultTemplate
    } : null;
  };

  const previewTemplateWithData = (template) => {
    const sampleData = {
      site_name: 'Food Ordering System',
      user_name: 'John Doe',
      contact_email: 'support@foodorder.com',
      order_id: '12345',
      order_total: '25.99',
      order_status: 'Confirmed',
      delivery_time: '30-45 minutes',
      reset_link: '#'
    };

    let subject = template.subject;
    let body = template.body;

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return { subject, body };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {defaultTemplates.map((template) => {
            const templateData = getTemplateData(template.name);
            const isEditing = editingTemplate === template.name;

            return (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{template.displayName}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setPreviewTemplate(templateData);
                        setShowPreview(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTemplate(isEditing ? null : template.name)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title={isEditing ? 'Cancel' : 'Edit'}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <EditTemplateForm
                    template={templateData}
                    onSave={(subject, body) => saveTemplate(template.name, subject, body)}
                    onCancel={() => setEditingTemplate(null)}
                  />
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {templateData?.subject || 'Not configured'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Body Preview</label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm max-h-32 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ 
                          __html: templateData?.body?.substring(0, 200) + '...' || 'Not configured'
                        }} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewTemplate && (
            <PreviewModal
              template={previewTemplate}
              onClose={() => {
                setShowPreview(false);
                setPreviewTemplate(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

// Edit Template Form Component
const EditTemplateForm = ({ template, onSave, onCancel }) => {
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');

  const handleSave = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }
    onSave(subject, body);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Email subject..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Email body HTML..."
        />
      </div>
      
      <div className="text-xs text-gray-500">
        Available variables: {{site_name}}, {{user_name}}, {{contact_email}}, {{order_id}}, {{order_total}}, {{order_status}}, {{delivery_time}}, {{reset_link}}
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Template
        </button>
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ template, onClose }) => {
  const previewData = previewTemplateWithData(template);

  const previewTemplateWithData = (template) => {
    const sampleData = {
      site_name: 'Food Ordering System',
      user_name: 'John Doe',
      contact_email: 'support@foodorder.com',
      order_id: '12345',
      order_total: '25.99',
      order_status: 'Confirmed',
      delivery_time: '30-45 minutes',
      reset_link: '#'
    };

    let subject = template.subject;
    let body = template.body;

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return { subject, body };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="text-sm text-gray-600 mb-2">Subject:</div>
              <div className="font-medium">{previewData.subject}</div>
            </div>
            <div className="p-6 bg-white">
              <div dangerouslySetInnerHTML={{ __html: previewData.body }} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmailTemplates;