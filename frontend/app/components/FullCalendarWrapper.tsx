'use client';

import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import FullCalendar to avoid SSR issues
const FullCalendarComponent = dynamic(
  () => import('./FullCalendarComponent'),
  { 
    ssr: false, // Disable server-side rendering
    loading: () => (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '500px' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
);

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

const FullCalendarWrapper = () => {
  // Sample events - replace with actual API calls in production
  const INITIAL_EVENTS: Event[] = [
    {
      id: '1',
      title: 'Client Meeting',
      start: new Date().toISOString().split('T')[0] + 'T10:00:00',
      end: new Date().toISOString().split('T')[0] + 'T11:30:00',
    },
    {
      id: '2',
      title: 'Hair Styling',
      start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T14:00:00',
      end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T15:00:00',
    }
  ];
  
  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%', p: 2 }}>
      <FullCalendarComponent initialEvents={INITIAL_EVENTS} />
    </Box>
  );
};

export default FullCalendarWrapper; 