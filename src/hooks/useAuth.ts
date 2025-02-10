import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { LoginCredentials, SignUpData } from '../types';
import { ROUTES } from '../config/constants';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const success = await authService.login(credentials.email, credentials.password);
      if (success) {
        navigate(ROUTES.VIDEO);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const signup = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const success = await authService.signup(data);
      if (success) {
        navigate(ROUTES.VIDEO);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  return {
    isAuthenticated: authService.isAuthenticated(),
    user: authService.getUser(),
    login,
    signup,
    logout,
    isLoading
  };
};