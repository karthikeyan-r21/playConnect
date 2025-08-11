import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/authAPI';

// Custom hook for login functionality
export const useLogin = () => {
  const { login, isLoading, error } = useAuth();
  const [loginError, setLoginError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoginError(null);
    const result = await login(credentials);
    
    if (!result.success) {
      setLoginError(result.error);
    }
    
    return result;
  };

  return {
    login: handleLogin,
    isLoading,
    error: loginError || error,
    clearError: () => setLoginError(null),
  };
};

// Custom hook for registration functionality
export const useRegister = () => {
  const { register, isLoading, error } = useAuth();
  const [registerError, setRegisterError] = useState(null);

  const handleRegister = async (userData) => {
    setRegisterError(null);
    const result = await register(userData);
    
    if (!result.success) {
      setRegisterError(result.error);
    }
    
    return result;
  };

  return {
    register: handleRegister,
    isLoading,
    error: registerError || error,
    clearError: () => setRegisterError(null),
  };
};

// Custom hook for forgot password functionality
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendForgotPasswordOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(true);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    sendForgotPasswordOTP,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
};

// Custom hook for reset password functionality
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetPassword = async (resetData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authAPI.resetPassword(resetData);
      setSuccess(true);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    resetPassword,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
};

// Custom hook for logout functionality
export const useLogout = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // You can add additional cleanup logic here if needed
  };

  return {
    logout: handleLogout,
  };
};

// Form validation hooks
export const useFormValidation = () => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, contains at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
  };

  return {
    validateEmail,
    validatePassword,
    validateName,
    validateRequired,
  };
};

// Custom hook for form state management
export const useFormState = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const setError = (name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    setError,
    clearErrors,
    resetForm,
  };
};
