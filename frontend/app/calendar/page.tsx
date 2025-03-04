'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FullCalendarWrapper from '../components/FullCalendarWrapper';

export default function CalendarPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Booking Calendar
      </Typography>
      <Paper elevation={3}>
        <FullCalendarWrapper />
      </Paper>
    </Box>
  );
} 