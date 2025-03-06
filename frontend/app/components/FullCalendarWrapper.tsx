'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import dynamic from 'next/dynamic';
import { getAppointments, Appointment } from '../api/appointmentApi';
import { format, parseISO } from 'date-fns';

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

// Define the event interface for the calendar
interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps?: {
    description?: string;
    client?: string;
    service?: string;
    status?: string;
    appointmentId?: string;
  };
}

const FullCalendarWrapper = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Function to convert backend appointments to calendar events
  const convertAppointmentsToEvents = (appointments: Appointment[]): Event[] => {
    return appointments.map(appointment => {
      // Format times from 24-hour number format (e.g., 1430 for 2:30 PM) to ISO string
      const startHour = Math.floor(appointment.startTime / 100);
      const startMinute = appointment.startTime % 100;
      const endHour = Math.floor(appointment.endTime / 100);
      const endMinute = appointment.endTime % 100;
      
      // Parse date and create Date objects with correct time
      const dateObj = parseISO(appointment.date);
      const startDate = new Date(dateObj);
      startDate.setHours(startHour, startMinute, 0);
      
      const endDate = new Date(dateObj);
      endDate.setHours(endHour, endMinute, 0);
      
      // Create event object
      return {
        id: appointment.id,
        title: `${appointment.client.name} - ${appointment.service.name}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        extendedProps: {
          description: appointment.notes || '',
          client: appointment.client.name,
          service: appointment.service.name,
          status: appointment.status,
          appointmentId: appointment.id
        }
      };
    });
  };
  
  // Load appointments from API
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date in ISO format (YYYY-MM-DD)
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      
      // Get date 30 days from now
      const endDate = format(new Date(today.setDate(today.getDate() + 30)), 'yyyy-MM-dd');
      
      // Fetch appointments for the next 30 days
      const response = await getAppointments(startDate, endDate);
      
      if (response.data) {
        const calendarEvents = convertAppointmentsToEvents(response.data);
        setEvents(calendarEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again later.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Load appointments on component mount
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  if (loading && events.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <FullCalendarComponent initialEvents={events} onAppointmentsChange={loadAppointments} />
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FullCalendarWrapper; 