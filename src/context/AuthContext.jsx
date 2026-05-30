/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ── Guest flag helpers (localStorage-backed, no backend involvement) ──────────
export const getIsGuest = () => localStorage.getItem('isGuest') === 'true';

// Canvas image compression helper
const compressImage = (file, maxSize = 300) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const AuthProvider = ({ children }) => {
  // Use env var in production; fall back to localhost for local dev, and Render for prod
  const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://gravital-backend.onrender.com');

  const [currentUser, setCurrentUser] = useState(null);  // display username string (null for guests)
  const [authEmail, setAuthEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [scoreFlowData, setScoreFlowData] = useState(null);
  const [simulatorData, setSimulatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => getIsGuest());
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
    branch: '',
    year: '',
    targetCGPA: '',
    gradingSystem: 'VIT Grading',
    emailNotifications: true,
    twoFactorEnabled: true,
    memberSince: ''
  });

  // ── Core helper: attaches JWT to every authenticated request ──────────────
  const authFetch = useCallback((url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  }, []);

  // Profile localStorage key (auth users only)
  const getProfileKey = () => 'profile_data_local';

  // ── Load profile from backend (authenticated users only) ──────────────────
  const loadProfileData = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/profile/me`);
      if (res.status === 401) return null;
      const data = await res.json();
      if (data.success && data.profile) return data.profile;
    } catch (err) {
      console.error('Load Profile Error:', err);
    }
    return null;
  }, [API, authFetch]);

  // ── Rebuild profileData whenever currentUser/authEmail changes ─────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        // Authenticated user — load from localStorage then merge backend data
        const PROFILE_KEY = getProfileKey();
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          const hasMemberSince = !!parsed.memberSince;
          const updated = {
            name: parsed.name || currentUser,
            email: authEmail || parsed.email || '',
            profilePhoto: parsed.profilePhoto || '',
            branch: parsed.branch || '',
            year: parsed.year || '',
            targetCGPA: parsed.targetCGPA || '',
            gradingSystem: parsed.gradingSystem !== undefined ? parsed.gradingSystem : 'VIT Grading',
            emailNotifications: parsed.emailNotifications !== undefined ? parsed.emailNotifications : true,
            twoFactorEnabled: parsed.twoFactorEnabled !== undefined ? parsed.twoFactorEnabled : true,
            memberSince: parsed.memberSince || formattedDate
          };
          if (!hasMemberSince) localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
          setProfileData(updated);
        } else {
          const defaultProf = {
            name: currentUser,
            email: authEmail,
            profilePhoto: '',
            branch: '',
            year: '',
            targetCGPA: '',
            gradingSystem: 'VIT Grading',
            emailNotifications: true,
            twoFactorEnabled: true,
            memberSince: formattedDate
          };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProf));
          setProfileData(defaultProf);
        }

        // Merge backend profile data (photo, email, memberSince, name, branch, year, targetCGPA, gradingSystem, and notifications)
        loadProfileData().then((backendProfile) => {
          if (backendProfile) {
            setProfileData(prev => {
              const merged = {
                ...prev,
                name: backendProfile.name || prev.name || currentUser || '',
                email: backendProfile.email || prev.email || '',
                profilePhoto: backendProfile.profilePhoto || prev.profilePhoto || '',
                branch: backendProfile.branch || prev.branch || '',
                year: backendProfile.year || prev.year || '',
                targetCGPA: backendProfile.targetCGPA || prev.targetCGPA || '',
                gradingSystem: backendProfile.gradingSystem || prev.gradingSystem || 'VIT Grading',
                emailNotifications: backendProfile.emailNotifications !== undefined ? backendProfile.emailNotifications : prev.emailNotifications,
                twoFactorEnabled: backendProfile.twoFactorEnabled !== undefined ? backendProfile.twoFactorEnabled : prev.twoFactorEnabled,
                memberSince: backendProfile.memberSince
                  ? new Date(backendProfile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : prev.memberSince
              };
              localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
              return merged;
            });
          }
        });
      } else if (isGuest) {
        // Guest user — use a minimal local profile, no backend
        const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const stored = localStorage.getItem('profile_data_guest');
        if (stored) {
          setProfileData(JSON.parse(stored));
        } else {
          const guestProfile = {
            name: 'Guest User',
            email: 'guest@example.com',
            profilePhoto: '',
            branch: '',
            year: '',
            targetCGPA: '',
            gradingSystem: 'VIT Grading',
            emailNotifications: true,
            twoFactorEnabled: true,
            memberSince: formattedDate
          };
          localStorage.setItem('profile_data_guest', JSON.stringify(guestProfile));
          setProfileData(guestProfile);
        }
      } else {
        setProfileData({
          name: '', email: '', profilePhoto: '', branch: '', year: '',
          targetCGPA: '', gradingSystem: 'VIT Grading',
          emailNotifications: true, twoFactorEnabled: true, memberSince: ''
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser, authEmail, isGuest, loadProfileData]);

  const updateProfileData = useCallback(async (newData) => {
    if (currentUser) {
      // Authenticated user — save to localStorage & MongoDB (excluding profilePhoto which goes via ImageKit)
      const PROFILE_KEY = getProfileKey();
      const { profilePhoto: _profilePhoto, ...safeData } = newData;
      const updated = { ...profileData, ...safeData, email: authEmail || profileData.email };
      
      // Optimistic UI update
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfileData(updated);

      // Async sync to MongoDB
      try {
        const res = await authFetch(`${API}/api/profile/update`, {
          method: 'POST',
          body: JSON.stringify(safeData)
        });
        const data = await res.json();
        if (data.success && data.profile) {
          const merged = {
            ...updated,
            name: data.profile.name !== undefined ? data.profile.name : updated.name,
            branch: data.profile.branch !== undefined ? data.profile.branch : updated.branch,
            year: data.profile.year !== undefined ? data.profile.year : updated.year,
            targetCGPA: data.profile.targetCGPA !== undefined ? data.profile.targetCGPA : updated.targetCGPA,
            gradingSystem: data.profile.gradingSystem !== undefined ? data.profile.gradingSystem : updated.gradingSystem,
            emailNotifications: data.profile.emailNotifications !== undefined ? data.profile.emailNotifications : updated.emailNotifications,
            twoFactorEnabled: data.profile.twoFactorEnabled !== undefined ? data.profile.twoFactorEnabled : updated.twoFactorEnabled
          };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
          setProfileData(merged);
        }
      } catch (err) {
        console.error('Failed to sync profile updates to server:', err);
      }
      return { success: true };
    }
    if (isGuest) {
      // Guest — save locally
      const { profilePhoto: _profilePhoto, ...safeData } = newData;
      const updated = { ...profileData, ...safeData };
      localStorage.setItem('profile_data_guest', JSON.stringify(updated));
      setProfileData(updated);
      return { success: true };
    }
    return { success: false, error: 'No authenticated user' };
  }, [currentUser, isGuest, profileData, authEmail, API, authFetch]);

  // ── Upload profile photo via backend → ImageKit ───────────────────────────
  const uploadProfilePhoto = useCallback(async (file) => {
    if (!currentUser)
      return { success: false, error: 'Guest users cannot upload photos' };

    try {
      const compressedBase64 = await compressImage(file, 300);
      const res = await authFetch(`${API}/api/profile/upload-photo`, {
        method: 'POST',
        body: JSON.stringify({ file: compressedBase64 })
      });
      const data = await res.json();
      if (data.success && data.url) {
        // Persist the new profile photo URL to localStorage to prevent reversion on reload
        const PROFILE_KEY = getProfileKey();
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          parsed.profilePhoto = data.url;
          localStorage.setItem(PROFILE_KEY, JSON.stringify(parsed));
        }
        setProfileData(prev => ({ ...prev, profilePhoto: data.url }));
        return { success: true, url: data.url };
      }
      return { success: false, error: data.error || 'Upload failed' };
    } catch (err) {
      console.error('Upload Profile Photo Error:', err);
      return { success: false, error: 'Failed to upload photo' };
    }
  }, [currentUser, API, authFetch]);

  // ── Load GPA data from backend ────────────────────────────────────────────
  const loadUserData = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/gpa/`);
      if (res.status === 401) return null;
      const data = await res.json();
      if (data.email) setAuthEmail(data.email);
      return data;
    } catch (err) {
      console.error('Load GPA Error:', err);
      return null;
    }
  }, [API, authFetch]);

  // ── Load ScoreFlow data from backend ──────────────────────────────────────
  const loadScoreFlowData = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/scoreflow/`);
      if (res.status === 401) return;
      const data = await res.json();
      if (data.success && data.scoreFlowData) {
        setScoreFlowData(data.scoreFlowData);
        localStorage.setItem('vtop_imported_data', JSON.stringify(data.scoreFlowData));
      } else {
        setScoreFlowData(null);
      }
    } catch (err) {
      console.error('Load ScoreFlow Error:', err);
    }
  }, [API, authFetch]);

  // ── Load Simulator data from backend ──────────────────────────────────────
  const loadSimulatorData = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/gpa/simulator`);
      if (res.status === 401) return null;
      const data = await res.json();
      if (data.success && data.simulatorData) {
        setSimulatorData(data.simulatorData);
        localStorage.setItem('whatif_simulator_data', JSON.stringify(data.simulatorData));
        return data.simulatorData;
      } else {
        setSimulatorData(null);
        return null;
      }
    } catch (err) {
      console.error('Load Simulator Error:', err);
      return null;
    }
  }, [API, authFetch]);

  // ── Session restore on page refresh ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      // Warmup render-hosted backend
      fetch(`${API}/`).catch(() => { });

      // Guest users: purely client-side, skip all backend calls
      if (getIsGuest()) {
        const gData = localStorage.getItem('user_data_guest');
        setUserData(gData ? JSON.parse(gData) : null);
        const simData = localStorage.getItem('whatif_simulator_data_guest');
        setSimulatorData(simData ? JSON.parse(simData) : null);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Validate token by fetching profile — backend returns 401 if expired/invalid
      authFetch(`${API}/api/profile/me`)
        .then(res => {
          if (res.status === 401) {
            // Token expired or tampered — force clean logout
            localStorage.removeItem('token');
            localStorage.removeItem('profile_data_local');
            setIsLoading(false);
            return null;
          }
          return res.json();
        })
        .then(async (profileRes) => {
          if (!profileRes?.success) { setIsLoading(false); return; }

          const { username, email } = profileRes.profile;
          setCurrentUser(username);
          if (email) setAuthEmail(email);

          const [gpaResult] = await Promise.all([loadUserData(), loadScoreFlowData(), loadSimulatorData()]);
          setUserData(gpaResult?.gpaData || {});
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [API, loadScoreFlowData, loadUserData, loadSimulatorData, authFetch]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('isGuest');
      setCurrentUser(null);
      setIsGuest(false);

      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      console.log('[Auth] Login response:', data);

      if (data.success) {
        if (!data.token) {
          console.error('[Auth] ERROR: Backend returned success but no token. Is the deployed backend updated?');
          toast.error('Server configuration error. Please try again later.');
          return { success: false, error: 'No token received from server.' };
        }

        // 1. Store token
        localStorage.setItem('token', data.token);
        console.log('[Auth] Token stored:', data.token.substring(0, 20) + '...');

        // 2. Verify token immediately by calling /api/profile/me
        const profileRes = await authFetch(`${API}/api/profile/me`);
        console.log('[Auth] /api/profile/me status:', profileRes.status);

        if (!profileRes.ok) {
          localStorage.removeItem('token');
          toast.error('Authentication verification failed. Please try again.');
          return { success: false, error: 'Token verification failed.' };
        }

        const profileDataRes = await profileRes.json();
        console.log('[Auth] Profile data:', profileDataRes);

        // 3. Set user state from verified backend response
        const verifiedUsername = profileDataRes.profile?.username || data.username;
        const verifiedEmail = profileDataRes.profile?.email || data.email || '';

        setCurrentUser(verifiedUsername);
        if (verifiedEmail) setAuthEmail(verifiedEmail);

        // 4. Load GPA, ScoreFlow, and Simulator in parallel
        const [userDataResponse] = await Promise.all([loadUserData(), loadScoreFlowData(), loadSimulatorData()]);
        setUserData(userDataResponse?.gpaData || {});

        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[Auth] Login error:', err);
      toast.error('Cannot connect to server.');
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API, loadScoreFlowData, loadUserData, loadSimulatorData, authFetch]);

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async (username, email, password) => {
    try {
      localStorage.removeItem('isGuest');
      setIsGuest(false);

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      console.log('[Auth] Signup response:', data);

      if (data.success) {
        if (!data.token) {
          console.error('[Auth] ERROR: Backend returned success but no token.');
          toast.error('Server configuration error. Please try again later.');
          return { success: false, error: 'No token received from server.' };
        }

        localStorage.setItem('token', data.token);
        console.log('[Auth] Token stored after signup:', data.token.substring(0, 20) + '...');

        // Verify token by calling /api/profile/me
        const profileRes = await authFetch(`${API}/api/profile/me`);
        console.log('[Auth] /api/profile/me status after signup:', profileRes.status);

        if (!profileRes.ok) {
          localStorage.removeItem('token');
          toast.error('Authentication verification failed. Please try again.');
          return { success: false, error: 'Token verification failed.' };
        }

        const profileDataRes = await profileRes.json();
        const verifiedUsername = profileDataRes.profile?.username || data.username;

        setCurrentUser(verifiedUsername);
        setAuthEmail(email);

        toast.success('Signup successful!');
        return { success: true };
      } else {
        toast.error(data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      toast.error('Cannot connect to server.');
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API, authFetch]);

  // ── Google Login ──────────────────────────────────────────────────────────
  const googleLogin = useCallback(async (email) => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('isGuest');
      setCurrentUser(null);
      setIsGuest(false);

      const res = await fetch(`${API}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);

        // Load initial profile & details
        const profileRes = await authFetch(`${API}/api/profile/me`);
        if (profileRes.ok) {
          const profileDataRes = await profileRes.json();
          const verifiedUsername = profileDataRes.profile?.username || data.username;
          const verifiedEmail = profileDataRes.profile?.email || data.email || '';
          setCurrentUser(verifiedUsername);
          if (verifiedEmail) setAuthEmail(verifiedEmail);
        } else {
          setCurrentUser(data.username);
          setAuthEmail(data.email);
        }

        const [userDataResponse] = await Promise.all([loadUserData(), loadScoreFlowData(), loadSimulatorData()]);
        setUserData(userDataResponse?.gpaData || {});
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[Auth] Google login error:', err);
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API, loadScoreFlowData, loadUserData, loadSimulatorData, authFetch]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    localStorage.removeItem('profile_data_local');
    localStorage.removeItem('profile_data_guest');
    localStorage.removeItem('vtop_imported_data');
    localStorage.removeItem('user_data_guest');
    localStorage.removeItem('whatif_simulator_data');
    localStorage.removeItem('whatif_simulator_data_guest');
    setCurrentUser(null);
    setIsGuest(false);
    setAuthEmail('');
    setUserData(null);
    setScoreFlowData(null);
    setSimulatorData(null);
  }, []);

  // ── Guest mode (purely client-side, no JWT, no backend calls) ────────────
  const loginAsGuest = useCallback(() => {
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
    // currentUser stays null — guest identity is tracked via localStorage flag only
    const gData = localStorage.getItem('user_data_guest');
    setUserData(gData ? JSON.parse(gData) : null);
    setIsLoading(false);
  }, []);

  // ── Save GPA data ─────────────────────────────────────────────────────────
  const saveUserData = useCallback(async (data) => {
    if (isGuest) {
      localStorage.setItem('user_data_guest', JSON.stringify(data));
      setUserData(data);
      return;
    }

    const res = await authFetch(`${API}/api/gpa/save-gpa`, {
      method: 'POST',
      body: JSON.stringify({ gpaData: data })
    });
    const result = await res.json();
    if (result.success) setUserData(data || {});
  }, [isGuest, API, authFetch]);

  // ── Save ScoreFlow data ───────────────────────────────────────────────────
  const saveScoreFlowData = useCallback(async (data) => {
    // Guest: localStorage only — no backend
    if (isGuest) {
      if (data) {
        localStorage.setItem('vtop_imported_data', JSON.stringify(data));
      } else {
        localStorage.removeItem('vtop_imported_data');
      }
      setScoreFlowData(data);
      return;
    }

    if (!currentUser) {
      // Not logged in and not a guest — ignore
      return;
    }

    try {
      const res = await authFetch(`${API}/api/scoreflow/save`, {
        method: 'POST',
        body: JSON.stringify({ scoreFlowData: data })
      });
      const result = await res.json();
      if (result.success) {
        setScoreFlowData(data);
        if (data) {
          localStorage.setItem('vtop_imported_data', JSON.stringify(data));
        } else {
          localStorage.removeItem('vtop_imported_data');
        }
      }
    } catch (err) {
      console.error('Save ScoreFlow Error:', err);
    }
  }, [isGuest, currentUser, API, authFetch]);

  // ── Save Simulator data ───────────────────────────────────────────────────
  const saveSimulatorData = useCallback(async (data) => {
    if (isGuest) {
      localStorage.setItem('whatif_simulator_data_guest', JSON.stringify(data));
      setSimulatorData(data);
      return;
    }

    if (!currentUser) {
      return;
    }

    try {
      const res = await authFetch(`${API}/api/gpa/save-simulator`, {
        method: 'POST',
        body: JSON.stringify({ simulatorData: data })
      });
      const result = await res.json();
      if (result.success) {
        setSimulatorData(data);
        localStorage.setItem('whatif_simulator_data', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Save Simulator Error:', err);
    }
  }, [isGuest, currentUser, API, authFetch]);

  // ── Change password (Protected — token auth, no username in body) ─────────
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const res = await authFetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      return data.success
        ? { success: true }
        : { success: false, error: data.error || 'Password update failed' };
    } catch (err) {
      console.error('Change Password Error:', err);
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API, authFetch]);

  // ── Delete Account (Protected — token auth, requires password) ────────────
  const deleteAccount = useCallback(async (password) => {
    try {
      const res = await authFetch(`${API}/api/profile/delete-account`, {
        method: 'DELETE',
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        logout(); // Clear all local state and tokens upon successful deletion
        return { success: true };
      }
      return { success: false, error: data.message || data.error || 'Failed to delete account' };
    } catch (err) {
      console.error('Delete Account Error:', err);
      return { success: false, error: 'Cannot connect to server.' };
    }
  }, [API, logout, authFetch]);

  const contextValue = useMemo(() => ({
    currentUser, isGuest, login, signup, logout, loginAsGuest,
    userData, saveUserData, isLoading,
    profileData, updateProfileData, uploadProfilePhoto,
    scoreFlowData, saveScoreFlowData, changePassword, deleteAccount,
    simulatorData, saveSimulatorData, googleLogin
  }), [
    currentUser, isGuest, login, signup, logout, loginAsGuest,
    userData, saveUserData, isLoading,
    profileData, updateProfileData, uploadProfilePhoto,
    scoreFlowData, saveScoreFlowData, changePassword, deleteAccount,
    simulatorData, saveSimulatorData, googleLogin
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
