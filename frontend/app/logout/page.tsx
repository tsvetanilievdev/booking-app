'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      // Small delay to ensure the page is rendered before logout
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 500);
    };
    
    performLogout();
  }, [logout, router]);
  
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
        Logging out...
      </Typography>
    </Box>
  );
} 