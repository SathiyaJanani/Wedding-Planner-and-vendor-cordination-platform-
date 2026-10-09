import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure base API defaults
axios.defaults.baseURL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wpvcp_token'));
  const [loading, setLoading] = useState(true);

  // Setup Axios interceptors for robust JWT handling
  useEffect(() => {
    // Request interceptor to attach JWT Bearer token
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('wpvcp_token') || token;
        if (storedToken && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to catch 401 and handle session expiry gracefully
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          const errorCode = error.response.data?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'NO_TOKEN') {
            // Token has expired or is invalid
            if (token) {
              console.warn('[JWT]: Session has expired or token is invalid. Logging out.');
              logout();
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  // Set axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('wpvcp_token', token);
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('wpvcp_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async (tokenOverride = null) => {
    setLoading(true);
    try {
      const activeToken = tokenOverride || token || localStorage.getItem('wpvcp_token');
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.warn('Session expired or invalid token.');
      setToken(null);
      setUser(null);
      localStorage.removeItem('wpvcp_token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async () => {
    try {
      const response = await axios.get('/api/auth/verify-token');
      return response.data?.valid === true;
    } catch (e) {
      return false;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh-token');
      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data.token;
      }
    } catch (e) {
      logout();
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const register = async (formData) => {
    const response = await axios.post('/api/auth/register', formData);
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const googleLogin = async (googleData) => {
    const response = await axios.post('/api/auth/google', googleData);
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('wpvcp_token');
  };

  const updateProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const setAuthToken = async (newToken, optionalUser = null) => {
    setLoading(true);
    setToken(newToken);
    localStorage.setItem('wpvcp_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    if (optionalUser) {
      setUser(optionalUser);
      setLoading(false);
      return optionalUser;
    }
    return await fetchCurrentUser(newToken);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
      verifySession,
      refreshToken,
      setAuthToken,
      isAuthenticated: !!user,
      role: user?.role_name || user?.role
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
