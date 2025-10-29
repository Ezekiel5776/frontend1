import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/Api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom driver icon
const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTIiIGZpbGw9IiMwMDc1RjciLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to update map center when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const DriverDashboard = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    totalTrips: 0,
    rating: 'New',
    onlineTime: '0h 0m'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const watchIdRef = useRef(null);
  const locationUpdateInterval = useRef(null);

  // Default center (Maseru, Lesotho)
  const defaultCenter = [-29.3100, 27.4800];

  // Load driver stats
  const loadDriverStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/stats?email=${user.email}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          todayEarnings: data.totalEarnings || 0,
          totalTrips: data.totalTrips || 0,
          rating: data.averageRating > 0 ? data.averageRating.toFixed(1) : 'New',
          onlineTime: '0h 0m' // You can calculate this based on session
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Update driver location to backend
  const updateDriverLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          latitude,
          longitude,
          online: isOnline
        }),
      });

      if (!response.ok) {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Update online status in backend
  const updateOnlineStatus = async (online) => {
    try {
      const response = await fetch(`${API_BASE_URL}/driver/online`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          online
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update online status');
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setLocationError('');
        
        // Update backend with new location
        if (isOnline) {
          updateDriverLocation(latitude, longitude);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Start tracking location when online
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setLocationError('');
        
        // Update backend with new location
        updateDriverLocation(latitude, longitude);
      },
      (error) => {
        console.error('Location tracking error:', error);
        setLocationError('Unable to track location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
        distanceFilter: 10 // Update every 10 meters movement
      }
    );
    setIsTracking(true);

    // Also set up periodic updates (every 30 seconds) for reliability
    locationUpdateInterval.current = setInterval(() => {
      if (currentLocation) {
        updateDriverLocation(currentLocation[0], currentLocation[1]);
      }
    }, 30000);
  };

  // Stop tracking when offline
  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
    }
    setIsTracking(false);
  };

  // Handle online/offline toggle
  const handleOnlineToggle = async (online) => {
    setLoading(true);
    try {
      await updateOnlineStatus(online);
      setIsOnline(online);
      
      if (online) {
        getCurrentLocation();
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start tracking when component mounts (if permissions granted)
  useEffect(() => {
    // Check if we have location permissions and auto-start if possible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Permission granted, auto-start tracking
          handleOnlineToggle(true);
        },
        () => {
          // Permission not granted, wait for manual start
          console.log('Location permission not granted');
        }
      );
    }

    // Load initial stats
    loadDriverStats();

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      // Set offline before logging out
      await updateOnlineStatus(false);
      stopLocationTracking();
      
      // Clear local storage and navigate
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still proceed with logout even if offline update fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      navigate('/login');
    }
  };

  // Request location permissions explicitly
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationError('');
        handleOnlineToggle(true);
      },
      (error) => {
        setLocationError('Location permission is required to go online and receive trips.');
      }
    );
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation Bar - Mobile First */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleSidebar}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">UrbanRide Driver</span>
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="onlineSwitch" 
              checked={isOnline}
              onChange={(e) => handleOnlineToggle(e.target.checked)}
              disabled={loading}
            />
            <label className="form-check-label text-white" htmlFor="onlineSwitch">
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1"></span>
              ) : isOnline ? (
                '🟢 Online'
              ) : (
                '⚫ Offline'
              )}
            </label>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
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
          <Link 
            to="/driver/dashboard" 
            className="nav-link text-white active"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
          <Link 
            to="/driver/trips" 
            className="nav-link text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-car-front me-2"></i>
            Trip History
          </Link>
          <Link 
            to="/driver/earnings" 
            className="nav-link text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-currency-dollar me-2"></i>
            Earnings
          </Link>
          <Link 
            to="/driver/profile" 
            className="nav-link text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-person me-2"></i>
            My Profile
          </Link>
          <hr className="text-secondary my-2" />
          <button 
            className="nav-link text-white text-start border-0 bg-transparent"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container-fluid p-3 mt-5">
          {/* Welcome Card */}
          <div className="card bg-white border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <h4 className="card-title text-dark mb-1">Welcome back, {user?.firstName}!</h4>
                  <p className="card-text text-muted">
                    {isOnline ? (
                      <span className="text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        You are online and ready to accept trips
                      </span>
                    ) : (
                      'Go online to start receiving trips'
                    )}
                  </p>
                  {locationError && (
                    <div className="alert alert-warning d-flex align-items-center mt-2 py-2" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <small>{locationError}</small>
                      {locationError.includes('permission') && (
                        <button 
                          className="btn btn-sm btn-outline-warning ms-2"
                          onClick={requestLocationPermission}
                        >
                          Enable
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-auto">
                  <div className={`badge ${isOnline ? 'bg-success' : 'bg-secondary'} fs-6`}>
                    {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card bg-primary text-white h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">Today's Earnings</h6>
                      <h4 className="card-text mb-0">M {stats.todayEarnings.toFixed(2)}</h4>
                    </div>
                    <i className="bi bi-wallet2 fs-2 opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-success text-white h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">Total Trips</h6>
                      <h4 className="card-text mb-0">{stats.totalTrips}</h4>
                    </div>
                    <i className="bi bi-car-front fs-2 opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-info text-white h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">Rating</h6>
                      <h4 className="card-text mb-0">{stats.rating}</h4>
                    </div>
                    <i className="bi bi-star fs-2 opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card bg-warning text-white h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-1">Online Time</h6>
                      <h4 className="card-text mb-0">{stats.onlineTime}</h4>
                    </div>
                    <i className="bi bi-clock fs-2 opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 text-dark">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-6">
                  <Link 
                    to="/driver/profile" 
                    className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-person fs-4 mb-2"></i>
                    <span>Profile</span>
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    to="/driver/earnings" 
                    className="btn btn-outline-success w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-cash-coin fs-4 mb-2"></i>
                    <span>Earnings</span>
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    to="/driver/trips" 
                    className="btn btn-outline-info w-100 d-flex flex-column align-items-center py-3"
                  >
                    <i className="bi bi-journal-text fs-4 mb-2"></i>
                    <span>Trips</span>
                  </Link>
                </div>
                <div className="col-6">
                  <button 
                    className={`btn w-100 d-flex flex-column align-items-center py-3 ${
                      isOnline ? 'btn-outline-danger' : 'btn-outline-success'
                    }`}
                    onClick={() => handleOnlineToggle(!isOnline)}
                    disabled={loading}
                  >
                    <i className={`bi bi-power fs-4 mb-2`}></i>
                    <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Map Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 text-dark">
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                Live Location Map
              </h5>
              {isOnline && currentLocation && (
                <span className="badge bg-success">
                  <i className="bi bi-circle-fill me-1"></i>
                  Live Tracking
                </span>
              )}
            </div>
            <div className="card-body p-0">
              {!isOnline ? (
                <div className="text-center p-5 bg-light rounded">
                  <i className="bi bi-map display-1 text-muted"></i>
                  <p className="text-muted mt-3">Go online to see your live location and receive trip requests</p>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={() => handleOnlineToggle(true)}
                    disabled={loading}
                  >
                    <i className="bi bi-power me-2"></i>
                    {loading ? 'Going Online...' : 'Go Online Now'}
                  </button>
                </div>
              ) : !currentLocation ? (
                <div className="text-center p-5 bg-light rounded">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Getting location...</span>
                  </div>
                  <p className="text-muted">Getting your current location...</p>
                  <button 
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={getCurrentLocation}
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    Retry Location
                  </button>
                </div>
              ) : (
                <div className="map-container">
                  <MapContainer
                    center={currentLocation}
                    zoom={15}
                    style={{ height: '400px', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker 
                      position={currentLocation}
                      icon={driverIcon}
                    >
                      <Popup>
                        Your current location <br /> 
                        UrbanRide Driver
                      </Popup>
                    </Marker>
                    <MapUpdater center={currentLocation} />
                  </MapContainer>
                  
                  {/* Map Controls Overlay */}
                  <div className="map-overlay-controls p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="bg-white rounded-pill px-3 py-1 shadow-sm">
                        <small className="text-dark">
                          <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                          {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                        </small>
                      </div>
                      <button 
                        className="btn btn-light btn-sm shadow-sm"
                        onClick={getCurrentLocation}
                        title="Re-center map"
                      >
                        <i className="bi bi-crosshair2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .map-container {
          position: relative;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
        }
        
        .map-overlay-controls {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          z-index: 1000;
          pointer-events: none;
        }
        
        .map-overlay-controls button {
          pointer-events: auto;
        }
        
        .leaflet-container {
          border-radius: 0 0 12px 12px;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 10px;
            padding-right: 10px;
          }
          
          .card-body {
            padding: 1rem;
          }
          
          .btn {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }
        }

        /* Prevent zoom on mobile inputs */
        @media (max-width: 768px) {
          input, select, textarea {
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;