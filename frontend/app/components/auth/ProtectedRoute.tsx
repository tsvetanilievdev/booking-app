'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * A component that protects routes requiring authentication.
 * It redirects to the login page if the user is not authenticated.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProtectedRoute: Checking authentication...', {
        isLoading,
        isAuthenticated,
        user,
        adminOnly
      });

      // Wait for the auth context to finish loading
      if (isLoading) {
        console.log('ProtectedRoute: Auth context is still loading...');
        return;
      }

      if (!isAuthenticated || !user) {
        console.log('ProtectedRoute: User is not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      if (adminOnly && user.role !== 'ADMIN') {
        console.log('ProtectedRoute: User is not an admin, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      console.log('ProtectedRoute: Authentication check passed');
      setIsChecking(false);
    };

    checkAuth();
  }, [isLoading, isAuthenticated, user, adminOnly, router]);

  if (isLoading || isChecking) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Проверка на достъпа...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 