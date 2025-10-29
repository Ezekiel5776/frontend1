import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/Api';

const RiderPaymentMethods = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'mobile_money',
    provider: 'M-Pesa',
    phoneNumber: '',
    accountName: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addPaymentMethod = async () => {
    if (!newPaymentMethod.phoneNumber || !newPaymentMethod.accountName) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatedMethods = [...paymentMethods, { 
        ...newPaymentMethod, 
        id: Date.now().toString(),
        isPrimary: paymentMethods.length === 0 // First method becomes primary
      }];
      
      // First, get the current profile to preserve other data
      const profileResponse = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
      let currentProfile = {};
      
      if (profileResponse.ok) {
        currentProfile = await profileResponse.json();
      }

      // Update the profile with new payment methods
      const updatedProfile = {
        ...currentProfile,
        paymentMethods: updatedMethods,
        email: user.email
      };

      // Use PUT to update the entire profile
      const response = await fetch(`${API_BASE_URL}/rider/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        setPaymentMethods(updatedMethods);
        setShowAddForm(false);
        setNewPaymentMethod({
          type: 'mobile_money',
          provider: 'M-Pesa',
          phoneNumber: '',
          accountName: ''
        });
        alert('Payment method added successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to add payment method: ' + (errorData.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      alert('Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
      
      // Get current profile first
      const profileResponse = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
      let currentProfile = {};
      
      if (profileResponse.ok) {
        currentProfile = await profileResponse.json();
      }

      // Update profile with removed payment method
      const updatedProfile = {
        ...currentProfile,
        paymentMethods: updatedMethods,
        email: user.email
      };

      const response = await fetch(`${API_BASE_URL}/rider/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        setPaymentMethods(updatedMethods);
        alert('Payment method removed successfully!');
      } else {
        alert('Failed to remove payment method');
      }
    } catch (err) {
      console.error('Error removing payment method:', err);
      alert('Failed to remove payment method. Please try again.');
    }
  };

  const setPrimaryPaymentMethod = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isPrimary: method.id === methodId
      }));
      
      // Get current profile first
      const profileResponse = await fetch(`${API_BASE_URL}/rider/profile?email=${user.email}`);
      let currentProfile = {};
      
      if (profileResponse.ok) {
        currentProfile = await profileResponse.json();
      }

      // Update profile with new primary method
      const updatedProfile = {
        ...currentProfile,
        paymentMethods: updatedMethods,
        email: user.email
      };

      const response = await fetch(`${API_BASE_URL}/rider/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        setPaymentMethods(updatedMethods);
        alert('Primary payment method updated!');
      } else {
        alert('Failed to update primary payment method');
      }
    } catch (err) {
      console.error('Error setting primary payment method:', err);
      alert('Failed to update primary payment method. Please try again.');
    }
  };

  const getPaymentIcon = (type) => {
    const icons = {
      mobile_money: 'bi-phone',
      card: 'bi-credit-card',
      cash: 'bi-cash'
    };
    return icons[type] || 'bi-wallet';
  };

  const getPaymentLabel = (type) => {
    const labels = {
      mobile_money: 'Mobile Money',
      card: 'Credit/Debit Card',
      cash: 'Cash'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">Payment Methods</span>
          <div></div>
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
          <Link to="/rider/payment-methods" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-wallet me-2"></i>Payment Methods
          </Link>
          <Link to="/rider/profile" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-person me-2"></i>My Profile
          </Link>
          <Link to="/rider/settings" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-gear me-2"></i>Settings
          </Link>
          <hr className="text-secondary my-2" />
          <button className="nav-link text-white text-start border-0 bg-transparent" onClick={() => navigate('/login')}>
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
          
          {/* Add Payment Method Button */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <button 
                className="btn btn-primary w-100 py-3"
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Payment Method
              </button>
            </div>
          </div>

          {/* Add Payment Method Form */}
          {showAddForm && (
            <div className="card shadow-sm border-primary mb-4">
              <div className="card-header bg-white border-primary">
                <h5 className="card-title mb-0 text-primary">
                  <i className="bi bi-credit-card me-2"></i>
                  Add New Payment Method
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Payment Type</label>
                    <select
                      className="form-select"
                      value={newPaymentMethod.type}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  {newPaymentMethod.type === 'mobile_money' && (
                    <>
                      <div className="col-12">
                        <label className="form-label">Provider</label>
                        <select
                          className="form-select"
                          value={newPaymentMethod.provider}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, provider: e.target.value }))}
                        >
                          <option value="M-Pesa">M-Pesa (Vodacom)</option>
                          <option value="EcoCash">EcoCash (Econet)</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={newPaymentMethod.phoneNumber}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="+266 XXX XXX XX"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Account Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newPaymentMethod.accountName}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, accountName: e.target.value }))}
                          placeholder="Registered account name"
                          required
                        />
                      </div>
                    </>
                  )}

                  {newPaymentMethod.type === 'card' && (
                    <>
                      <div className="col-12">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="123"
                        />
                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary flex-fill"
                        onClick={addPaymentMethod}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : (
                          'Add Payment Method'
                        )}
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods List */}
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                <i className="bi bi-wallet2 me-2"></i>
                Your Payment Methods
              </h5>
            </div>
            <div className="card-body p-0">
              {paymentMethods.length > 0 ? (
                <div className="list-group list-group-flush">
                  {paymentMethods.map((method, index) => (
                    <div key={method.id || index} className="list-group-item border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className={`${getPaymentIcon(method.type)} fs-4 text-primary me-3`}></i>
                          <div>
                            <h6 className="mb-1">{getPaymentLabel(method.type)}</h6>
                            <small className="text-muted">
                              {method.type === 'mobile_money' && (
                                <>
                                  {method.provider} • {method.phoneNumber}
                                  {method.accountName && ` • ${method.accountName}`}
                                </>
                              )}
                              {method.type === 'card' && '•••• •••• •••• 3456'}
                              {method.type === 'cash' && 'Pay with cash to driver'}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {method.isPrimary ? (
                            <span className="badge bg-success">Primary</span>
                          ) : (
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setPrimaryPaymentMethod(method.id)}
                            >
                              Set Primary
                            </button>
                          )}
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removePaymentMethod(method.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-wallet display-1 text-muted"></i>
                  <p className="text-muted mt-3">No payment methods added</p>
                  <small>Add a payment method to book rides faster</small>
                </div>
              )}
            </div>
          </div>

          {/* Payment Tips */}
          <div className="card bg-light border-0 mt-4">
            <div className="card-body">
              <h6 className="text-primary mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Payment Information
              </h6>
              <ul className="list-unstyled text-muted small">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Mobile Money is the fastest way to pay in Lesotho
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Cash payments are accepted by all drivers
                </li>
                <li>
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Your payment information is securely stored in Firebase
                </li>
              </ul>
            </div>
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
        }
      `}</style>
    </div>
  );
};

export default RiderPaymentMethods;