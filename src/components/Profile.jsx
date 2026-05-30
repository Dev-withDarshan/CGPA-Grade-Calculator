import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { capitalizeName } from '../utils/helpers';
import { computeAnalytics } from '../utils/analytics';
import {
  Camera, Save, User, Mail, ArrowLeft, GraduationCap, Calendar,
  Target, BookOpen, Award, Settings, Shield, ChevronRight,
  Sun, Moon, Eye, Pencil, Check, X, Zap, Bell, Lock, ShieldCheck,
  Monitor, Trash2, Headphones, TrendingUp, EyeOff, HelpCircle, Dna,
  Laptop, Smartphone, Globe, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Profile.css';
import WhyGraVITalSection from './WhyGraVITal';

/* ── Branch & Year Options ── */
const BRANCH_OPTIONS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication',
  'Electrical and Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Other'
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Profile() {
  const { profileData, updateProfileData, uploadProfilePhoto, isGuest, userData, changePassword, deleteAccount } = useAuth();
  const { theme, selectTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  /* ── Local form state (profile card) ── */
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  /* ── Local form state (academic card) ── */
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [targetCGPA, setTargetCGPA] = useState('');

  /* ── Local form state (preferences card) ── */
  const [gradingSystem, setGradingSystem] = useState('VIT Grading');
  const [emailNotifications, setEmailNotifications] = useState(true);

  /* ── Local form state (security card) ── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  /* ── Local form state (delete account card) ── */
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  /* ── Local state for 2FA and Sessions optimization ── */
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [is2FADisableOpen, setIs2FADisableOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Windows PC • Chrome', location: 'Chennai, India', date: 'Active now (Current)', current: true, type: 'pc' },
    { id: '2', device: 'iPhone 15 • Gravital App', location: 'Vellore, India', date: 'Last active: 2 hours ago', current: false, type: 'mobile' },
    { id: '3', device: 'MacBook Pro • Safari', location: 'Mumbai, India', date: 'Last active: 3 days ago', current: false, type: 'laptop' }
  ]);
  const [revokingSessionId, setRevokingSessionId] = useState(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const handleToggle2FA = () => {
    if (profileData.twoFactorEnabled) {
      setIs2FADisableOpen(true);
    } else {
      setIs2FASetupOpen(true);
    }
  };

  const handleVerifyEnable2FA = (e) => {
    if (e) e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length !== 6 || isNaN(twoFactorCode)) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    const res = updateProfileData({ twoFactorEnabled: true });
    if (res.success) {
      toast.success("Two-Factor Authentication enabled successfully!");
      setTwoFactorCode('');
      setIs2FASetupOpen(false);
    } else {
      toast.error(res.error || "Failed to enable 2FA");
    }
  };

  const handleDisable2FA = (e) => {
    if (e) e.preventDefault();
    if (!twoFactorPassword) {
      toast.error("Please enter password to confirm");
      return;
    }
    const res = updateProfileData({ twoFactorEnabled: false });
    if (res.success) {
      toast.success("Two-Factor Authentication disabled.");
      setTwoFactorPassword('');
      setIs2FADisableOpen(false);
    } else {
      toast.error(res.error || "Failed to disable 2FA");
    }
  };

  const handleRevokeSession = (sessionId) => {
    setRevokingSessionId(sessionId);
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setRevokingSessionId(null);
      toast.success("Device session revoked successfully");
    }, 800);
  };

  const handleRevokeAllSessions = () => {
    setIsRevokingAll(true);
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.current));
      setIsRevokingAll(false);
      toast.success("All other sessions revoked");
    }, 1000);
  };

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText("GRVT-Y7KJ-9PLX-ZQ2B");
    toast.success("Secret key copied to clipboard!");
  };

  /* ── Editing & Preview Toggles ── */
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  /* ── Sync with context ── */
  useEffect(() => {
    if (profileData) {
      const timer = setTimeout(() => {
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setPhoto(profileData.profilePhoto || '');
        setBranch(profileData.branch || '');
        setYear(profileData.year || '');
        setTargetCGPA(userData?.target?.targetCGPA || profileData.targetCGPA || '');
        setBio(profileData.bio || '');
        setGradingSystem(profileData.gradingSystem || 'VIT Grading');
        setEmailNotifications(profileData.emailNotifications !== undefined ? profileData.emailNotifications : true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profileData, userData]);

  const handleCGPAChange = (e) => {
    let val = e.target.value;
    if (val.includes('.') && val.split('.')[1].length > 2) return;
    setTargetCGPA(val);
  };

  const handleBioChange = (e) => {
    const text = e.target.value;
    if (text.length <= 160) {
      setBio(text);
    }
  };

  const targetCGPAError = targetCGPA && (Number(targetCGPA) < 0 || Number(targetCGPA) > 10)
    ? 'CGPA must be between 0 and 10'
    : '';

  /* ── Handlers ── */
  const handleAvatarClick = () => {
    // Only allow file upload if editing is unlocked or if just clicked
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }

    // Upload to ImageKit via backend
    setIsUploadingPhoto(true);
    const result = await uploadProfilePhoto(file);
    setIsUploadingPhoto(false);

    if (result.success) {
      setPhoto(result.url);
      toast.success("Profile photo updated!");
    } else {
      toast.error(result.error || "Failed to upload photo");
    }
  };

  const hasUnsavedChanges =
    name.trim() !== (profileData?.name || '').trim() ||
    bio.trim() !== (profileData?.bio || '').trim() ||
    branch !== (profileData?.branch || '') ||
    year !== (profileData?.year || '') ||
    targetCGPA !== (userData?.target?.targetCGPA || profileData?.targetCGPA || '');

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleDiscardChanges = () => {
    setName(profileData?.name || '');
    setBio(profileData?.bio || '');
    setBranch(profileData?.branch || '');
    setYear(profileData?.year || '');
    setTargetCGPA(userData?.target?.targetCGPA || profileData?.targetCGPA || '');
    toast.success("Changes discarded");
  };

  const handleSaveAllChanges = (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Display Name cannot be empty");
      return;
    }
    if (targetCGPA !== '') {
      const val = parseFloat(targetCGPA);
      if (isNaN(val) || val < 0 || val > 10) {
        toast.error("Target CGPA must be between 0.00 and 10.00");
        return;
      }
    }
    const res = updateProfileData({
      name: name.trim(),
      bio: bio.trim(),
      branch,
      year,
      targetCGPA
    });
    if (res.success) {
      toast.success("Profile changes saved!");
    } else {
      toast.error(res.error || "Save failed");
    }
  };

  const handleThemeSelect = (newTheme) => {
    selectTheme(newTheme);
    updateProfileData({ theme: newTheme });
    toast.success(`Theme set to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
  };

  const handleGradingSystemChange = (e) => {
    const val = e.target.value;
    setGradingSystem(val);
    updateProfileData({ gradingSystem: val });
    toast.success(`Grading system updated to ${val}`);
  };

  const handleEmailNotificationsToggle = (e) => {
    const val = e.target.checked;
    setEmailNotifications(val);
    updateProfileData({ emailNotifications: val });
    toast.success(val ? "Email notifications enabled" : "Email notifications disabled");
  };



  const handleUpdatePassword = async (e) => {
    if (e) e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter current password");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^a-zA-Z0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber || !hasSymbol) {
      toast.error("Password must contain letters, numbers, and symbols");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (isGuest) {
      toast.success("Password updated successfully (Guest Mock)!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
      return;
    }

    const loadingToast = toast.loading("Updating password...");
    const res = await changePassword(currentPassword, newPassword);
    toast.dismiss(loadingToast);

    if (res.success) {
      toast.success("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
    } else {
      toast.error(res.error || "Failed to update password");
    }
  };

  const handleDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    if (!deletePassword) {
      toast.error("Please enter your password to confirm");
      return;
    }

    if (isGuest) {
      toast.error("Guest accounts cannot be deleted");
      return;
    }

    const loadingToast = toast.loading("Deleting account...");
    const res = await deleteAccount(deletePassword);
    toast.dismiss(loadingToast);

    if (res.success) {
      toast.success("Account deleted successfully");
      setIsDeleteAccountOpen(false);
      navigate('/login');
    } else {
      toast.error(res.error || "Failed to delete account");
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const getInitials = () => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  // isGuest comes from AuthContext (localStorage-backed flag, no backend involvement)

  // Compute dynamic user stats
  const semesters = userData?.overall?.semesters || [];
  const analytics = computeAnalytics(semesters);

  const currentCGPAVal = analytics.cgpa ? analytics.cgpa.toFixed(2) : '0.00';
  const targetCGPAVal = targetCGPA ? Number(targetCGPA).toFixed(2) : '0.00';
  const semestersCount = semesters.length;
  const creditsCount = analytics.totalCredits || 0;

  /* ═══ PREVIEW MODE SCREEN ═══ */
  if (isPreviewMode) {
    const bestSemesterCGPA = semesters.length > 0
      ? Math.max(...semesters.map(s => s.gpa || 0), 0).toFixed(2)
      : '0.00';

    const isOnTrack = Number(currentCGPAVal) >= Number(targetCGPAVal);

    return (
      <div className="prof-preview-modal-backdrop animate-fade-in" onClick={() => setIsPreviewMode(false)}>
        <div className="prof-preview-modal-container" onClick={(e) => e.stopPropagation()}>

          <div className="prof-preview-modal-header">
            <div className="prof-preview-header-left">
              <div className="prof-preview-title-row">
                <Eye size={20} className="preview-eye-icon" />
                <h2>Profile Preview</h2>
              </div>
              <p className="preview-subtitle">This is how your profile appears to others.</p>
            </div>
            <button className="btn-close-preview" onClick={() => setIsPreviewMode(false)} aria-label="Close Preview">
              <X size={18} />
            </button>
          </div>

          <div className="prof-preview-badge-card">
            <div className="badge-glow-effect" />

            <div className="badge-header">
              <div className="badge-header-left">
                <span className="badge-logo-text">GRAVITAL ACADEMIC PROFILE</span>
                <span className="badge-verified-label">
                  <span className="dot-green"></span> OFFICIAL
                </span>
              </div>
              <div className="badge-verified-student">
                <ShieldCheck size={14} className="verified-shield-icon" />
                <span>Verified Student</span>
              </div>
            </div>

            <div className="badge-body">
              <div className="badge-avatar-outer">
                <div className="badge-avatar-wrap">
                  {photo ? (
                    <img src={photo} alt={name} className="badge-avatar-img" />
                  ) : (
                    <div className="badge-avatar-fallback">{getInitials()}</div>
                  )}
                </div>
              </div>

              <h2 className="badge-name">
                {capitalizeName(name) || 'Student Name'}
                <span className="badge-verified-checkmark">✔</span>
              </h2>
              <span className="badge-email">
                <Mail size={13} className="badge-mail-icon" />
                {email || 'no-email@vitstudent.ac.in'}
              </span>

              <div className="badge-details-grid">
                <div className="badge-detail-item">
                  <span className="item-label">BRANCH</span>
                  <span className="item-val">{branch || 'Not Specified'}</span>
                </div>
                <div className="badge-detail-item">
                  <span className="item-label">CURRENT YEAR</span>
                  <span className="item-val">{year || 'Not Specified'}</span>
                </div>
                <div className="badge-detail-item">
                  <span className="item-label">CURRENT CGPA</span>
                  <div className="item-cgpa-row">
                    <span className="item-valHighlight">{currentCGPAVal}</span>
                    <span className="cgpa-status-tag tag-excellent">
                      Excellent <span className="dot-green-small"></span>
                    </span>
                  </div>
                </div>
                <div className="badge-detail-item">
                  <span className="item-label">TARGET CGPA</span>
                  <div className="item-cgpa-row">
                    <span className="item-valHighlight target-highlight">{targetCGPAVal}</span>
                    <span className="cgpa-status-tag tag-target">
                      {Number(targetCGPAVal) > 0 ? 'Active Target' : 'Set your target'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Stats Box Section */}
              <div className="badge-stats-row">
                <div className="badge-stat-box">
                  <GraduationCap size={16} className="stat-box-icon" />
                  <span className="stat-box-value">{semestersCount}</span>
                  <span className="stat-box-label">Semesters</span>
                </div>
                <div className="badge-stat-box">
                  <Zap size={16} className="stat-box-icon" />
                  <span className="stat-box-value">{creditsCount}</span>
                  <span className="stat-box-label">Credits Earned</span>
                </div>
                <div className="badge-stat-box">
                  <BookOpen size={16} className="stat-box-icon" />
                  <span className="stat-box-value">{bestSemesterCGPA}</span>
                  <span className="stat-box-label">Best Semester CGPA</span>
                </div>
                <div className="badge-stat-box">
                  <TrendingUp size={16} className="stat-box-icon" />
                  <span className="stat-box-value status-text-highlight">
                    {isOnTrack ? 'On Track' : 'Needs Effort'}
                  </span>
                  <span className="stat-box-label">Progress Status</span>
                </div>
              </div>

              {bio && (
                <div className="badge-bio">
                  <span className="bio-label">BIO</span>
                  <p className="bio-text">"{bio}"</p>
                </div>
              )}
            </div>

            <div className="badge-footer">
              <div className="badge-footer-left">
                <Calendar size={14} className="footer-icon" />
                <div className="footer-meta-item">
                  <span>MEMBER SINCE</span>
                  <strong>{profileData?.memberSince || 'May 2026'}</strong>
                </div>
              </div>
              <div className="badge-footer-right">
                <ShieldCheck size={14} className="footer-icon icon-green" />
                <div className="footer-meta-item">
                  <span>STATUS</span>
                  <span className="badge-status-active">
                    Active Student <span className="dot-green-small"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="prof-preview-modal-footer">
            <div className="footer-public-notice">
              <Lock size={15} className="notice-lock-icon" />
              <span>Your profile is public to other students on Gravital. Only your name, academic info and stats are visible.</span>
            </div>
            <button className="btn-edit-profile-modal" onClick={() => setIsPreviewMode(false)}>
              <Pencil size={13} /> Edit Profile
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="prof-page animate-fade-in">
      {/* ── Header actions ── */}
      <div className="prof-header-actions">
        <button className="btn-back-dashboard" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {hasUnsavedChanges && (
          <div className="unsaved-changes-inline-warning">
            <span className="unsaved-changes-dot"></span>
            <span className="unsaved-changes-text">You have unsaved changes</span>
            <div className="unsaved-changes-inline-actions">
              <button type="button" className="btn-discard-inline" onClick={handleDiscardChanges}>
                Discard
              </button>
              <button type="button" className="btn-save-inline" onClick={handleSaveAllChanges}>
                Save
              </button>
            </div>
          </div>
        )}

        <button className="prof-preview-btn" onClick={() => setIsPreviewMode(true)}>
          <Eye size={16} /> Preview Profile
        </button>
      </div>

      {/* ── Page Title ── */}
      <div className="prof-page-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information, academic details, and preferences.</p>
      </div>

      {/* ═══ HERO CARD — Avatar + Identity ═══ */}
      <section className="prof-card prof-hero-card">
        <div className="prof-hero-left">
          {/* Avatar with pencil overlay */}
          <div className="prof-avatar-container">
            <div className="prof-avatar-wrapper" onClick={handleAvatarClick}>
              {photo ? (
                <img src={photo} alt={name} className="prof-avatar-img" />
              ) : (
                <div className="prof-avatar-fallback">{getInitials()}</div>
              )}
              <div className="prof-avatar-overlay">
                {isUploadingPhoto ? (
                  <div className="prof-avatar-spinner" />
                ) : (
                  <>
                    <Camera size={18} color="#fff" />
                    <span>Change</span>
                  </>
                )}
              </div>
            </div>
            <div className="prof-avatar-pencil-badge" onClick={handleAvatarClick}>
              <Pencil size={11} color="#333" />
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

          {/* Identity */}
          <div className="prof-hero-info">
            <div className="prof-hero-name-row">
              <h2>{capitalizeName(name) || 'Your Name'}</h2>
              <span className="prof-verified-badge">✔ Verified</span>
            </div>
            <span className="prof-hero-email">{email || '—'}</span>
            <span className="prof-avatar-hint">Upload a clear profile picture. Max size 2MB. JPG, PNG or WebP.</span>
          </div>
        </div>

        {/* Right side stats */}
        {!isGuest && (
          <div className="prof-hero-right">
            <div className="prof-hero-stat">
              <Calendar size={18} />
              <div>
                <span className="prof-hero-stat-label">Member since</span>
                <span className="prof-hero-stat-value">{profileData?.memberSince || 'May 2026'}</span>
              </div>
            </div>
            <div className="prof-hero-stat">
              <Shield size={18} />
              <div>
                <span className="prof-hero-stat-label">Account status</span>
                <span className="prof-hero-stat-value prof-status-active">
                  Active <span className="prof-status-dot" />
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ═══ STATISTICS METRICS GRID ═══ */}
      <div className="prof-stats-grid">
        <div className="prof-stat-card">
          <div className="prof-stat-info">
            <span className="prof-stat-value">{currentCGPAVal}</span>
            <span className="prof-stat-label">Current CGPA</span>
          </div>
          <div className="prof-stat-icon icon-cgpa">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="prof-stat-card">
          <div className="prof-stat-info">
            <span className="prof-stat-value">{targetCGPAVal}</span>
            <span className="prof-stat-label">Target CGPA</span>
          </div>
          <div className="prof-stat-icon icon-target">
            <Target size={18} />
          </div>
        </div>

        <div className="prof-stat-card">
          <div className="prof-stat-info">
            <span className="prof-stat-value">{semestersCount}</span>
            <span className="prof-stat-label">Semesters</span>
          </div>
          <div className="prof-stat-icon icon-sems">
            <BookOpen size={18} />
          </div>
        </div>

        <div className="prof-stat-card">
          <div className="prof-stat-info">
            <span className="prof-stat-value">{creditsCount}</span>
            <span className="prof-stat-label">Credits Earned</span>
          </div>
          <div className="prof-stat-icon icon-credits">
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* ═══ TWO-COLUMN GRID: Personal + Academic ═══ */}
      <div className="prof-two-col">
        {/* ── Personal Information ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <div className="prof-card-header-left">
              <User size={18} />
              <h3>Personal Information</h3>
            </div>
          </div>

          <form onSubmit={handleSaveAllChanges} className="prof-form">
            <div className="prof-field">
              <label className="prof-label">Display Name</label>
              <div className="prof-input-wrap">
                <User size={15} className="prof-input-icon" />
                <input
                  type="text"
                  className="prof-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="prof-field">
              <div className="prof-label-row">
                <label className="prof-label">Email Address</label>
                <span className="email-verified-tag-inline">Verified</span>
              </div>
              <div className="prof-input-wrap">
                <Mail size={15} className="prof-input-icon" />
                <input
                  type="email"
                  className="prof-input prof-input-disabled"
                  value={email}
                  readOnly
                  disabled
                />
              </div>
              <span className="prof-hint">Email is linked to your account and cannot be changed.</span>
            </div>

            <div className="prof-field">
              <label className="prof-label">Bio</label>
              <div className="prof-input-wrap">
                <Dna size={15} className="prof-input-icon" style={{ top: '14px', transform: 'none' }} />
                <textarea
                  className="prof-input prof-bio-textarea"
                  value={bio}
                  onChange={handleBioChange}
                  placeholder="Building smarter academic tools"
                  rows={1}
                />
                <span className="prof-char-counter">{bio.length}/160</span>
              </div>
            </div>
          </form>
        </section>

        {/* ── Academic Details ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <div className="prof-card-header-left">
              <GraduationCap size={18} />
              <h3>Academic Details</h3>
            </div>
          </div>

          <form onSubmit={handleSaveAllChanges} className="prof-form">
            <div className="prof-field">
              <label className="prof-label">Branch</label>
              <div className="prof-input-wrap">
                <BookOpen size={15} className="prof-input-icon" />
                <select
                  className="prof-input prof-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="prof-field">
              <label className="prof-label">Current Year</label>
              <div className="prof-input-wrap">
                <Calendar size={15} className="prof-input-icon" />
                <select
                  className="prof-input prof-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="prof-field">
              <label className="prof-label">Target CGPA</label>
              <div className="prof-input-wrap">
                <Target size={15} className="prof-input-icon" />
                <input
                  type="number"
                  className={`prof-input ${targetCGPAError ? 'input-error' : ''}`}
                  value={targetCGPA}
                  onChange={handleCGPAChange}
                  placeholder="Enter CGPA (0 - 10)"
                  min="0"
                  max="10"
                  step="0.01"
                  style={targetCGPAError ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {targetCGPAError ? (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>{targetCGPAError}</span>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', display: 'block' }}>Valid range: 0.00 to 10.00</span>
              )}
            </div>
          </form>
        </section>
      </div>

      <div className="prof-two-col">
        {/* ── Preferences ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <div className="prof-card-header-left">
              <Settings size={18} className="prof-header-icon" />
              <h3>Preferences</h3>
            </div>
          </div>
          <div className="prof-settings-list">
            <div className="prof-setting-row">
              <div className="prof-setting-icon-wrapper icon-theme-orange">
                <Moon size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Theme</span>
                <span className="prof-setting-desc">Choose your preferred theme</span>
              </div>
              <div className="theme-segment-control">
                <button
                  type="button"
                  className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('light')}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('dark')}
                >
                  Dark
                </button>
                <button
                  type="button"
                  className={`theme-segment-btn ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => handleThemeSelect('system')}
                >
                  System
                </button>
              </div>
            </div>

            <div className="prof-setting-row">
              <div className="prof-setting-icon-wrapper icon-theme-blue">
                <Award size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Grade System</span>
                <span className="prof-setting-desc">Select your grading system</span>
              </div>
              <div className="prof-select-wrap-narrow">
                <select
                  className="prof-input prof-select-narrow"
                  value={gradingSystem}
                  onChange={handleGradingSystemChange}
                >
                  <option value="VIT Grading">VIT Grading</option>
                  <option value="10-Point Standard">10-Point Standard</option>
                  <option value="4-Point GPA">4-Point GPA</option>
                </select>
              </div>
            </div>

            <div className="prof-setting-row">
              <div className="prof-setting-icon-wrapper icon-theme-pink">
                <Bell size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Email Notifications</span>
                <span className="prof-setting-desc">Receive updates and notifications</span>
              </div>
              <div className="prof-toggle-wrap">
                <label className="prof-switch">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={handleEmailNotificationsToggle}
                  />
                  <span className="prof-slider"></span>
                </label>
              </div>
            </div>

            <div className="prof-support-action-container">
              <button
                type="button"
                className="prof-btn-support-full"
                onClick={() => window.open('mailto:darshanedu2256@gmail.com', '_blank')}
              >
                <Headphones size={15} /> Need Help? Contact Support
              </button>
            </div>
          </div>
        </section>

        {/* ── Account & Security ── */}
        <section className="prof-card">
          <div className="prof-card-header">
            <div className="prof-card-header-left">
              <Shield size={18} className="prof-header-icon" />
              <h3>Account & Security</h3>
            </div>
          </div>
          <div className="prof-settings-list">
            <div
              className="prof-setting-row prof-setting-clickable"
              onClick={() => setIsChangePasswordOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`prof-setting-icon-wrapper icon-theme-violet ${isChangePasswordOpen ? 'active' : ''}`}>
                <Lock size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Change Password</span>
                <span className="prof-setting-desc">Update your account password</span>
              </div>
              <ChevronRight
                size={16}
                className="prof-setting-chevron"
                style={{
                  marginLeft: 'auto'
                }}
              />
            </div>

            <div
              className="prof-setting-row prof-setting-clickable"
              onClick={handleToggle2FA}
              style={{ cursor: 'pointer' }}
            >
              <div className={`prof-setting-icon-wrapper icon-theme-green ${profileData.twoFactorEnabled ? 'active' : ''}`}>
                <Shield size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Two-Factor Authentication</span>
                <span className="prof-setting-desc">Add an extra layer of security</span>
              </div>
              <span className={`prof-setting-status-label ${profileData.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                {profileData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <ChevronRight size={16} className="prof-setting-chevron" />
            </div>

            <div
              className="prof-setting-row prof-setting-clickable"
              onClick={() => setIsSessionsOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="prof-setting-icon-wrapper icon-theme-sky">
                <Monitor size={16} />
              </div>
              <div className="prof-setting-info">
                <span className="prof-setting-title">Active Sessions</span>
                <span className="prof-setting-desc">Manage your active sessions</span>
              </div>
              <div
                className="status-badge-inline count-badge"
                style={{
                  marginLeft: 'auto',
                  marginRight: '8px'
                }}
              >
                {sessions.length}
              </div>
              <ChevronRight size={16} className="prof-setting-chevron" />
            </div>

            <div className="prof-delete-action-container">
              <button
                type="button"
                className="prof-btn-delete-account-full"
                onClick={() => setIsDeleteAccountOpen(true)}
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ SETTINGS DONE DIVIDER ═══ */}
      <div className="prof-settings-done-divider">
        {/* Eclipse circle backing */}
        <div className="divider-eclipse" />

        {/* Floating particles */}
        <div className="divider-particles">
          <span className="particle p1" />
          <span className="particle p2" />
          <span className="particle p3" />
          <span className="particle p4" />
          <span className="particle p5" />
        </div>

        {/* Center checkmark badge */}
        <div className="divider-check-badge">
          <div className="divider-check-badge-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Text stack */}
        <h3 className="divider-title">You're all set!</h3>
        <p className="divider-subtitle">Settings saved successfully.</p>

        {/* Highlight row with side lines */}
        <div className="divider-highlight-row">
          <div className="highlight-line line-left" />
          <span className="highlight-text">Now let's take your CGPA to the next level.</span>
          <div className="highlight-line line-right" />
        </div>
      </div>

      {/* ═══ WHY GRAVITAL SHOWCASE, CTA & FOOTER ═══ */}
      <WhyGraVITalSection />

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {isChangePasswordOpen && createPortal(
        <div className="prof-pwd-modal-backdrop" onClick={() => {
          setIsChangePasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}>
          <div className="prof-pwd-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="prof-pwd-modal-close" onClick={() => {
              setIsChangePasswordOpen(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }} aria-label="Close modal">
              <X size={18} />
            </button>

            {/* Header Row */}
            <div className="prof-pwd-modal-header-row">
              <div className="prof-pwd-illustration-wrap">
                <div className="prof-pwd-illustration-glow" />
                <svg className="prof-pwd-shield-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <filter id="shieldGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {/* Orbiting rings */}
                  <ellipse cx="50" cy="50" rx="36" ry="12" stroke="url(#shieldGrad)" strokeWidth="1" opacity="0.4" transform="rotate(-15 50 50)" />
                  <ellipse cx="50" cy="50" rx="42" ry="6" stroke="url(#shieldGrad)" strokeWidth="0.8" opacity="0.3" transform="rotate(10 50 50)" />

                  {/* Shield background */}
                  <path d="M50 15 C65 15, 78 22, 78 38 C78 62, 50 82, 50 85 C50 82, 22 62, 22 38 C22 22, 35 15, 50 15 Z" fill="rgba(99, 102, 241, 0.08)" stroke="url(#shieldGrad)" strokeWidth="2.5" filter="url(#shieldGlow)" />

                  {/* Padlock inside shield */}
                  <rect x="40" y="48" width="20" height="15" rx="3" fill="url(#shieldGrad)" />
                  <path d="M44 48 V42 C44 38.5, 46.5 36, 50 36 C53.5 36, 56 38.5, 56 42 V48" stroke="url(#shieldGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <circle cx="50" cy="55" r="2" fill="#0b0f19" />
                  <line x1="50" y1="57" x2="50" y2="60" stroke="#0b0f19" strokeWidth="1.5" />

                  {/* Sparkle stars */}
                  <path d="M25 22 L26 25 L29 26 L26 27 L25 30 L24 27 L21 26 L24 25 Z" fill="#c084fc" opacity="0.7" />
                  <path d="M75 70 L76 72 L78 73 L76 74 L75 76 L74 74 L72 73 L74 72 Z" fill="#818cf8" opacity="0.8" />
                </svg>
              </div>

              <div className="prof-pwd-modal-header-text">
                <h2>Change Password</h2>
                <p>Update your password to keep your account secure.</p>
              </div>
            </div>

            {/* Password Form */}
            <form onSubmit={handleUpdatePassword} className="prof-pwd-modal-form">
              {/* Current Password */}
              <div className="prof-field">
                <label className="prof-label">Current Password</label>
                <div className="prof-input-wrap">
                  <Lock size={15} className="prof-input-icon" />
                  <input
                    type={showPasswordCurrent ? "text" : "password"}
                    className="prof-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                  >
                    {showPasswordCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="prof-field">
                <label className="prof-label">New Password</label>
                <div className="prof-input-wrap">
                  <Lock size={15} className="prof-input-icon" />
                  <input
                    type={showPasswordNew ? "text" : "password"}
                    className="prof-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswordNew(!showPasswordNew)}
                  >
                    {showPasswordNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="prof-pwd-strength-row">
                <Shield size={14} className="strength-icon" />
                <span className="strength-label">Password strength:</span>
                <div className="strength-bars">
                  <span className={`strength-bar ${getPasswordStrength(newPassword) >= 1 ? 'filled-' + ['weak', 'medium', 'strong'][getPasswordStrength(newPassword) - 1] : ''}`} />
                  <span className={`strength-bar ${getPasswordStrength(newPassword) >= 2 ? 'filled-' + ['weak', 'medium', 'strong'][getPasswordStrength(newPassword) - 1] : ''}`} />
                  <span className={`strength-bar ${getPasswordStrength(newPassword) >= 3 ? 'filled-' + ['weak', 'medium', 'strong'][getPasswordStrength(newPassword) - 1] : ''}`} />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="prof-field">
                <label className="prof-label">Confirm New Password</label>
                <div className="prof-input-wrap">
                  <Lock size={15} className="prof-input-icon" />
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    className="prof-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Requirement Alert Banner */}
              <div className="prof-pwd-info-banner">
                <div className="info-icon-circle">
                  <span>i</span>
                </div>
                <p>Use at least 8 characters with a mix of letters, numbers and symbols.</p>
              </div>

              {/* Actions Footer */}
              <div className="prof-pwd-modal-actions">
                <button
                  type="button"
                  className="prof-pwd-btn-cancel"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="prof-pwd-btn-submit">
                  <Lock size={14} /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ DELETE ACCOUNT MODAL ═══ */}
      {isDeleteAccountOpen && createPortal(
        <div className="prof-pwd-modal-backdrop" onClick={() => {
          setIsDeleteAccountOpen(false);
          setDeletePassword('');
        }}>
          <div className="prof-pwd-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="prof-pwd-modal-close" onClick={() => {
              setIsDeleteAccountOpen(false);
              setDeletePassword('');
            }} aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="prof-pwd-modal-header-row" style={{ alignItems: 'flex-start' }}>
              <div className="prof-setting-icon-wrapper icon-theme-red active" style={{ marginTop: '4px' }}>
                <Trash2 size={24} />
              </div>
              <div className="prof-pwd-modal-header-text">
                <h2 style={{ color: '#ef4444' }}>Delete Account</h2>
                <p>This action is irreversible. All your data, including profile info, GPA history, and settings will be permanently deleted.</p>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount} className="prof-pwd-modal-form">
              <div className="prof-field">
                <label className="prof-label">Confirm Password</label>
                <div className="prof-input-wrap">
                  <Lock size={15} className="prof-input-icon" />
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    className="prof-input"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                  >
                    {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="prof-pwd-modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="prof-pwd-btn-cancel"
                  onClick={() => {
                    setIsDeleteAccountOpen(false);
                    setDeletePassword('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="prof-pwd-btn-submit" style={{ background: '#ef4444', borderColor: '#f87171', color: '#fff' }}>
                  <Trash2 size={14} /> Delete Permanently
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ TWO-FACTOR SETUP MODAL ═══ */}
      {is2FASetupOpen && createPortal(
        <div className="prof-pwd-modal-backdrop" onClick={() => {
          setIs2FASetupOpen(false);
          setTwoFactorCode('');
        }}>
          <div className="prof-pwd-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="prof-pwd-modal-close" onClick={() => {
              setIs2FASetupOpen(false);
              setTwoFactorCode('');
            }} aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="prof-pwd-modal-header-row">
              <div className="prof-pwd-illustration-wrap">
                <div className="prof-pwd-illustration-glow" style={{ background: 'rgba(16, 185, 129, 0.15)' }} />
                <ShieldCheck size={40} className="icon-green" style={{ color: '#10b981' }} />
              </div>
              <div className="prof-pwd-modal-header-text">
                <h2>Set up 2-Factor Authentication</h2>
                <p>Protect your account with a secondary verification code.</p>
              </div>
            </div>

            <div className="twofactor-setup-content" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="twofactor-qr-section" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" style={{ color: '#0f172a', background: 'white', padding: '6px', borderRadius: '8px', flexShrink: 0 }}>
                  <rect x="0" y="0" width="20" height="20" fill="black" />
                  <rect x="5" y="5" width="10" height="10" fill="white" />
                  <rect x="80" y="0" width="20" height="20" fill="black" />
                  <rect x="85" y="5" width="10" height="10" fill="white" />
                  <rect x="0" y="80" width="20" height="20" fill="black" />
                  <rect x="5" y="85" width="10" height="10" fill="white" />
                  <rect x="30" y="10" width="10" height="10" fill="black" />
                  <rect x="50" y="30" width="20" height="10" fill="black" />
                  <rect x="10" y="40" width="10" height="20" fill="black" />
                  <rect x="40" y="60" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="15" height="15" fill="black" />
                  <rect x="85" y="85" width="10" height="10" fill="black" />
                  <rect x="35" y="80" width="15" height="10" fill="black" />
                </svg>
                <div className="twofactor-qr-text">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Scan this QR code with Google Authenticator or Microsoft Authenticator</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--card-border)', width: 'fit-content' }}>
                    <code style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '1px' }}>GRVT-Y7KJ-9PLX-ZQ2B</code>
                    <button type="button" onClick={handleCopySecretKey} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyEnable2FA} className="prof-pwd-modal-form" style={{ marginTop: '0' }}>
                <div className="prof-field">
                  <label className="prof-label">Verification Code</label>
                  <div className="prof-input-wrap">
                    <Shield size={15} className="prof-input-icon" />
                    <input
                      type="text"
                      maxLength="6"
                      className="prof-input"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code"
                      required
                      style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                <div className="prof-pwd-modal-actions" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="prof-pwd-btn-cancel"
                    onClick={() => {
                      setIs2FASetupOpen(false);
                      setTwoFactorCode('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="prof-pwd-btn-submit" style={{ background: '#10b981', borderColor: '#34d399' }}>
                    <ShieldCheck size={14} /> Verify & Enable
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ TWO-FACTOR DISABLE MODAL ═══ */}
      {is2FADisableOpen && createPortal(
        <div className="prof-pwd-modal-backdrop" onClick={() => {
          setIs2FADisableOpen(false);
          setTwoFactorPassword('');
        }}>
          <div className="prof-pwd-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="prof-pwd-modal-close" onClick={() => {
              setIs2FADisableOpen(false);
              setTwoFactorPassword('');
            }} aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="prof-pwd-modal-header-row" style={{ alignItems: 'flex-start' }}>
              <div className="prof-setting-icon-wrapper icon-theme-red active" style={{ marginTop: '4px' }}>
                <Shield size={24} />
              </div>
              <div className="prof-pwd-modal-header-text">
                <h2 style={{ color: '#ef4444' }}>Disable Two-Factor Authentication</h2>
                <p>Disabling 2FA reduces your account security. You will no longer be prompted for verification codes during login.</p>
              </div>
            </div>

            <form onSubmit={handleDisable2FA} className="prof-pwd-modal-form">
              <div className="prof-field">
                <label className="prof-label">Confirm Password</label>
                <div className="prof-input-wrap">
                  <Lock size={15} className="prof-input-icon" />
                  <input
                    type="password"
                    className="prof-input"
                    value={twoFactorPassword}
                    onChange={(e) => setTwoFactorPassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    required
                  />
                </div>
              </div>

              <div className="prof-pwd-modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="prof-pwd-btn-cancel"
                  onClick={() => {
                    setIs2FADisableOpen(false);
                    setTwoFactorPassword('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="prof-pwd-btn-submit" style={{ background: '#ef4444', borderColor: '#f87171', color: '#fff' }}>
                  Disable 2FA
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═══ ACTIVE SESSIONS MANAGER MODAL ═══ */}
      {isSessionsOpen && createPortal(
        <div className="prof-pwd-modal-backdrop" onClick={() => setIsSessionsOpen(false)}>
          <div className="prof-pwd-modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <button className="prof-pwd-modal-close" onClick={() => setIsSessionsOpen(false)} aria-label="Close modal">
              <X size={18} />
            </button>

            <div className="prof-pwd-modal-header-row">
              <div className="prof-pwd-illustration-wrap" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
                <Monitor size={24} style={{ color: '#0ea5e9' }} />
              </div>
              <div className="prof-pwd-modal-header-text">
                <h2>Active Device Sessions</h2>
                <p>Manage and audit your active logins across devices and browsers.</p>
              </div>
            </div>

            <div className="sessions-list-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map(s => (
                <div key={s.id} className="session-item" style={{ display: 'flex', alignItems: 'center', padding: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="session-icon-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: s.current ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: s.current ? '#10b981' : 'var(--text-muted)' }}>
                      {s.type === 'pc' || s.type === 'laptop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{s.device}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={11} /> {s.location} • {s.date}
                      </span>
                    </div>
                  </div>
                  {s.current ? (
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>Current</span>
                  ) : (
                    <button
                      type="button"
                      disabled={revokingSessionId === s.id}
                      onClick={() => handleRevokeSession(s.id)}
                      style={{ fontSize: '12px', background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', cursor: 'pointer', opacity: revokingSessionId === s.id ? 0.5 : 1 }}
                    >
                      {revokingSessionId === s.id ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}

              {sessions.length > 1 && (
                <button
                  type="button"
                  className="btn-revoke-all"
                  disabled={isRevokingAll}
                  onClick={handleRevokeAllSessions}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isRevokingAll ? 'Revoking...' : 'Revoke All Other Sessions'}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
