'use client';

import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  type?: 'linear' | 'circular';
  height?: string | number;
  fullPage?: boolean;
}

/**
 * A reusable loading component that can be used across the application
 * to provide consistent loading states.
 */
export default function LoadingState({
  message = 'Loading...',
  type = 'linear',
  height = 'auto',
  fullPage = false
}: LoadingStateProps) {
  const content = (
    <>
      {type === 'linear' ? (
        <LinearProgress sx={{ width: '100%', mx: 'auto' }} />
      ) : (
        <CircularProgress size={30} />
      )}
      {message && (
        <Typography align="center" variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </>
  );

  // For full page loading
  if (fullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)', // Account for app bar
          width: '100%',
          p: 3
        }}
      >
        {content}
      </Box>
    );
  }

  // For component-level loading
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
        width: '100%',
        my: 3
      }}
    >
      {content}
    </Box>
  );
} 