import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    user,
    isSignedIn,
    loading,
    error,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };