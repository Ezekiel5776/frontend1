import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import ProtectedRoute from './components/ProtectedRoute.js';

import Login from './pages/Login.js';
import Register from './pages/Register.js';
import ForgotPassword from './components/ForgotPassword.js';
import Homepage from './pages/Homepage.js';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard.js';
import DriverProfile from './pages/driver/DriverProfile.js';
import DriverEarnings from './pages/driver/DriverEarnings.js';
import DriverTrips from './pages/driver/DriverTrips.js';
import DriverSettings from './pages/driver/DriverSettings.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Rider Pages
import RiderDashboard from './pages/rider/RiderDashboard.js';
import RiderRideHistory from './pages/rider/RiderRideHistory.js';
import RiderPaymentMethods from './pages/rider/RiderPaymentMethods.js';
import RiderProfile from './pages/rider/RiderProfile.js';
import RiderSettings from './pages/rider/RiderSettings.js';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/driver/dashboard" element={<ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>} />
            <Route path="/driver/profile" element={<ProtectedRoute requiredRole="driver"><DriverProfile /></ProtectedRoute>} />
            <Route path="/driver/earnings" element={<ProtectedRoute requiredRole="driver"><DriverEarnings /></ProtectedRoute>} />
            <Route path="/driver/trips" element={<ProtectedRoute requiredRole="driver"><DriverTrips /></ProtectedRoute>} />
            <Route path="/driver/settings" element={<ProtectedRoute requiredRole="driver"><DriverSettings /></ProtectedRoute>} />

            {/* Rider Routes */}
            <Route path="/rider/dashboard" element={<ProtectedRoute requiredRole="rider"><RiderDashboard /></ProtectedRoute>} />
            <Route path="/rider/ride-history" element={<ProtectedRoute requiredRole="rider"><RiderRideHistory /></ProtectedRoute>} />
            <Route path="/rider/payment-methods" element={<ProtectedRoute requiredRole="rider"><RiderPaymentMethods /></ProtectedRoute>} />
            <Route path="/rider/profile" element={<ProtectedRoute requiredRole="rider"><RiderProfile /></ProtectedRoute>} />
            <Route path="/rider/settings" element={<ProtectedRoute requiredRole="rider"><RiderSettings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;