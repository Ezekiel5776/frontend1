import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const RiderProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    personal: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      email: user?.email || '',
      nationalId: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    preferences: {
      rideType: 'Standard',
      conversation: 'Auto',
      musicPreference: 'Auto',
      temperature: 'Auto',
      accessibility: {
        wheelchair: false,
        extraAssistance: false,
        serviceAnimal: false
      },
      favoriteDestinations: []
    },
    paymentMethods: [],
    ratings: {
      average: 0,
      totalRides: 0,
      breakdown: {
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0
      }
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
      
      if (!response.ok) {
        // If 404, it means no profile exists yet - this is normal
        if (response.status === 404) {
          console.log('No profile found, using default template');
          return;
        }
        throw new Error(`Failed to load profile: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if this is a real profile or just the empty template
      if (data.personal && data.personal.firstName !== '') {
        setProfile(data);
      } else {
        console.log('Empty profile template returned, keeping default state');
        // Keep the current state but ensure email is set
        setProfile(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            email: user.email
          }
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show alert for 404 errors - it's normal for new users
      if (!error.message.includes('404')) {
        alert('Error: Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Check if profile exists by making a GET request first
      let profileExists = false;
      try {
        const checkResponse = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
        if (checkResponse.ok) {
          const existingProfile = await checkResponse.json();
          // Check if this is a real profile (not just the empty template)
          profileExists = existingProfile.personal && existingProfile.personal.firstName !== '';
        }
      } catch (error) {
        console.log('No existing profile found');
      }

      const method = profileExists ? 'PUT' : 'POST';
      
      console.log('Saving profile with method:', method);
      console.log('Profile data being sent:', {
        email: user.email,
        ...profile
      });

      const response = await fetch(`${API_BASE_URL}/rider/profile`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          ...profile
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Success: Profile saved successfully!');
        setIsEditing(false);
        loadProfile(); // Reload to get any server-side updates
      } else {
        alert('Error: ' + (result.message || 'Failed to save profile'));
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Error: Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subSection, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value
        }
      }
    }));
  };

  // FIXED: Correct emergency contact handler
  const handleEmergencyContactChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        emergencyContact: {
          ...prev.personal.emergencyContact,
          [field]: value
        }
      }
    }));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#8BC34A';
    if (rating >= 3.5) return '#FFC107';
    if (rating >= 3.0) return '#FF9800';
    return '#F44336';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
              Rider Profile
            </span>
          </div>
        </nav>
        
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', marginTop: '56px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading profile...</span>
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
            Rider Profile
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
          <Link to="/rider/profile" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-person me-2"></i>My Profile
          </Link>
          <Link to="/rider/settings" className="nav-link text-white" onClick={toggleSidebar}>
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
            <h2 className="h4 mb-0 fw-bold text-dark">Rider Profile</h2>
            <button 
              className="btn btn-link text-primary p-0 text-decoration-none fw-semibold"
              onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
              disabled={saving}
            >
              {saving ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
            </button>
          </div>

          {/* Rating Summary */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Rider Rating</h5>
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle border d-flex align-items-center justify-content-center me-4"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderWidth: '3px', 
                    borderColor: getRatingColor(profile.ratings.average) 
                  }}
                >
                  <span className="fw-bold fs-5">{profile.ratings.average.toFixed(1)}</span>
                </div>
                <div>
                  <div className="fw-semibold">{profile.ratings.totalRides} rides</div>
                  <small className="text-muted">Average Rating</small>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Personal Information</h5>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">First Name</label>
                  <input
                    type="text"
                    className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                    value={profile.personal.firstName || ''}
                    onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                    readOnly={!isEditing}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                    value={profile.personal.lastName || ''}
                    onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                    readOnly={!isEditing}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={profile.personal.email || user?.email || ''}
                  readOnly
                  placeholder="Your email"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="tel"
                  className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                  value={profile.personal.phone || ''}
                  onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input
                  type="date"
                  className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                  value={profile.personal.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                  readOnly={!isEditing}
                />
              </div>

              {/* Emergency Contact - FIXED HANDLERS */}
              <h6 className="fw-semibold mt-4 mb-3 text-muted">Emergency Contact</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Contact Name</label>
                <input
                  type="text"
                  className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                  value={profile.personal.emergencyContact?.name || ''}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contact Phone</label>
                <input
                  type="tel"
                  className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                  value={profile.personal.emergencyContact?.phone || ''}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Emergency contact phone"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Relationship</label>
                <input
                  type="text"
                  className={`form-control ${!isEditing ? 'bg-light' : ''}`}
                  value={profile.personal.emergencyContact?.relationship || ''}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  readOnly={!isEditing}
                  placeholder="Relationship (e.g., Spouse, Parent)"
                />
              </div>
            </div>
          </div>

          {/* Ride Preferences */}
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Ride Preferences</h5>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Preferred Ride Type</label>
                <select
                  className="form-select"
                  value={profile.preferences.rideType || 'Standard'}
                  onChange={(e) => handleInputChange('preferences', 'rideType', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="Standard">Standard</option>
                  <option value="Comfort">Comfort</option>
                  <option value="XL">XL</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Conversation</label>
                <select
                  className="form-select"
                  value={profile.preferences.conversation || 'Auto'}
                  onChange={(e) => handleInputChange('preferences', 'conversation', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="Auto">Auto</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Accessibility Options */}
              <h6 className="fw-semibold mt-4 mb-3 text-muted">Accessibility Needs</h6>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <label className="form-label fw-semibold mb-0">Wheelchair Accessible Vehicle</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={profile.preferences.accessibility?.wheelchair || false}
                    onChange={(e) => handleNestedChange('preferences', 'accessibility', 'wheelchair', e.target.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <label className="form-label fw-semibold mb-0">Extra Assistance Needed</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={profile.preferences.accessibility?.extraAssistance || false}
                    onChange={(e) => handleNestedChange('preferences', 'accessibility', 'extraAssistance', e.target.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                <label className="form-label fw-semibold mb-0">Service Animal</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={profile.preferences.accessibility?.serviceAnimal || false}
                    onChange={(e) => handleNestedChange('preferences', 'accessibility', 'serviceAnimal', e.target.checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="d-flex gap-3 mb-4 p-3 bg-white rounded shadow-sm">
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile(); // Reload original data
                }}
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                className="btn btn-primary flex-fill"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
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

export default RiderProfile;