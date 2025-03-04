'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FullCalendarWrapper from '../components/FullCalendarWrapper';
import { useLanguage } from '../translations/LanguageContext';

export default function CalendarPage() {
  const { t } = useLanguage();
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('calendar.title')}
      </Typography>
      <Paper elevation={3}>
        <FullCalendarWrapper />
      </Paper>
    </Box>
  );
} 