import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/Api'; // Import API base URL

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [twoFACode, setTwoFACode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { 
    login, 
    verify2FA, 
    requires2FA, 
    setRequires2FA, 
    setPendingEmail,
    pendingEmail,
    forgotPassword // Use the forgotPassword from AuthContext if available
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.requires2FA) {
        setMessage(result.message || 'Check your email for the 2FA verification code');
        setPendingEmail(formData.email);
      } else {
        // Fallback: if no 2FA required, redirect based on user role
        if (result.user?.role === 'driver') {
          navigate('/driver/dashboard');
        } else {
          navigate('/rider/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!twoFACode || twoFACode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await verify2FA(twoFACode);
      
      // ✅ Redirect based on role
      if (result.user.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/rider/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      // Clear the code on error
      setTwoFACode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Re-login to trigger 2FA code resend
      const result = await login(formData.email, formData.password);
      setMessage('New verification code sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Use the forgotPassword from AuthContext if available, otherwise use direct fetch
      let result;
      if (forgotPassword) {
        result = await forgotPassword(formData.email);
      } else {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email: formData.email }),
        });
        result = await response.json();
      }

      setMessage(result.message || 'If that email exists, a reset code has been sent');
    } catch (err) {
      setError(err.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    setRequires2FA(false);
    setPendingEmail('');
    setTwoFACode('');
    setError('');
    setMessage('');
  };

  if (requires2FA) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="card-title fw-bold text-dark">Two-Factor Authentication</h2>
                    <p className="text-muted">Enter the code sent to {pendingEmail}</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="alert alert-info d-flex align-items-center" role="alert">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handle2FAVerify}>
                    <div className="mb-4">
                      <label htmlFor="twoFACode" className="form-label">Verification Code</label>
                      <input
                        type="text"
                        className="form-control text-center fw-bold fs-4"
                        id="twoFACode"
                        value={twoFACode}
                        onChange={(e) => {
                          // Only allow numbers and limit to 6 digits
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setTwoFACode(value);
                          if (error) setError('');
                        }}
                        placeholder="123456"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        required
                        autoFocus
                      />
                      <div className="form-text">Enter the 6-digit code from your email</div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2 fw-semibold mb-3"
                      disabled={loading || twoFACode.length !== 6}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>
                  </form>

                  <div className="text-center">
                    <button 
                      className="btn btn-link text-muted text-decoration-none me-3"
                      onClick={handleResendCode}
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                    <button 
                      className="btn btn-link text-primary text-decoration-none"
                      onClick={goBackToLogin}
                      disabled={loading}
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-dark">Welcome Back</h2>
                  <p className="text-muted">Sign in to your UrbanRide account</p>
                </div>

                {message && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {message}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <div className="text-end mt-2">
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="btn btn-link text-primary text-decoration-none small p-0 border-0 bg-transparent"
                        disabled={loading}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;