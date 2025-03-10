'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('User is not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h5" sx={{ mt: 4 }}>
        Redirecting...
      </Typography>
    </Box>
  );
}
