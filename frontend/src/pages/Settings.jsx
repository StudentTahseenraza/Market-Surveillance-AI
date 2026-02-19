// frontend/src/pages/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  KeyIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.full_name || '',
    role: user?.role || '',
    department: 'Market Surveillance',
    phone: '+91 98765 43210'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    anomalyNotifications: true,
    reportReady: true,
    dailyDigest: false,
    weeklyReport: true,
    smsAlerts: false
  });

  const [thresholds, setThresholds] = useState({
    priceZscore: 2.5,
    volumeZscore: 2.5,
    volatilityThreshold: 5,
    riskHigh: 70,
    riskMedium: 30,
    anomalyConfidence: 0.8
  });

  const [apiKeys, setApiKeys] = useState([
    { name: 'Alpha Vantage', key: '••••••••••••••••', status: 'active' },
    { name: 'News API', key: '••••••••••••••••', status: 'active' }
  ]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThresholds = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Detection thresholds updated!');
    } catch (error) {
      toast.error('Failed to update thresholds');
    } finally {
      setLoading(false);
    }
  };

  const generateNewKey = (keyName) => {
    if (confirm(`Generate new API key for ${keyName}?`)) {
      toast.info(`New key generated for ${keyName}`);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'thresholds', name: 'Detection Thresholds', icon: ChartBarIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon, adminOnly: true },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your preferences and system settings
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            if (tab.adminOnly && !isAdmin) return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-800 text-primary-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <tab.icon className={`w-5 h-5 mr-2 ${
                  activeTab === tab.id ? 'text-primary-800' : 'text-gray-400'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Email Alerts</p>
                  <p className="text-sm text-gray-500">Receive alerts via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BellIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Anomaly Notifications</p>
                  <p className="text-sm text-gray-500">Get notified when anomalies are detected</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.anomalyNotifications}
                  onChange={(e) => setNotifications({ ...notifications, anomalyNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Report Ready</p>
                  <p className="text-sm text-gray-500">Notification when reports are generated</p>
                </div>
              </div>
              <label className="relative inline-flex items-container cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.reportReady}
                  onChange={(e) => setNotifications({ ...notifications, reportReady: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Daily Digest</p>
                  <p className="text-sm text-gray-500">Daily summary of market activity</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.dailyDigest}
                  onChange={(e) => setNotifications({ ...notifications, dailyDigest: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">SMS Alerts</p>
                  <p className="text-sm text-gray-500">Critical alerts via SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.smsAlerts}
                  onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveNotifications}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Detection Thresholds */}
      {activeTab === 'thresholds' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Detection Thresholds</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Z-Score Threshold: {thresholds.priceZscore}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={thresholds.priceZscore}
                onChange={(e) => setThresholds({ ...thresholds, priceZscore: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">Higher values = fewer but more severe anomalies</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume Z-Score Threshold: {thresholds.volumeZscore}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={thresholds.volumeZscore}
                onChange={(e) => setThresholds({ ...thresholds, volumeZscore: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volatility Threshold (%): {thresholds.volatilityThreshold}
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={thresholds.volatilityThreshold}
                onChange={(e) => setThresholds({ ...thresholds, volatilityThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  High Risk Threshold: {thresholds.riskHigh}
                </label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={thresholds.riskHigh}
                  onChange={(e) => setThresholds({ ...thresholds, riskHigh: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medium Risk Threshold: {thresholds.riskMedium}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={thresholds.riskMedium}
                  onChange={(e) => setThresholds({ ...thresholds, riskMedium: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Configuration:</strong> Price anomalies at {thresholds.priceZscore}σ, 
                Volume anomalies at {thresholds.volumeZscore}σ. Risk levels: 
                Low (0-{thresholds.riskMedium}), Medium ({thresholds.riskMedium}-{thresholds.riskHigh}), 
                High ({thresholds.riskHigh}-100)
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveThresholds}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Update Thresholds'}
            </button>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && isAdmin && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h2>
          <div className="space-y-4">
            {apiKeys.map((key, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500">Key: {key.key}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {key.status}
                  </span>
                  <button
                    onClick={() => generateNewKey(key.name)}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;