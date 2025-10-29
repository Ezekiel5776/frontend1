import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../services/Api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const riderIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTIiIGZpbGw9IiMwMGI2ZmYiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const driverIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTIiIGZpbGw9IiMwMDc1ZjciLz4KPHBhdGggZD0iTTEwIDEySDE0VjE4SDEwVjEyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDEySDIwVjE4SDE2VjEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const RiderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([-29.3100, 27.4800]); // Maseru default
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState('standard');
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [locationError, setLocationError] = useState('');

  const rideTypes = [
    { id: 'standard', name: 'Standard', icon: 'bi-car-front', pricePerKm: 5.5, description: 'Affordable everyday rides' },
    { id: 'comfort', name: 'Comfort', icon: 'bi-car-front-fill', pricePerKm: 7.0, description: 'Newer cars with extra comfort' },
    { id: 'premier', name: 'Premier', icon: 'bi-star', pricePerKm: 9.0, description: 'Premium luxury vehicles' }
  ];

  useEffect(() => {
    if (user && user.email) {
      getCurrentLocation();
    }
  }, [user]);

  useEffect(() => {
    if (currentLocation && currentLocation[0] !== -29.3100) {
      loadNearbyDrivers();
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setPickupLocation('Current Location');
          setLocationError('');
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Using default location.');
          setCurrentLocation([-29.3100, 27.4800]);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const loadNearbyDrivers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rider/nearby-drivers?lat=${currentLocation[0]}&lng=${currentLocation[1]}`
      );
      if (response.ok) {
        const data = await response.json();
        setNearbyDrivers(data.drivers || []);
      }
    } catch (err) {
      console.error('Error loading nearby drivers:', err);
    }
  };

  const calculateFare = () => {
    if (!pickupLocation || !destination) return;

    const mockDistance = 8.5;
    const selectedRide = rideTypes.find(ride => ride.id === rideType);
    const fare = (mockDistance * selectedRide.pricePerKm).toFixed(2);
    
    setEstimatedFare({
      amount: parseFloat(fare),
      distance: `${mockDistance} km`,
      duration: '15 min',
      currency: 'M'
    });
  };

  const requestRide = async () => {
    if (!pickupLocation || !destination) {
      alert('Please enter both pickup and destination locations');
      return;
    }

    setLoading(true);
    try {
      const rideData = {
        riderEmail: user.email,
        riderName: `${user.firstName} ${user.lastName}`,
        pickupLocation,
        destination,
        rideType,
        estimatedFare,
        riderLocation: {
          lat: currentLocation[0],
          lng: currentLocation[1]
        }
      };

      const response = await fetch(`${API_BASE_URL}/rider/request-ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Ride requested successfully! Looking for drivers...');
        // Navigate to ride tracking page
        navigate('/rider/ride-tracking', { state: { rideId: data.rideId } });
      } else {
        alert(data.message || 'Failed to request ride');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Top Navigation */}
      <nav className="navbar navbar-dark bg-primary fixed-top">
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" onClick={toggleSidebar}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">
            Hello, {user?.firstName || 'Rider'}! 👋
          </span>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-light btn-sm me-2"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <i className="bi bi-geo-alt"></i>
            </button>
            <span className="badge bg-light text-dark">
              Maseru
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
          <Link to="/rider/dashboard" className="nav-link text-white active" onClick={toggleSidebar}>
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
          
          {/* Location Error */}
          {locationError && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {locationError}
              <button type="button" className="btn-close" onClick={() => setLocationError('')}></button>
            </div>
          )}

          {/* Map Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="text-dark mb-0">Book a Ride</h4>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowMap(!showMap)}
            >
              <i className={`bi bi-${showMap ? 'map' : 'geo'} me-1`}></i>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {/* Interactive Map */}
          {showMap && (
            <div className="card shadow-sm mb-4" style={{ height: '300px' }}>
              <MapContainer
                center={currentLocation}
                zoom={14}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Rider Location */}
                <Marker position={currentLocation} icon={riderIcon}>
                  <Popup>
                    <strong>Your Location</strong><br />
                    {user?.firstName || 'Rider'}
                  </Popup>
                </Marker>

                {/* Nearby Drivers */}
                {nearbyDrivers.slice(0, 5).map((driver, index) => {
                  // Generate random nearby positions for demo
                  const driverLat = currentLocation[0] + (Math.random() - 0.5) * 0.01;
                  const driverLng = currentLocation[1] + (Math.random() - 0.5) * 0.01;
                  
                  return (
                    <Marker key={index} position={[driverLat, driverLng]} icon={driverIcon}>
                      <Popup>
                        <strong>{driver.name}</strong><br />
                        {driver.vehicle}<br />
                        {driver.distance} away<br />
                        ⭐ {driver.rating}
                      </Popup>
                    </Marker>
                  );
                })}

                <MapUpdater center={currentLocation} />
              </MapContainer>
            </div>
          )}

          {/* Ride Booking Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                {/* Pickup Location */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                    Pickup Location
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Enter pickup location"
                    />
                    <button 
                      className="btn btn-outline-primary"
                      onClick={getCurrentLocation}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <i className="bi bi-crosshair2"></i>
                      )}
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-geo-alt text-success me-2"></i>
                    Destination
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where do you want to go?"
                    onBlur={calculateFare}
                  />
                </div>

                {/* Ride Type Selection */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Choose Ride Type</label>
                  <div className="row g-2">
                    {rideTypes.map(ride => (
                      <div key={ride.id} className="col-4">
                        <div 
                          className={`card border-2 ${rideType === ride.id ? 'border-primary' : 'border-light'} cursor-pointer`}
                          onClick={() => setRideType(ride.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center p-2">
                            <i className={`${ride.icon} fs-4 ${rideType === ride.id ? 'text-primary' : 'text-muted'}`}></i>
                            <h6 className="mb-1">{ride.name}</h6>
                            <small className="text-muted">M{ride.pricePerKm}/km</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimated Fare */}
                {estimatedFare && (
                  <div className="col-12">
                    <div className="alert alert-info">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Estimated Fare</h6>
                          <small>{estimatedFare.distance} • {estimatedFare.duration}</small>
                        </div>
                        <h4 className="text-success mb-0">M {estimatedFare.amount.toFixed(2)}</h4>
                      </div>
                    </div>
                  </div>
                )}

                {/* Request Ride Button */}
                <div className="col-12">
                  <button 
                    className="btn btn-primary w-100 py-3 fw-bold"
                    onClick={requestRide}
                    disabled={loading || !pickupLocation || !destination}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Finding Drivers...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-car-front me-2"></i>
                        Request Ride
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Drivers Count */}
          <div className="card bg-light border-0">
            <div className="card-body text-center">
              <i className="bi bi-car-front text-primary me-2"></i>
              <span className="text-muted">
                {nearbyDrivers.length} drivers available near you
              </span>
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
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RiderDashboard;