import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState(null);

  // Load auth state on mount
  useEffect(() => {
    const stored = localStorage.getItem('authState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
        setUser(parsed?.user || null);
      } catch (e) {
        console.error('Invalid authState in localStorage:', e);
        localStorage.removeItem('authState');
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever authState changes
  useEffect(() => {
    if (authState) {
      localStorage.setItem('authState', JSON.stringify(authState));
    } else {
      localStorage.removeItem('authState');
    }
  }, [authState]);

  // Migrate old hospitalUser data
  useEffect(() => {
    const oldData = localStorage.getItem('hospitalUser');
    if (oldData && !authState) {
      try {
        const oldUserData = JSON.parse(oldData);
        if (oldUserData?.data) {
          const { data } = oldUserData;
          const newState = {
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
              role: data.role,
              avatar: data.avatar || '',
            },
            token: data.token,
          };
          setAuthState(newState);
          setUser(newState.user);
          localStorage.setItem('authState', JSON.stringify(newState));
          localStorage.removeItem('hospitalUser'); // Clean up old data
          console.log('✅ Migrated old auth data');
        }
      } catch (e) {
        localStorage.removeItem('hospitalUser');
      }
    }
  }, []);

  const saveAuth = (apiResponse) => {
    if (!apiResponse?.success || !apiResponse.data) {
      throw new Error('Invalid API response format');
    }
    
    const { data } = apiResponse;
    const newState = {
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone || '',
        avatar: data.avatar || '',
      },
      token: data.token,
    };
    
    setAuthState(newState);
    setUser(newState.user);
    console.log('✅ Auth saved:', { role: newState.user.role, hasToken: !!newState.token });
    return newState;
  };

  const login = async (email, password) => {
    console.log('🔐 Login attempt:', { email: email.replace(/@.*$/, '@***') });
    try {
      const response = await API.post('/auth/login', { email, password });
      return saveAuth(response.data);
    } catch (error) {
      console.error('💥 Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    console.log('📝 Register attempt');
    try {
      const response = await API.post('/auth/register', userData);
      return saveAuth(response.data);
    } catch (error) {
      console.error('💥 Register failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const googleLogin = async (credential, role) => {
    console.log('🔗 Google login');
    try {
      const response = await API.post('/auth/google', { credential, role });
      return saveAuth(response.data);
    } catch (error) {
      console.error('💥 Google login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setAuthState(null);
    localStorage.removeItem('authState');
    localStorage.removeItem('hospitalUser'); // Legacy cleanup
    console.log('👋 Logged out');
  };

  // Stub missing endpoints - implement backend later
  const requestLoginOtp = async () => {
    throw new Error('Login OTP not implemented yet - use password login');
  };

  const verifyLoginOtp = async () => {
    throw new Error('Login OTP not implemented yet - use password login');
  };

  const requestPhoneOtp = async () => {
    throw new Error('Phone OTP not implemented');
  };

  const verifyPhoneOtp = async () => {
    throw new Error('Phone OTP not implemented');
  };

  const updateProfile = async () => {
    throw new Error('Profile update not implemented');
  };

  const requestForgotPasswordOtp = async () => {
    throw new Error('Password reset not implemented');
  };

  const resetPasswordWithOtp = async () => {
    throw new Error('Password reset not implemented');
  };

  const changePassword = async () => {
    throw new Error('Change password not implemented');
  };

  const requestEmailChangeOtp = async () => {
    throw new Error('Email change not implemented');
  };

  const verifyEmailChangeOtp = async () => {
    throw new Error('Email change not implemented');
  };

  const value = {
    user,
    token: authState?.token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    // Legacy stubs for UI compatibility
    requestLoginOtp,
    verifyLoginOtp,
    requestPhoneOtp,
    verifyPhoneOtp,
    updateProfile,
    requestForgotPasswordOtp,
    resetPasswordWithOtp,
    changePassword,
    requestEmailChangeOtp,
    verifyEmailChangeOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

