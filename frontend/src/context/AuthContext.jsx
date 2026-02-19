// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useReducer } from 'react';
import { authAPI } from '@api/auth';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            return;
          }
          
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              user: { username: decoded.sub, role: decoded.role },
              token 
            } 
          });
        } catch (error) {
          console.error('Token decode error:', error);
          logout();
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const data = await authAPI.login(username, password);
      const { access_token } = data;
      
      localStorage.setItem('token', access_token);
      
      const decoded = jwtDecode(access_token);
      const user = { username: decoded.sub, role: decoded.role };
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token: access_token } 
      });
      
      toast.success(`Welcome back, ${user.username}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    authAPI.logout();
    toast.info('Logged out successfully');
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
    isAnalyst: state.user?.role === 'analyst' || state.user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;