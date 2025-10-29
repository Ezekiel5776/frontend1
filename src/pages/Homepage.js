import React from 'react';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-car-front-fill me-2"></i>
            UrbanRide
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-5 mt-5">
        <div className="container">
          <div className="row align-items-center min-vh-75 py-5">
            {/* Left Column - Content */}
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="pe-lg-5">
                <h1 className="display-4 fw-bold text-dark mb-4">
                  Your reliable ride, 
                  <span className="text-primary"> just a tap away</span>
                </h1>
                <p className="lead text-muted mb-5">
                  Experience seamless transportation with UrbanRide. Whether you're commuting to work, 
                  heading to the airport, or exploring the city, we connect you with trusted drivers 
                  in real-time. Safe, affordable, and convenient.
                </p>
                
                {/* Feature List */}
                <div className="row mb-5">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-shield-check text-success fs-4 me-3"></i>
                      <span className="fw-medium">Safe & Secure</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock text-primary fs-4 me-3"></i>
                      <span className="fw-medium">24/7 Available</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-cash-coin text-warning fs-4 me-3"></i>
                      <span className="fw-medium">Affordable Pricing</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt text-danger fs-4 me-3"></i>
                      <span className="fw-medium">Real-time Tracking</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <button 
                    className="btn btn-primary btn-lg px-4 py-3 fw-semibold"
                    onClick={() => navigate('/register')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Get Started Free
                  </button>
                  <button 
                    className="btn btn-outline-dark btn-lg px-4 py-3 fw-semibold"
                    onClick={() => navigate('/login')}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="col-lg-6">
              <div className="position-relative">
                {/* Main App Preview */}
                <div className="bg-white rounded-4 shadow-lg p-4 mx-auto" style={{maxWidth: '300px'}}>
                  <div className="bg-primary rounded-3 p-3 text-white text-center mb-3">
                    <i className="bi bi-car-front fs-1"></i>
                    <div className="fw-bold mt-2">Ride Available</div>
                    <small>2 min away</small>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <div className="bg-light rounded-2 p-2 text-center">
                      <small className="text-muted">Current Location</small>
                      <div className="fw-medium">City Center</div>
                    </div>
                    
                    <div className="text-center my-2">
                      <i className="bi bi-arrow-down text-primary"></i>
                    </div>
                    
                    <div className="bg-light rounded-2 p-2 text-center">
                      <small className="text-muted">Destination</small>
                      <div className="fw-medium">Airport Terminal</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements for Visual Interest */}
                <div className="position-absolute top-0 start-0 translate-middle bg-warning rounded-circle p-3 d-none d-lg-block">
                  <i className="bi bi-star-fill text-white"></i>
                </div>
                <div className="position-absolute bottom-0 end-0 translate-middle bg-success rounded-circle p-2 d-none d-lg-block">
                  <i className="bi bi-check-lg text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            &copy; 2024 UrbanRide. Making urban mobility better, one ride at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;