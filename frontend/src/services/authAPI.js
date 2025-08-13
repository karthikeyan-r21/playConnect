import api from './api';

// Authentication API calls
export const authAPI = {
  // Register user
  register: async (userData) => {
    const formData = new FormData();
    
    // Append all user data to FormData
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        if (key === 'profileImage' && userData[key] instanceof File) {
          formData.append('profileImage', userData[key]);
        } else {
          formData.append(key, userData[key]);
        }
      }
    });

    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;

  },

  // Send forgot password OTP
  forgotPassword: async (email) => {
    const response = await api.post('/password/forgot-password', { email });
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (resetData) => {
    const response = await api.post('/password/reset-password', resetData);
    return response.data;
  },

  // Logout user (client-side cleanup)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Set user data in localStorage
  setUserData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default authAPI;
