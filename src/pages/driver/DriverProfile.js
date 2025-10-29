import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const DriverProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    personal: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationalId: '',
      phone: '',
      profilePhoto: null
    },
    vehicle: {
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: '',
      vehiclePhoto: null,
      capacity: 4
    },
    documents: {
      driversLicense: null,
      vehicleRegistration: null,
      insurance: null
    },
    payment: {
      preferredMethod: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branchCode: '',
        accountType: 'savings'
      },
      mobileMoney: {
        provider: '',
        phoneNumber: '',
        accountName: ''
      }
    }
  });

  const lesothoBanks = [
    { name: 'Standard Lesotho Bank', code: 'SLB' },
    { name: 'First National Bank (FNB)', code: 'FNB' },
    { name: 'Nedbank Lesotho', code: 'NED' }
  ];

  const mobileMoneyProviders = [
    { name: 'M-Pesa', provider: 'Vodacom' },
    { name: 'EcoCash', provider: 'Econet' }
  ];

  useEffect(() => {
    if (user && user.email) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/driver/profile?email=${user.email}`, {
        credentials: 'include' // Send session cookie
      });
      if (response.ok) {
        const profileData = await response.json();
        setProfile(prev => ({ ...prev, ...profileData }));
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/driver/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send session cookie
        body: JSON.stringify(profile), // REMOVED email from body - session will handle it
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessage('Profile saved successfully!');
      if (data.profile?.status === 'approved') {
        setMessage('🎉 Profile approved! You can now go online and receive trips.');
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateProfileField = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedField = (section, subSection, field, value) => {
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

  const handleFileUpload = (section, field, file) => {
    const fileName = file.name;
    updateProfileField(section, field, fileName);
    setMessage(`File "${fileName}" uploaded successfully (simulated)`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const calculateProgress = () => {
    const sections = ['personal', 'vehicle', 'documents', 'payment'];
    let completed = 0;

    sections.forEach(section => {
      if (section === 'personal') {
        const required = ['firstName', 'lastName', 'dateOfBirth', 'nationalId', 'phone'];
        if (required.every(field => profile.personal[field])) completed++;
      } else if (section === 'vehicle') {
        const required = ['make', 'model', 'year', 'color', 'licensePlate'];
        if (required.every(field => profile.vehicle[field])) completed++;
      } else if (section === 'documents') {
        const required = ['driversLicense', 'vehicleRegistration'];
        if (required.every(field => profile.documents[field])) completed++;
      } else if (section === 'payment') {
        if (profile.payment.preferredMethod) completed++;
      }
    });

    return (completed / sections.length) * 100;
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">Driver Profile</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark me-2">{Math.round(progress)}% Complete</span>
          </div>
        </div>
      </nav>

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
          <Link to="/driver/profile" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-person me-2"></i>My Profile
          </Link>
          <Link to="/driver/earnings" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-currency-dollar me-2"></i>Earnings
          </Link>
          <Link to="/driver/trips" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-car-front me-2"></i>Trip History
          </Link>
          <hr className="text-secondary my-2" />
          <button className="nav-link text-white text-start border-0 bg-transparent" onClick={() => navigate('/login')}>
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </nav>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <main className="main-content">
        <div className="container-fluid p-3 mt-5">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="card-title mb-0">Profile Completion</h6>
                <span className="badge bg-primary">{Math.round(progress)}%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <small className="text-muted mt-2 d-block">
                Complete all sections to start receiving trips
              </small>
            </div>
          </div>

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

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <ul className="nav nav-pills">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                  >
                    <i className="bi bi-person me-2"></i>Personal
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'vehicle' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vehicle')}
                  >
                    <i className="bi bi-car-front me-2"></i>Vehicle
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                  >
                    <i className="bi bi-file-earmark me-2"></i>Documents
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                  >
                    <i className="bi bi-bank me-2"></i>Payment
                  </button>
                </li>
              </ul>
              <button 
                type="button" 
                className={`btn ${isEditing ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <i className="bi bi-check-lg me-2"></i>Done Editing
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil me-2"></i>Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="card-body">
              {activeTab === 'personal' && (
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-person-badge me-2"></i>Personal Information
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.personal.firstName}
                      onChange={(e) => updateProfileField('personal', 'firstName', e.target.value)}
                      placeholder="Enter your first name"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.personal.lastName}
                      onChange={(e) => updateProfileField('personal', 'lastName', e.target.value)}
                      placeholder="Enter your last name"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={profile.personal.dateOfBirth}
                      onChange={(e) => updateProfileField('personal', 'dateOfBirth', e.target.value)}
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">National ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.personal.nationalId}
                      onChange={(e) => updateProfileField('personal', 'nationalId', e.target.value)}
                      placeholder="11-digit Lesotho ID"
                      maxLength="11"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                    <small className="text-muted">11-digit Lesotho National ID</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profile.personal.phone}
                      onChange={(e) => updateProfileField('personal', 'phone', e.target.value)}
                      placeholder="+266 XXX XXX XX"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                    <small className="text-muted">Lesotho format: +266 XXX XXX XX</small>
                  </div>
                </div>
              )}

              {activeTab === 'vehicle' && (
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-car-front me-2"></i>Vehicle Information
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Make *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.vehicle.make}
                      onChange={(e) => updateProfileField('vehicle', 'make', e.target.value)}
                      placeholder="e.g., Toyota"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Model *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.vehicle.model}
                      onChange={(e) => updateProfileField('vehicle', 'model', e.target.value)}
                      placeholder="e.g., Camry"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Year *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={profile.vehicle.year}
                      onChange={(e) => updateProfileField('vehicle', 'year', e.target.value)}
                      placeholder="e.g., 2022"
                      min="2000"
                      max={new Date().getFullYear()}
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Color *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.vehicle.color}
                      onChange={(e) => updateProfileField('vehicle', 'color', e.target.value)}
                      placeholder="e.g., White"
                      readOnly={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">License Plate *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.vehicle.licensePlate}
                      onChange={(e) => updateProfileField('vehicle', 'licensePlate', e.target.value.toUpperCase())}
                      placeholder="e.g., A1234"
                      style={{ textTransform: 'uppercase', backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Passenger Capacity</label>
                    <select
                      className="form-select"
                      value={profile.vehicle.capacity}
                      onChange={(e) => updateProfileField('vehicle', 'capacity', parseInt(e.target.value))}
                      disabled={!isEditing}
                      style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                    >
                      <option value={4}>4 passengers</option>
                      <option value={6}>6 passengers</option>
                      <option value={8}>8 passengers</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-file-earmark me-2"></i>Required Documents
                    </h6>
                    <p className="text-muted">Upload clear photos of your documents</p>
                  </div>
                  
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-card-checklist display-4 text-muted mb-3"></i>
                        <h6>Driver's License *</h6>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => handleFileUpload('documents', 'driversLicense', e.target.files[0])}
                          accept="image/*,.pdf"
                          disabled={!isEditing}
                          style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                        />
                        {profile.documents.driversLicense && (
                          <small className="text-success mt-2 d-block">
                            <i className="bi bi-check-circle me-1"></i>
                            {profile.documents.driversLicense}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-file-text display-4 text-muted mb-3"></i>
                        <h6>Vehicle Registration *</h6>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => handleFileUpload('documents', 'vehicleRegistration', e.target.files[0])}
                          accept="image/*,.pdf"
                          disabled={!isEditing}
                          style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                        />
                        {profile.documents.vehicleRegistration && (
                          <small className="text-success mt-2 d-block">
                            <i className="bi bi-check-circle me-1"></i>
                            {profile.documents.vehicleRegistration}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-shield-check display-4 text-muted mb-3"></i>
                        <h6>Insurance Certificate (Optional)</h6>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) => handleFileUpload('documents', 'insurance', e.target.files[0])}
                          accept="image/*,.pdf"
                          disabled={!isEditing}
                          style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                        />
                        {profile.documents.insurance && (
                          <small className="text-success mt-2 d-block">
                            <i className="bi bi-check-circle me-1"></i>
                            {profile.documents.insurance}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">
                      <i className="bi bi-bank me-2"></i>Payment Method
                    </h6>
                    <p className="text-muted">Choose how you want to receive your earnings</p>
                  </div>

                  <div className="col-12">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="bankTransfer"
                        checked={profile.payment.preferredMethod === 'bank'}
                        onChange={() => updateProfileField('payment', 'preferredMethod', 'bank')}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-bold" htmlFor="bankTransfer">
                        <i className="bi bi-building me-2"></i>Bank Transfer (Weekly)
                      </label>
                      <small className="text-muted d-block ms-4">
                        Payments processed every Monday • No fees
                      </small>
                    </div>

                    {profile.payment.preferredMethod === 'bank' && (
                      <div className="card border-primary bg-light mt-2">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label">Bank Name *</label>
                              <select
                                className="form-select"
                                value={profile.payment.bankDetails?.bankName || ''}
                                onChange={(e) => updateNestedField('payment', 'bankDetails', 'bankName', e.target.value)}
                                disabled={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              >
                                <option value="">Select your bank</option>
                                {lesothoBanks.map(bank => (
                                  <option key={bank.code} value={bank.name}>
                                    {bank.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Account Number *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={profile.payment.bankDetails?.accountNumber || ''}
                                onChange={(e) => updateNestedField('payment', 'bankDetails', 'accountNumber', e.target.value)}
                                placeholder="9-18 digit account number"
                                readOnly={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Account Holder Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={profile.payment.bankDetails?.accountHolder || ''}
                                onChange={(e) => updateNestedField('payment', 'bankDetails', 'accountHolder', e.target.value)}
                                placeholder="Must match your profile name"
                                readOnly={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="mobileMoney"
                        checked={profile.payment.preferredMethod === 'mobile_money'}
                        onChange={() => updateProfileField('payment', 'preferredMethod', 'mobile_money')}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-bold" htmlFor="mobileMoney">
                        <i className="bi bi-phone me-2"></i>Mobile Money (Daily Instant)
                      </label>
                      <small className="text-muted d-block ms-4">
                        Instant daily payouts • M2.00 fee per transaction
                      </small>
                    </div>

                    {profile.payment.preferredMethod === 'mobile_money' && (
                      <div className="card border-success bg-light mt-2">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label">Mobile Money Provider *</label>
                              <select
                                className="form-select"
                                value={profile.payment.mobileMoney?.provider || ''}
                                onChange={(e) => updateNestedField('payment', 'mobileMoney', 'provider', e.target.value)}
                                disabled={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              >
                                <option value="">Select provider</option>
                                {mobileMoneyProviders.map(provider => (
                                  <option key={provider.name} value={provider.name}>
                                    {provider.name} ({provider.provider})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Phone Number *</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={profile.payment.mobileMoney?.phoneNumber || ''}
                                onChange={(e) => updateNestedField('payment', 'mobileMoney', 'phoneNumber', e.target.value)}
                                placeholder="+266 XXX XXX XX"
                                readOnly={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              />
                              <small className="text-muted">Lesotho mobile number format</small>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Account Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={profile.payment.mobileMoney?.accountName || ''}
                                onChange={(e) => updateNestedField('payment', 'mobileMoney', 'accountName', e.target.value)}
                                placeholder="Registered mobile money name"
                                readOnly={!isEditing}
                                style={{ backgroundColor: isEditing ? 'white' : '#f8f9fa' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="card-footer bg-white border-0">
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/driver/dashboard')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
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
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }
      `}</style>
    </div>
  );
};

export default DriverProfile;