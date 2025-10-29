import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { API_BASE_URL } from '../../services/Api.js';

const DriverTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled, upcoming
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalEarnings: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (user && user.email) {
      loadTrips();
      loadProfile();
    }
  }, [user, filter]);

  useEffect(() => {
    calculateStats();
  }, [trips]);

  const loadTrips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/trips?email=${user.email}`, {
        credentials: 'include' // ADDED: Send session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      } else {
        // Load mock data if API fails
        loadMockTrips();
      }
    } catch (err) {
      console.error('Error loading trips:', err);
      // Load mock data if API fails
      loadMockTrips();
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/profile?email=${user.email}`, {
        credentials: 'include' // ADDED: Send session cookie
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadMockTrips = () => {
    // Mock trip data that uses profile information
    const mockTrips = [
      {
        tripId: 'TRIP_001',
        riderName: 'Thabo Mokoena',
        riderPhone: '+266 1234 5678',
        pickup: 'Maseru Mall',
        destination: 'Lesotho University',
        fare: 45.50,
        distance: '8.2 km',
        duration: '15 min',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        rating: 5,
        status: 'completed',
        vehicle: profile?.vehicle?.licensePlate || 'A1234',
        paymentMethod: 'cash'
      },
      {
        tripId: 'TRIP_002', 
        riderName: 'Matseliso Letuka',
        riderPhone: '+266 2345 6789',
        pickup: 'Pioneer Mall',
        destination: 'Moshoeshoe Airport',
        fare: 65.00,
        distance: '12.5 km', 
        duration: '20 min',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        rating: 4,
        status: 'completed',
        vehicle: profile?.vehicle?.licensePlate || 'A1234',
        paymentMethod: 'mobile_money'
      },
      {
        tripId: 'TRIP_003',
        riderName: 'John Letsie',
        riderPhone: '+266 3456 7890',
        pickup: 'State House',
        destination: 'Pioneer Mall',
        fare: 35.00,
        distance: '6.8 km',
        duration: '12 min',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        rating: 5,
        status: 'completed',
        vehicle: profile?.vehicle?.licensePlate || 'A1234',
        paymentMethod: 'card'
      },
      {
        tripId: 'TRIP_004',
        riderName: 'Anna Molapo',
        riderPhone: '+266 4567 8901',
        pickup: 'Lesotho University',
        destination: 'Maseru Mall',
        fare: 42.00,
        distance: '7.5 km',
        duration: '14 min',
        date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        rating: 4,
        status: 'completed', 
        vehicle: profile?.vehicle?.licensePlate || 'A1234',
        paymentMethod: 'cash'
      },
      {
        tripId: 'TRIP_005',
        riderName: 'David Phiri',
        riderPhone: '+266 5678 9012',
        pickup: 'Moshoeshoe I Airport',
        destination: 'Pioneer Mall',
        fare: 55.00,
        distance: '10.2 km',
        duration: '18 min',
        date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        status: 'cancelled',
        cancellationReason: 'Rider cancelled',
        vehicle: profile?.vehicle?.licensePlate || 'A1234'
      }
    ];
    setTrips(mockTrips);
  };

  const calculateStats = () => {
    const completed = trips.filter(trip => trip.status === 'completed');
    const cancelled = trips.filter(trip => trip.status === 'cancelled');
    const totalEarnings = completed.reduce((sum, trip) => sum + trip.fare, 0);
    const averageRating = completed.length > 0 
      ? completed.reduce((sum, trip) => sum + (trip.rating || 0), 0) / completed.length 
      : 0;

    setStats({
      totalTrips: trips.length,
      completedTrips: completed.length,
      cancelledTrips: cancelled.length,
      totalEarnings: totalEarnings,
      averageRating: Math.round(averageRating * 10) / 10
    });
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
      upcoming: { class: 'bg-warning', text: 'Upcoming' },
      active: { class: 'bg-primary', text: 'Active' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPaymentIcon = (method) => {
    const icons = {
      cash: 'bi-cash',
      card: 'bi-credit-card',
      mobile_money: 'bi-phone'
    };
    return icons[method] || 'bi-wallet';
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
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
          <span className="navbar-brand mb-0 h1">Trip History</span>
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark">
              {stats.totalTrips} Trips
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
          <Link to="/driver/earnings" className="nav-link text-white" onClick={toggleSidebar}>
            <i className="bi bi-currency-dollar me-2"></i>Earnings
          </Link>
          <Link to="/driver/trips" className="nav-link text-white active" onClick={toggleSidebar}>
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
          
          {/* Stats Overview */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-check-circle fs-2 mb-2"></i>
                  <h6>Completed</h6>
                  <h4 className="mb-0">{stats.completedTrips}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-success text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-currency-dollar fs-2 mb-2"></i>
                  <h6>Total Earned</h6>
                  <h4 className="mb-0">{formatCurrency(stats.totalEarnings)}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-star fs-2 mb-2"></i>
                  <h6>Avg Rating</h6>
                  <h4 className="mb-0">{stats.averageRating || 'New'}</h4>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-warning text-white h-100">
                <div className="card-body text-center p-3">
                  <i className="bi bi-x-circle fs-2 mb-2"></i>
                  <h6>Cancelled</h6>
                  <h4 className="mb-0">{stats.cancelledTrips}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="nav nav-pills nav-fill">
                <button 
                  className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Trips
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

          {/* Trip List */}
          <div className="card shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0">
                {filter === 'all' && 'All Trips'}
                {filter === 'completed' && 'Completed Trips'}
                {filter === 'cancelled' && 'Cancelled Trips'}
                <small className="text-muted ms-2">({filteredTrips.length})</small>
              </h5>
            </div>
            <div className="card-body p-0">
              {filteredTrips.length > 0 ? (
                <div className="list-group list-group-flush">
                  {filteredTrips.map((trip, index) => (
                    <div key={trip.tripId || index} className="list-group-item border-0">
                      <div className="row g-2">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{trip.riderName}</h6>
                              <small className="text-muted">{trip.riderPhone}</small>
                            </div>
                            <div className="text-end">
                              {getStatusBadge(trip.status)}
                              <div className="mt-1">
                                <small className="text-muted">{formatDate(trip.date)}</small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center text-muted small mb-1">
                                <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                                <span className="text-truncate">{trip.pickup}</span>
                              </div>
                              <div className="d-flex align-items-center text-muted small">
                                <i className="bi bi-geo-alt text-success me-1"></i>
                                <span className="text-truncate">{trip.destination}</span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-2">
                              <small className="text-muted">
                                <i className="bi bi-signpost me-1"></i>
                                {trip.distance}
                              </small>
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {trip.duration}
                              </small>
                              {trip.vehicle && (
                                <small className="text-muted">
                                  <i className="bi bi-car-front me-1"></i>
                                  {trip.vehicle}
                                </small>
                              )}
                            </div>
                            
                            {trip.status === 'completed' && (
                              <div className="text-end">
                                <h6 className="text-success mb-1">
                                  {formatCurrency(trip.fare)}
                                </h6>
                                <div className="d-flex align-items-center justify-content-end">
                                  {trip.paymentMethod && (
                                    <i className={`bi ${getPaymentIcon(trip.paymentMethod)} text-muted me-2`}></i>
                                  )}
                                  {trip.rating && (
                                    <>
                                      <i className="bi bi-star-fill text-warning me-1"></i>
                                      <small>{trip.rating}</small>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {trip.status === 'cancelled' && (
                              <div className="text-end">
                                <small className="text-danger">
                                  {trip.cancellationReason}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons for Completed Trips */}
                      {trip.status === 'completed' && (
                        <div className="mt-2 pt-2 border-top">
                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-telephone me-1"></i>Call Rider
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-chat me-1"></i>Message
                            </button>
                            <button className="btn btn-outline-info btn-sm ms-auto">
                              <i className="bi bi-receipt me-1"></i>Receipt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-car-front display-1 text-muted"></i>
                  <p className="text-muted mt-3">No trips found</p>
                  <small>Your {filter} trips will appear here</small>
                  <div className="mt-3">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate('/driver/dashboard')}
                    >
                      <i className="bi bi-car-front me-2"></i>Go Online
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          {filteredTrips.length > 0 && (
            <div className="card bg-light border-0 mt-3">
              <div className="card-body text-center">
                <small className="text-muted">
                  Showing {filteredTrips.length} of {trips.length} total trips
                </small>
              </div>
            </div>
          )}
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
        
        .list-group-item {
          border-radius: 0;
          border-bottom: 1px solid #eee;
        }
        
        .list-group-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};

export default DriverTrips;