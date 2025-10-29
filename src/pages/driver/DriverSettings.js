import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const DriverSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    notifications: {
      rideRequests: true,
      newMessages: true,
      earningsUpdates: true,
      promotions: false
    },
    preferences: {
      autoAccept: false,
      preferredAreas: ['Maseru Central'],
      maxDistance: 20,
      language: 'english'
    },
    safety: {
      shareLocation: true,
      emergencyContacts: [],
      speedAlerts: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings from backend (simulated)
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Simulate loading settings
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          preferredAreas: ['Maseru Central', 'Pioneer Mall', 'Lesotho University']
        }
      }));
    }, 1000);
  };

  const saveSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call to save settings
      setTimeout(() => {
        setMessage('Settings saved successfully!');
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to save settings');
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const updateSettings = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">Settings</span>
          <div></div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar bg-dark text-white ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header p-3 border-bottom border-secondary">
          <h5 className="text-warning">Driver Portal</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white d-md-none" 
            onClick={toggleSidebar}
          ></button>
        </div>
        
        <nav className="nav flex-column p-3">
          <Link to="/driver/dashboard" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </Link>
          <Link to="/driver/profile" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-person me-2"></i>My Profile
          </Link>
          <Link to="/driver/earnings" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-currency-dollar me-2"></i>Earnings
          </Link>
          <Link to="/driver/trips" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-car-front me-2"></i>Trip History
          </Link>
          <Link to="/driver/settings" className="nav-link text-white active" onClick={toggleSidebar}>
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
        <div className="container-fluid p-3 mt-5">
          
          {/* Messages */}
          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Notifications Settings */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                <i className="bi bi-bell me-2"></i>Notifications
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <h6 className="mb-1">Ride Requests</h6>
                    <small className="text-muted">Get notified when new ride requests come in</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.notifications.rideRequests}
                      onChange={(e) => updateSettings('notifications', 'rideRequests', e.target.checked)}
                    />
                  </div>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <h6 className="mb-1">New Messages</h6>
                    <small className="text-muted">Notifications from riders</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.notifications.newMessages}
                      onChange={(e) => updateSettings('notifications', 'newMessages', e.target.checked)}
                    />
                  </div>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <h6 className="mb-1">Earnings Updates</h6>
                    <small className="text-muted">Daily and weekly earnings summaries</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.notifications.earningsUpdates}
                      onChange={(e) => updateSettings('notifications', 'earningsUpdates', e.target.checked)}
                    />
                  </div>
                </div>
                
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <div>
                    <h6 className="mb-1">Promotions & Offers</h6>
                    <small className="text-muted">Special bonuses and promotions</small>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.notifications.promotions}
                      onChange={(e) => updateSettings('notifications', 'promotions', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Preferences */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                <i className="bi bi-geo-alt me-2"></i>Ride Preferences
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Auto-Accept Rides</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.preferences.autoAccept}
                    onChange={(e) => updateSettings('preferences', 'autoAccept', e.target.checked)}
                  />
                  <label className="form-check-label text-muted">
                    Automatically accept ride requests
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Maximum Trip Distance</label>
                <select
                  className="form-select"
                  value={settings.preferences.maxDistance}
                  onChange={(e) => updateSettings('preferences', 'maxDistance', parseInt(e.target.value))}
                >
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={30}>30 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Preferred Areas</label>
                <div className="d-flex flex-wrap gap-2">
                  {settings.preferences.preferredAreas.map((area, index) => (
                    <span key={index} className="badge bg-primary">
                      {area}
                    </span>
                  ))}
                </div>
                <small className="text-muted">You'll get more ride requests in these areas</small>
              </div>
            </div>
          </div>

          {/* Safety Settings */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                <i className="bi bi-shield-check me-2"></i>Safety & Privacy
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Share Live Location</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.safety.shareLocation}
                    onChange={(e) => updateSettings('safety', 'shareLocation', e.target.checked)}
                  />
                  <label className="form-check-label text-muted">
                    Share your location with riders during trips
                  </label>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Speed Alerts</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={settings.safety.speedAlerts}
                    onChange={(e) => updateSettings('safety', 'speedAlerts', e.target.checked)}
                  />
                  <label className="form-check-label text-muted">
                    Get alerts when exceeding speed limits
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card shadow-sm border-warning">
            <div className="card-header bg-white border-warning">
              <h5 className="card-title mb-0 text-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>Account Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-download me-2"></i>Download Trip History
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-question-circle me-2"></i>Help & Support
                </button>
                <button className="btn btn-outline-danger">
                  <i className="bi bi-person-x me-2"></i>Deactivate Account
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button 
              className="btn btn-primary w-100 py-3 fw-bold"
              onClick={saveSettings}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save All Changes
                </>
              )}
            </button>
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
        
        .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }
      `}</style>
    </div>
  );
};

export default DriverSettings;