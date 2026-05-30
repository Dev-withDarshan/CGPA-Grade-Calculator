import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Eye, EyeOff, ShieldCheck, Mail, Lock, Sun, Moon, TrendingUp, Rocket, BarChart2, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthScreen.css';
import { Footer } from './WhyGraVITal';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px', flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AstronautIcon = ({ size = 92, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Shoulders / Upper Suit */}
    <path d="M6 19.5c0-2 2-3.5 4-3.5h4c2 0 4 1.5 4 3.5v1.5H6v-1.5z" fill="currentColor" fillOpacity="0.15" />
    {/* Chest control panel */}
    <rect x="9.5" y="17.5" width="5" height="3.5" rx="1" fill="#000" stroke="currentColor" strokeWidth="1.2" />
    <line x1="11" y1="19.5" x2="13" y2="19.5" stroke="currentColor" strokeWidth="1" />
    <line x1="11" y1="20.5" x2="13" y2="20.5" stroke="currentColor" strokeWidth="1" />
    
    {/* Helmet outer shell */}
    <circle cx="12" cy="9.5" r="5.5" fill="#0c0a1c" stroke="currentColor" strokeWidth="1.8" />
    
    {/* Visor (dark inner screen) */}
    <path d="M9 9.5a3 3 0 1 1 6 0a3 3 0 0 1-6 0z" fill="#030208" stroke="currentColor" strokeWidth="1.2" />
    
    {/* Visor crescent reflection (left) */}
    <path d="M10.2 9a1.8 1.8 0 0 0 .4 1.3" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.95" />
    
    {/* Visor small reflection (right) */}
    <path d="M13.4 8.8a1.8 1.8 0 0 1 .4.7" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.6" />

    {/* Helmet Side Knobs */}
    <rect x="5.7" y="8.5" width="0.8" height="2" rx="0.4" fill="currentColor" />
    <rect x="17.5" y="8.5" width="0.8" height="2" rx="0.4" fill="currentColor" />

    {/* Sparkle Stars around the helmet */}
    {/* Sparkle top-right */}
    <path d="M19 4v3M17.5 5.5h3" stroke="currentColor" strokeWidth="0.8" />
    {/* Sparkle mid-left */}
    <path d="M4 11v2.5M2.75 12.25h2.5" stroke="currentColor" strokeWidth="0.8" />
    {/* Sparkle low-right */}
    <path d="M19.5 13v2.5M18.25 14.25h2.5" stroke="currentColor" strokeWidth="0.8" />
  </svg>
);

