import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const DriverEarnings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [earnings, setEarnings] = useState({
    currentBalance: 0.0,
    todayEarnings: 0.0,
    weekEarnings: 0.0,
    monthEarnings: 0.0,
    totalEarnings: 0.0,
    totalTrips: 0,
    currency: 'M'
  });
  
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, all

  useEffect(() => {
    if (user && user.email) {
      loadEarningsData();
      loadTrips();
      loadStats();
    }
  }, [user, timeFilter]);

  const loadEarningsData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/earnings?email=${user.email}`, {
        credentials: 'include' // ADDED: Send session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Error loading earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/trips?email=${user.email}`, {
        credentials: 'include' // ADDED: Send session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/stats?email=${user.email}`, {
        credentials: 'include' // ADDED: Send session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatCurrency = (amount) => {
    return `M ${amount.toFixed(2)}`;
  };

  const handlePayout = async () => {
    // Simulate payout request
    alert('Payout request submitted! Funds will be processed within 24 hours.');
  };

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
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">Earnings</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark">
              {formatCurrency(earnings.currentBalance)}
            </span>
          </div>
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
          <Link to="/driver/earnings" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-currency-dollar me-2"></i>Earnings
          </Link>
          <Link to="/driver/trips" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-car-front me-2"></i>Trip History
          </Link>
          <Link to="/driver/settings" className="nav-link text-white" onClick={toggleSidebar}>
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
          
          {/* Balance Card */}
          <div className="card bg-primary text-white shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <h6 className="card-title mb-1">Available Balance</h6>
                  <h2 className="card-text mb-0">{formatCurrency(earnings.currentBalance)}</h2>
                  <small>Ready for payout</small>
                </div>
                <div className="col-auto">
                  <i className="bi bi-wallet2 display-4 opacity-75"></i>
                </div>
              </div>
              <div className="mt-3">
                <button 
                  className="btn btn-light w-100 fw-bold"
                  onClick={handlePayout}
                  disabled={earnings.currentBalance < 50}
                >
                  {earnings.currentBalance >= 50 ? (
                    <>Request Payout</>
                  ) : (
                    <>Minimum M 50.00 required</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Earnings Overview</h5>
                <select 
                  className="form-select form-select-sm w-auto"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3 text-center">
                <div className="col-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted mb-1">Today</h6>
                    <h4 className="text-success mb-0">{formatCurrency(earnings.todayEarnings)}</h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted mb-1">This Week</h6>
                    <h4 className="text-primary mb-0">{formatCurrency(earnings.weekEarnings)}</h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted mb-1">This Month</h6>
                    <h4 className="text-info mb-0">{formatCurrency(earnings.monthEarnings)}</h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3">
                    <h6 className="text-muted mb-1">Total</h6>
                    <h4 className="text-warning mb-0">{formatCurrency(earnings.totalEarnings)}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-car-front fs-2 mb-2"></i>
                  <h6>Total Trips</h6>
                  <h4 className="mb-0">{stats.totalTrips || 0}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-star fs-2 mb-2"></i>
                  <h6>Rating</h6>
                  <h4 className="mb-0">{stats.averageRating || 'New'}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-warning text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-check-circle fs-2 mb-2"></i>
                  <h6>Completion</h6>
                  <h4 className="mb-0">{stats.completionRate || 0}%</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-secondary text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-clock fs-2 mb-2"></i>
                  <h6>Response Time</h6>
                  <h4 className="mb-0">{stats.responseTime || '0 min'}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">Recent Trips</h5>
            </div>
            <div className="card-body">
              {trips.length > 0 ? (
                <div className="list-group list-group-flush">
                  {trips.map((trip, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{trip.riderName}</h6>
                          <small className="text-muted">
                            {trip.pickup} → {trip.destination}
                          </small>
                          <div className="mt-1">
                            <small className="text-muted">
                              {trip.distance} • {trip.duration}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <h6 className="text-success mb-1">{formatCurrency(trip.fare)}</h6>
                          <div className="d-flex align-items-center justify-content-end">
                            <i className="bi bi-star-fill text-warning me-1"></i>
                            <small>{trip.rating}</small>
                          </div>
                          <small className="text-muted">
                            {new Date(trip.date).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-receipt display-4 text-muted"></i>
                  <p className="text-muted mt-3">No trips completed yet</p>
                  <small>Your trip history will appear here</small>
                </div>
              )}
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

export default DriverEarnings;