import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const RiderSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      rideUpdates: true,
      promotions: false,
      securityAlerts: true,
      emailNotifications: true,
      smsNotifications: false
    },
    privacy: {
      shareLocation: true,
      showProfileToDrivers: true,
      emergencyContactAccess: true
    },
    preferences: {
      language: 'English',
      currency: 'M',
      timezone: 'Africa/Maseru',
      theme: 'light'
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      biometricLogin: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from backend or use defaults
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch settings from the backend
      // const response = await fetch(`${API_BASE_URL}/rider/settings?email=${user.email}`);
      // const data = await response.json();
      // if (data) setSettings(data);
      
      // For now, using default settings
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rider/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          ...settings
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      alert('Error: Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (category, subCategory, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category][subCategory],
          [field]: value
        }
      }
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        notifications: {
          rideUpdates: true,
          promotions: false,
          securityAlerts: true,
          emailNotifications: true,
          smsNotifications: false
        },
        privacy: {
          shareLocation: true,
          showProfileToDrivers: true,
          emergencyContactAccess: true
        },
        preferences: {
          language: 'English',
          currency: 'M',
          timezone: 'Africa/Maseru',
          theme: 'light'
        },
        security: {
          twoFactorAuth: false,
          loginAlerts: true,
          biometricLogin: false
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        {/* Top Navigation */}
        <nav className="navbar navbar-dark bg-primary fixed-top">
          <div className="container-fluid">
            <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
              <span className="navbar-toggler-icon"></span>
            </button>
            <span className="navbar-brand mb-0 h1">
              Settings
            </span>
          </div>
        </nav>
        
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', marginTop: '56px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">
            Settings
          </span>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark">
              {user?.firstName || 'Rider'}
            </span>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header p-3 border-bottom border-secondary">
          <h5 className="text-warning">Rider Portal</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white d-md-none" 
            onClick={toggleSidebar}
          ></button>
        </div>
        
        <nav className="nav flex-column p-3">
          <Link to="/rider/dashboard" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-house me-2"></i>Home
          </Link>
          <Link to="/rider/ride-history" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-clock-history me-2"></i>Ride History
          </Link>
          <Link to="/rider/payment-methods" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-wallet me-2"></i>Payment Methods
          </Link>
          <Link to="/rider/profile" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-person me-2"></i>My Profile
          </Link>
          <Link to="/rider/settings" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-gear me-2"></i>Settings
          </Link>
          <hr className="text-secondary my-2" />
          <button className="nav-link text-white text-start border-0 bg-transparent" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container-fluid p-3 mt-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
            <h2 className="h4 mb-0 fw-bold text-dark">Settings</h2>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={resetSettings}
                disabled={saving}
              >
                Reset Defaults
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">
                <i className="bi bi-bell me-2 text-primary"></i>
                Notifications
              </h5>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Ride Updates</label>
                  <small className="text-muted d-block">Get notified about your ride status</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.notifications.rideUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'rideUpdates', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Promotions & Offers</label>
                  <small className="text-muted d-block">Receive special offers and discounts</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.notifications.promotions}
                    onChange={(e) => handleSettingChange('notifications', 'promotions', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Security Alerts</label>
                  <small className="text-muted d-block">Important security notifications</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.notifications.securityAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                    <label className="form-label fw-semibold mb-0">Email Notifications</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                    <label className="form-label fw-semibold mb-0">SMS Notifications</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">
                <i className="bi bi-shield-lock me-2 text-primary"></i>
                Privacy & Location
              </h5>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Share Location</label>
                  <small className="text-muted d-block">Allow app to access your location for better service</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.privacy.shareLocation}
                    onChange={(e) => handleSettingChange('privacy', 'shareLocation', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Show Profile to Drivers</label>
                  <small className="text-muted d-block">Drivers can see your rating and basic info</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.privacy.showProfileToDrivers}
                    onChange={(e) => handleSettingChange('privacy', 'showProfileToDrivers', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Emergency Contact Access</label>
                  <small className="text-muted d-block">Allow emergency contacts to see your ride status</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.privacy.emergencyContactAccess}
                    onChange={(e) => handleSettingChange('privacy', 'emergencyContactAccess', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">
                <i className="bi bi-translate me-2 text-primary"></i>
                Preferences
              </h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Language</label>
                  <select
                    className="form-select"
                    value={settings.preferences.language}
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Sesotho">Sesotho</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Currency</label>
                  <select
                    className="form-select"
                    value={settings.preferences.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                  >
                    <option value="M">Lesotho Loti (M)</option>
                    <option value="ZAR">South African Rand (R)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Timezone</label>
                  <select
                    className="form-select"
                    value={settings.preferences.timezone}
                    onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                  >
                    <option value="Africa/Maseru">Africa/Maseru</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Theme</label>
                  <select
                    className="form-select"
                    value={settings.preferences.theme}
                    onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">
                <i className="bi bi-shield-check me-2 text-primary"></i>
                Security
              </h5>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Two-Factor Authentication</label>
                  <small className="text-muted d-block">Add an extra layer of security to your account</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Login Alerts</label>
                  <small className="text-muted d-block">Get notified of new sign-ins</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.security.loginAlerts}
                    onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <div>
                  <label className="form-label fw-semibold mb-1">Biometric Login</label>
                  <small className="text-muted d-block">Use fingerprint or face recognition</small>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.security.biometricLogin}
                    onChange={(e) => handleSettingChange('security', 'biometricLogin', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card border-warning shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3 text-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Account Actions
              </h5>
              
              <div className="d-grid gap-2">
                <button className="btn btn-outline-warning text-start">
                  <i className="bi bi-download me-2"></i>
                  Download Your Data
                </button>
                <button className="btn btn-outline-danger text-start">
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100vh;
          z-index: 1050;
          transition: left 0.3s ease;
        }
        
        .sidebar.open {
          left: 0;
        }
        
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1049;
        }
        
        .main-content {
          margin-left: 0;
          transition: margin-left 0.3s ease;
        }
        
        @media (min-width: 768px) {
          .sidebar {
            left: 0;
          }
          
          .main-content {
            margin-left: 280px;
          }
          
          .navbar-toggler {
            display: none;
          }
        }
        
        .nav-link {
          border-radius: 8px;
          margin-bottom: 5px;
          transition: all 0.2s ease;
        }
        
        .nav-link:hover, .nav-link.active {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .card {
          border-radius: 12px;
        }
        
        .btn {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default RiderSettings;