export default function AuthScreen() {
  useEffect(() => {
    if (window.location.pathname === "/login") {
      localStorage.removeItem("token");
    }
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-In Simulation States
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, signup, loginAsGuest, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (isLogin) {
      setLoading(true);
      try {
        const res = await login(normalizedUsername, password);
        if (!res.success) {
          setError(res.error);
        } else {
          navigate('/dashboard');
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      if (!normalizedEmail || !normalizedEmail.endsWith('@vitstudent.ac.in')) {
        setError('A valid VIT email is required');
        return;
      }
      setLoading(true);
      try {
        const res = await signup(normalizedUsername, normalizedEmail, password);
        if (!res.success) {
          setError(res.error);
        } else {
          navigate('/dashboard');
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setGoogleError('');

    if (!googleEmail.trim()) {
      setGoogleError('Enter an email address.');
      return;
    }

    const trimmedEmail = googleEmail.trim().toLowerCase();
    const parts = trimmedEmail.split('@');
    if (parts.length < 2) {
      setGoogleError('Enter a valid email address.');
      return;
    }

    const domain = parts[1];
    const allowedDomains = ['vitstudent.ac.in', 'vit.ac.in', 'vit.edu', 'vitstudent.edu'];
    if (!allowedDomains.includes(domain)) {
      setGoogleError('Only VIT student/faculty mail IDs are authorized to log in.');
      return;
    }

    setGoogleLoading(true);
    try {
      const res = await googleLogin(trimmedEmail);
      if (res.success) {
        toast.success('Successfully connected Google account!');
        setIsGoogleModalOpen(false);
        navigate('/dashboard');
      } else {
        setGoogleError(res.error || 'Google login failed.');
      }
    } catch {
      setGoogleError('Cannot connect to authentication server.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="cosmic-background">
        <div className="bg-overlay-gradient"></div>
      </div>

      {/* ─── LEFT PANEL (Brand & Universe Description) ─── */}
      <div className="auth-left-panel">
        <div className="brand-header">
          <button className="brand-logo-group brand-logo-clickable" onClick={() => navigate('/')} aria-label="Go to home">
            <div className="logo-orb">
              <img src="/Logo.png" alt="GraVITal Logo" className="logo-img-tag" />
            </div>
            <span className="brand-name">Gra<span className="brand-name-highlight">VIT</span>al</span>
          </button>
        </div>

        <div className="brand-content-middle">
          <div className="brand-badge-tag">
            <Sparkles size={12} className="badge-sparkle" />
            <span>SMARTER ACADEMICS. <span className="badge-highlight-text">BETTER FUTURE.</span></span>
          </div>
          <h1 className="brand-headline">
            Your CGPA.<br />
            Your Journey.<br />
            <span className="brand-gradient-text">Our Intelligence.</span>
          </h1>
          <p className="brand-description">
            Track, predict, and improve your academic performance with the power of AI.
          </p>
        </div>

        <div className="brand-footer-section">
          <div className="trusted-badge-premium">
            <div className="badge-icon-bg-shield">
              <ShieldCheck size={20} className="badge-icon-shield" />
            </div>
            <div className="badge-text-group">
              <span className="badge-title">Trusted by students at VIT</span>
              <span className="badge-desc">Join thousands of VITians improving every day.</span>
            </div>
          </div>
        </div>
      </div>
      {/* ─── RIGHT PANEL (Interactive Login/Signup Card) ─── */}
      <div className="auth-right-panel">
        <div className="auth-card-neon-border">
          <div className="auth-card-inner">
            <div className="auth-card-content">
              
              {/* Top Avatar Icon & Titles */}
              <div className="auth-form-title-group">
                <div className="title-header-inline">
                  <div className="title-profile-icon">
                    <AstronautIcon size={40} strokeWidth={2} />
                  </div>
                  <h2 className="auth-card-title">
                    {isLogin ? (
                      <span className="title-gradient-welcome">Welcome</span>
                    ) : (
                      <>
                        <span className="title-gradient-welcome">Create</span> <span className="title-text-back">Account</span>
                      </>
                    )}
                  </h2>
                </div>
                <p className="auth-card-subtitle">
                  {isLogin ? 'Log in to continue your journey' : 'Register to start your journey'}
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-interactive-form">
                
                {/* Username */}
                <div className="auth-input-group">
                  <div className="input-with-icon">
                    <User size={20} className="input-leading-icon" />
                    <input
                      type="text"
                      id="username"
                      className="auth-text-field"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Email (Signup only) */}
                {!isLogin && (
                  <div className="auth-input-group animate-fade-in">
                    <div className="input-with-icon">
                      <Mail size={20} className="input-leading-icon" />
                      <input
                        type="email"
                        id="email"
                        className="auth-text-field"
                        placeholder="VIT Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="auth-input-group">
                  <div className="input-with-icon">
                    <Lock size={20} className="input-leading-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="auth-text-field"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="auth-eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                {isLogin && (
                  <div className="form-secondary-actions">
                    <label className="remember-me-checkbox">
                      <div className="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div className="checkbox-box">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="forgot-password-link">Forgot password?</button>
                  </div>
                )}

                {/* Submit Button & Portal Vortex */}
                <div className="form-submit-group text-center">
                  <button
                    type="submit"
                    className="auth-submit-btn-premium"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner-small" />
                    ) : (
                      <>
                        <Rocket size={24} className="btn-submit-rocket-icon" />
                        <span>{isLogin ? 'Enter System' : 'Create Account'}</span>
                        <ArrowRight size={24} className="btn-submit-icon" />
                      </>
                    )}
                  </button>
                  
                  {/* Slim glowing line under Enter System */}
                  <div className="submit-glow-line">
                    <div className="glow-line-core"></div>
                  </div>
                </div>
              </form>

              {/* Divider */}
              <div className="auth-divider-line">
                <div className="divider-line"></div>
                <span>or</span>
                <div className="divider-line"></div>
              </div>

              {/* Google Sign-In Option */}
              <div className="google-login-option">
                <button
                  type="button"
                  className="google-login-btn-premium"
                  onClick={() => {
                    setGoogleEmail('');
                    setGoogleError('');
                    setIsGoogleModalOpen(true);
                  }}
                >
                  <GoogleIcon />
                  <span className="google-text-span">Continue with Google (VIT Mail ID Only!)</span>
                  <ChevronRight size={18} className="chevron-icon" />
                </button>
              </div>

              {/* Capsule Continue as Guest & Footer Toggle */}
              <div className="auth-card-footer">
                <div className="guest-login-option">
                  <button
                    type="button"
                    className="guest-login-btn-premium"
                    onClick={handleGuestLogin}
                  >
                    <span className="guest-icon-emoji">👽</span>
                    <span className="guest-text-span">Continue as Guest</span>
                    <ChevronRight size={18} className="chevron-icon" />
                  </button>
                </div>

                <div className="footer-toggle-container">
                  {isLogin ? (
                    <>
                      <span className="toggle-label-text">New Explorer?</span>
                      <button
                        type="button"
                        className="toggle-mode-btn-premium"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                      >
                        <span>Apply for Clearance (SignUp)</span>
                        <ChevronRight size={17} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="toggle-label-text">Returning Astronaut?</span>
                      <button
                        type="button"
                        className="toggle-mode-btn-premium"
                        onClick={() => { setIsLogin(true); setError(''); }}
                      >
                        <span>Initiate Login Sequence</span>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                  
                  {/* Slim glowing line under toggle */}
                  <div className="toggle-glow-line">
                    <div className="toggle-glow-line-core"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* ─── GOOGLE SIGN-IN MODAL SIMULATION ─── */}
      {isGoogleModalOpen && (
        <div className="google-modal-overlay" onClick={() => setIsGoogleModalOpen(false)}>
          <div className="google-signin-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-header">
              {/* Google multi-colored G logo */}
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h2 className="google-headline">Sign in</h2>
              <p className="google-subheading">to continue to GraVITal</p>
            </div>

            <form onSubmit={handleGoogleSubmit} className="google-body">
              <div className="google-input-wrapper">
                <input
                  type="email"
                  className="google-input-field"
                  placeholder=" "
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  disabled={googleLoading}
                  autoFocus
                />
                <label className="google-input-label">Email address</label>
              </div>

              {googleEmail.includes('@') && (
                <div className="google-domain-badge">
                  <span>Target: {googleEmail.split('@')[1]}</span>
                </div>
              )}

              <p className="google-note-text">
                To support academic database sync and verification, Google account login is <strong>restricted exclusively to VIT student and faculty mail IDs</strong> (e.g. <code>@vitstudent.ac.in</code>).
              </p>

              {googleError && (
                <div className="google-error-alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{googleError}</span>
                </div>
              )}

              <div className="google-actions">
                <button
                  type="button"
                  className="google-cancel-btn"
                  onClick={() => setIsGoogleModalOpen(false)}
                  disabled={googleLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="google-next-btn"
                  disabled={googleLoading}
                >
                  {googleLoading ? <span className="loading-spinner-small" style={{ width: '16px', height: '16px', borderTopColor: '#ffffff' }} /> : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
