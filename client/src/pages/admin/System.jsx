import { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Activity,
  Shield,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const System = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [securityAudit, setSecurityAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const [systemResponse, dbResponse, securityResponse] = await Promise.all([
        axios.get('/api/admin/system/info'),
        axios.get('/api/admin/system/database-stats'),
        axios.get('/api/admin/security/audit')
      ]);

      setSystemInfo(systemResponse.data);
      setDbStats(dbResponse.data);
      setSecurityAudit(securityResponse.data);
      setMaintenanceMode(securityResponse.data.system.maintenanceMode);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      await axios.post('/api/admin/system/maintenance', { 
        enabled: !maintenanceMode 
      });
      setMaintenanceMode(!maintenanceMode);
      toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const clearCache = async () => {
    try {
      const response = await axios.post('/api/admin/system/clear-cache');
      toast.success(response.data.message);
      fetchSystemData();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const createBackup = async () => {
    try {
      const response = await axios.post('/api/admin/system/backup');
      
      // Download the backup
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup created and downloaded successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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
          <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMaintenanceMode}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                maintenanceMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
            
            <button
              onClick={fetchSystemData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Server Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Uptime: {systemInfo && formatUptime(systemInfo.server.uptime)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <p className={`text-2xl font-bold ${systemInfo?.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {systemInfo?.database.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              <Database className={`w-8 h-8 ${systemInfo?.database.connected ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Collections: {systemInfo?.database.collections.length || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-blue-600">
                  {systemInfo && Math.round((1 - systemInfo.server.freeMemory / systemInfo.server.totalMemory) * 100)}%
                </p>
              </div>
              <MemoryStick className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {systemInfo && formatBytes(systemInfo.server.totalMemory - systemInfo.server.freeMemory)} / {systemInfo && formatBytes(systemInfo.server.totalMemory)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Cores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {systemInfo?.server.cpuCount || 0}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Load: {systemInfo?.server.loadAverage?.[0]?.toFixed(2) || 'N/A'}
            </div>
          </motion.div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              System Information
            </h2>
            
            {systemInfo && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{systemInfo.server.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Architecture:</span>
                  <span className="font-medium">{systemInfo.server.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hostname:</span>
                  <span className="font-medium">{systemInfo.server.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js Version:</span>
                  <span className="font-medium">{systemInfo.node.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Process ID:</span>
                  <span className="font-medium">{systemInfo.node.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Uptime:</span>
                  <span className="font-medium">{formatUptime(systemInfo.node.uptime)}</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Statistics
            </h2>
            
            {dbStats && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Size:</span>
                  <span className="font-medium">{formatBytes(dbStats.database.dataSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Storage Size:</span>
                  <span className="font-medium">{formatBytes(dbStats.database.storageSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collections:</span>
                  <span className="font-medium">{dbStats.database.collections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Indexes:</span>
                  <span className="font-medium">{dbStats.database.indexes}</span>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Collection Details:</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(dbStats.collections).map(([name, stats]) => (
                      <div key={name} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{name}:</span>
                        <span className="font-medium">{stats.count} documents</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Security Audit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Audit
          </h2>
          
          {securityAudit && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">User Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">{securityAudit.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin Users:</span>
                    <span className="font-medium">{securityAudit.users.admins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inactive Users:</span>
                    <span className="font-medium">{securityAudit.users.inactive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Logins (24h):</span>
                    <span className="font-medium">{securityAudit.users.recentLogins}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Security Events</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed Logins (24h):</span>
                    <span className={`font-medium ${securityAudit.security.failedLogins > 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {securityAudit.security.failedLogins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Password Resets (7d):</span>
                    <span className="font-medium">{securityAudit.security.passwordResets}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maintenance Mode:</span>
                    <span className={`flex items-center font-medium ${maintenanceMode ? 'text-red-600' : 'text-green-600'}`}>
                      {maintenanceMode ? <AlertTriangle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      {maintenanceMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Backup:</span>
                    <span className="font-medium">
                      {securityAudit.system.lastBackup 
                        ? new Date(securityAudit.system.lastBackup.createdAt).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Errors (24h):</span>
                    <span className={`font-medium ${securityAudit.system.recentErrors > 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {securityAudit.system.recentErrors}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* System Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            System Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={createBackup}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Create Backup
            </button>
            
            <button
              onClick={clearCache}
              className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear Cache
            </button>
            
            <button
              onClick={fetchSystemData}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default System;