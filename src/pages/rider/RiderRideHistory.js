import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/Api';

const RiderRideHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && user.email) {
      loadRideHistory();
    }
  }, [user, filter]);

  const loadRideHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rider/ride-history?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error('Error loading ride history:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatCurrency = (amount) => {
    return `M ${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-LS', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-danger', text: 'Cancelled' },
      driver_assigned: { class: 'bg-warning', text: 'Driver Assigned' },
      searching: { class: 'bg-info', text: 'Searching' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

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
          <span className="navbar-brand mb-0 h1">Ride History</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark">
              {rides.length} Rides
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
          <Link to="/rider/ride-history" className="nav-link text-white active" onClick={toggleSidebar}>
            <i className="bi bi-clock-history me-2"></i>Ride History
          </Link>
          <Link to="/rider/payment-methods" className="nav-link text-white" onClick={toggleSidebar}>
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
          
          {/* Filter Tabs */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="nav nav-pills nav-fill">
                <button 
                  className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Rides
                </button>
                <button 
                  className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
                <button 
                  className={`nav-link ${filter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          {/* Ride List */}
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                Your Rides
                <small className="text-muted ms-2">({filteredRides.length})</small>
              </h5>
            </div>
            <div className="card-body p-0">
              {filteredRides.length > 0 ? (
                <div className="list-group list-group-flush">
                  {filteredRides.map((ride, index) => (
                    <div key={ride.rideId || index} className="list-group-item border-0">
                      <div className="row g-2">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">Ride #{ride.rideId}</h6>
                              <small className="text-muted">{formatDate(ride.requestedAt)}</small>
                            </div>
                            <div className="text-end">
                              {getStatusBadge(ride.status)}
                              <div className="mt-1">
                                {ride.estimatedFare && (
                                  <h6 className="text-success mb-0">
                                    {formatCurrency(ride.estimatedFare.amount)}
                                  </h6>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="d-flex align-items-center text-muted small mb-1">
                              <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                              <span>{ride.pickupLocation}</span>
                            </div>
                            <div className="d-flex align-items-center text-muted small">
                              <i className="bi bi-geo-alt text-success me-1"></i>
                              <span>{ride.destination}</span>
                            </div>
                          </div>

                          {ride.driverName && (
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{ width: '30px', height: '30px' }}>
                                  <i className="bi bi-person text-white"></i>
                                </div>
                                <div>
                                  <small className="fw-semibold">{ride.driverName}</small>
                                  <br />
                                  <small className="text-muted">{ride.vehicleInfo}</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <small className="text-muted">{ride.rideType}</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-2 pt-2 border-top">
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-receipt me-1"></i>Receipt
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <i className="bi bi-star me-1"></i>Rate
                          </button>
                          {ride.status === 'completed' && (
                            <button className="btn btn-outline-info btn-sm ms-auto">
                              <i className="bi bi-arrow-repeat me-1"></i>Book Again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history display-1 text-muted"></i>
                  <p className="text-muted mt-3">No rides found</p>
                  <small>Your {filter} rides will appear here</small>
                  <div className="mt-3">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/rider/dashboard')}
                    >
                      <i className="bi bi-car-front me-2"></i>Book Your First Ride
                    </button>
                  </div>
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

export default RiderRideHistory;