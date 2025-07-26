import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Settings as SettingsIcon, Globe, Mail, DollarSign, Shield } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const initializeSettings = async () => {
    try {
      setSaving(true);
      await axios.post('/api/settings/initialize');
      await fetchSettings();
      toast.success('Default settings initialized successfully');
    } catch (error) {
      console.error('Error initializing settings:', error);
      toast.error('Failed to initialize settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key, value, type = 'string') => {
    try {
      await axios.put(`/api/settings/${key}`, { value, type });
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const handleInputChange = (category, key, value, type = 'string') => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category]?.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      ) || []
    }));
  };

  const handleSave = async (category, key, value, type) => {
    await updateSetting(key, value, type);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'general': return Globe;
      case 'contact': return Mail;
      case 'pricing': return DollarSign;
      case 'system': return Shield;
      default: return SettingsIcon;
    }
  };

  const renderSettingInput = (setting, category) => {
    const { key, value, type, description } = setting;

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => {
                handleInputChange(category, key, e.target.checked, type);
                handleSave(category, key, e.target.checked, type);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-600">{description}</label>
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(category, key, parseFloat(e.target.value) || 0, type)}
            onBlur={(e) => handleSave(category, key, parseFloat(e.target.value) || 0, type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step="0.01"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(category, key, e.target.value, type)}
            onBlur={(e) => handleSave(category, key, e.target.value, type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          
          <button
            onClick={initializeSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            Initialize Defaults
          </button>
        </div>

        {Object.keys(settings).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settings Found</h3>
            <p className="text-gray-600 mb-4">Initialize default settings to get started.</p>
            <button
              onClick={initializeSettings}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 mx-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
              Initialize Settings
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(settings).map(([category, categorySettings]) => {
              const Icon = getCategoryIcon(category);
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center mb-6">
                    <Icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold capitalize">{category}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {categorySettings.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 capitalize">
                          {setting.key.replace(/_/g, ' ')}
                        </label>
                        {renderSettingInput(setting, category)}
                        {setting.description && (
                          <p className="text-xs text-gray-500">{setting.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;