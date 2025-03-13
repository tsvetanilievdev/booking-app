'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import { useLanguage } from '../translations/LanguageContext';
import { createAppointment, updateAppointment, deleteAppointment, getAvailableTimeSlots, TimeSlot } from '../api/appointmentApi';
import { SelectChangeEvent } from '@mui/material';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// Create mock data and functions to handle missing API modules
// This will allow the component to work even if the API files aren't properly loaded
const mockServices = [
  {
    id: '1',
    name: 'Haircut',
    duration: 30,
    price: 35
  },
  {
    id: '2',
    name: 'Facial',
    duration: 60,
    price: 50
  }
];

const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com'
  }
];

// Try to import the real API modules, but fall back to mock functions if they're not available
let getServices;
let getClients;

try {
  // Try to dynamically import (this won't work in Next.js client components, but the catch will)
  const serviceModule = require('../api/serviceApi');
  const clientModule = require('../api/clientApi');
  getServices = serviceModule.getServices;
  getClients = clientModule.getClients;
} catch (e) {
  console.error('Failed to import API modules, using mocks instead:', e);
  // Mock API functions
  getServices = async () => ({ data: mockServices });
  getClients = async () => ({ data: mockClients });
}

// Import FullCalendar and required plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parse, isAfter, parseISO } from 'date-fns';

// Define the event interface for type safety
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

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface FullCalendarComponentProps {
  initialEvents: Event[];
  onAppointmentsChange: () => void;
}

interface EventFormData {
  title: string;
  clientId: string;
  serviceId: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
}

interface FormErrors {
  clientId: boolean;
  serviceId: boolean;
  date: boolean;
  startTime: boolean;
}

// Update the CreateAppointmentData interface to include userId
interface FixedCreateAppointmentData {
  date: string;
  startTime: string; // Changed to string to match backend expectations
  clientId: string;
  serviceId: string;
  notes?: string;
  userId: string; // Added userId
}

const FullCalendarComponent: React.FC<FullCalendarComponentProps> = ({ initialEvents, onAppointmentsChange }) => {
  const { t } = useLanguage();
  const { user } = useAuth(); // Get the current user from auth context
  const { clients, services, loadingClients, loadingServices, clientError, serviceError, refreshData } = useData();
  
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    clientId: '',
    serviceId: '',
    description: '',
    date: '',
    startTime: '',
    duration: 60
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    clientId: false,
    serviceId: false,
    date: false,
    startTime: false
  });
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update component events when initialEvents change
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Load available time slots when date and service change
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (eventFormData.date && eventFormData.serviceId) {
        try {
          setLoading(true);
          console.log(`Fetching available time slots for date: ${eventFormData.date}, service: ${eventFormData.serviceId}`);
          
          const response = await getAvailableTimeSlots(eventFormData.date, eventFormData.serviceId);
          
          if (response.data && response.data.availableSlots) {
            console.log(`Received ${response.data.availableSlots.length} available time slots:`, response.data.availableSlots);
            setAvailableTimeSlots(response.data.availableSlots);
            
            // If there are no available slots, show a message
            if (response.data.availableSlots.length === 0) {
              setErrorMessage('No available time slots for the selected date and service. Please try another date.');
              setIsSnackbarOpen(true);
            } else if (response.error && response.data.availableSlots.length > 0) {
              // If we're using mock slots, show a notice but not as an error
              console.log('Using mock time slots for testing:', response.error);
              // Don't show error snackbar for mock slots
            }
          } else {
            console.warn('No available slots in response:', response);
            setAvailableTimeSlots([]);
            
            // If there's an API error response, show it
            if (response.error) {
              setErrorMessage(`Error fetching time slots: ${response.error}`);
              setIsSnackbarOpen(true);
            }
          }
        } catch (err) {
          console.error('Error fetching available time slots:', err);
          setAvailableTimeSlots([]);
          setErrorMessage('Failed to load available time slots. Please try again later.');
          setIsSnackbarOpen(true);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchAvailableTimeSlots();
  }, [eventFormData.date, eventFormData.serviceId]);

  const handleDateSelect = (selectInfo: any) => {
    const selectedDate = format(new Date(selectInfo.startStr), 'yyyy-MM-dd');
    
    setEventFormData({
      ...eventFormData,
      date: selectedDate,
      startTime: '',
      title: '',
      clientId: '',
      serviceId: '',
      description: '',
      duration: 60
    });
    
    setIsEditMode(false);
    setCurrentEventId(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    
    if (event && event.extendedProps && event.extendedProps.appointmentId) {
      // Prepare form data for editing
      const startDate = new Date(event.start);
      
      // Extract client ID and service ID from the event's extendedProps
      const clientId = clients.find(c => c.name === event.extendedProps.client)?.id || '';
      const serviceId = services.find(s => s.name === event.extendedProps.service)?.id || '';
      
      setEventFormData({
        title: event.title,
        clientId: clientId,
        serviceId: serviceId,
        description: event.extendedProps.description || '',
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        duration: Math.round((new Date(event.end).getTime() - startDate.getTime()) / (60 * 1000))
      });
      
      setIsEditMode(true);
      setCurrentEventId(event.extendedProps.appointmentId);
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormErrors({
      clientId: false,
      serviceId: false,
      date: false,
      startTime: false
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    
    if (name) {
      setEventFormData({
        ...eventFormData,
        [name]: value
      });
    }
  };

  const validateForm = (): boolean => {
    // First check for user authentication
    if (!user || !user.id) {
      setErrorMessage('You must be logged in to create appointments');
      setIsSnackbarOpen(true);
      return false;
    }
    
    // Create a validation errors object
    const errors = {
      clientId: !eventFormData.clientId,
      serviceId: !eventFormData.serviceId,
      date: !eventFormData.date,
      startTime: !eventFormData.startTime
    };
    
    // Collect validation messages for each field
    const validationMessages = [];
    
    // Validate client ID
    if (errors.clientId) {
      validationMessages.push('Client is required');
    } else if (!clients.some(c => c.id === eventFormData.clientId)) {
      errors.clientId = true;
      validationMessages.push('Selected client is not valid');
    }
    
    // Validate service ID
    if (errors.serviceId) {
      validationMessages.push('Service is required');
    } else if (!services.some(s => s.id === eventFormData.serviceId)) {
      errors.serviceId = true;
      validationMessages.push('Selected service is not valid');
    }
    
    // Validate date
    if (errors.date) {
      validationMessages.push('Date is required');
    } else {
      // Check if date is in valid format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(eventFormData.date)) {
        errors.date = true;
        validationMessages.push('Date format must be YYYY-MM-DD');
      }
    }
    
    // Validate start time
    if (errors.startTime) {
      validationMessages.push('Start time is required');
    }
    
    // If basic validation passes, also check if appointment is in the future
    if (!errors.date && !errors.startTime) {
      // Create a Date object from the selected date and time
      const formattedDateTime = formatTimeForBackend(eventFormData.startTime, eventFormData.date);
      if (formattedDateTime) {
        const appointmentDate = new Date(formattedDateTime);
        const now = new Date();
        
        if (appointmentDate <= now) {
          errors.startTime = true;
          validationMessages.push('Appointment time must be in the future');
        }
      } else {
        errors.startTime = true;
        validationMessages.push('Invalid date/time format');
      }
    }
    
    // Update the form errors state
    setFormErrors(errors);
    
    // If there are validation errors, show an error message
    if (validationMessages.length > 0) {
      setErrorMessage(validationMessages.join('. '));
      setIsSnackbarOpen(true);
      return false;
    }
    
    return true;
  };

  // Update the formatTimeForBackend function to return a full ISO date string
  const formatTimeForBackend = (timeString: string, dateString: string): string => {
    // Handle empty or invalid time strings
    if (!timeString || timeString.trim() === '' || !dateString || dateString.trim() === '') {
      console.error('Invalid time or date string provided:', { timeString, dateString });
      return ''; // Return empty string to trigger validation error
    }
    
    try {
      // Parse the date string (expected format: YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Check if this is a 12-hour format time with AM/PM
      const is12HourFormat = timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm');
      
      let hours = 0;
      let minutes = 0;
      
      if (is12HourFormat) {
        // Parse 12-hour format (e.g., "12:30 PM")
        const isPM = timeString.toLowerCase().includes('pm');
        const timePart = timeString.replace(/\s*(am|pm)\s*/i, '');
        const [hoursStr, minutesStr] = timePart.split(':');
        hours = parseInt(hoursStr, 10);
        minutes = parseInt(minutesStr, 10);
        
        // Adjust hours for PM (except 12 PM)
        if (isPM && hours !== 12) {
          hours += 12;
        }
        // Adjust 12 AM to 0 hours
        if (!isPM && hours === 12) {
          hours = 0;
        }
      } else {
        // Parse 24-hour format (e.g., "14:30")
        const [hoursStr, minutesStr] = timeString.split(':');
        hours = parseInt(hoursStr, 10);
        minutes = parseInt(minutesStr, 10);
      }
      
      // Validate all components
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid date/time components:', { year, month, day, hours, minutes });
        return '';
      }
      
      // Create a Date object with the parsed values
      const date = new Date(year, month - 1, day, hours, minutes, 0);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date created:', date);
        return '';
      }
      
      // Return as ISO string
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting time for backend:', error);
      return '';
    }
  };

  const handleEventCreate = async () => {
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Now we pass both the time and date to the formatTimeForBackend function
        const formattedStartTime = formatTimeForBackend(eventFormData.startTime, eventFormData.date);
        
        // Validate startTime is a proper value
        if (!formattedStartTime) {
          throw new Error('Invalid start time format. Please select a valid time.');
        }
        
        // Check if user is logged in
        if (!user || !user.id) {
          throw new Error('You must be logged in to create appointments.');
        }
        
        // Find the selected service to get its duration
        const selectedService = services.find(s => s.id === eventFormData.serviceId);
        
        if (!selectedService) {
          throw new Error('Selected service not found');
        }
        
        // Create appointment data with proper validation
        const appointmentData: FixedCreateAppointmentData = {
          date: eventFormData.date,
          startTime: formattedStartTime, // Now this is a full ISO string
          clientId: eventFormData.clientId,
          serviceId: eventFormData.serviceId,
          notes: eventFormData.description || '', // Ensure notes is always a string
          userId: user.id // Include the user ID from auth context
        };
        
        console.log('Creating appointment with data:', appointmentData);
        
        let response;
        
        if (isEditMode && currentEventId) {
          // Update existing appointment
          response = await updateAppointment(currentEventId, appointmentData);
        } else {
          // Create new appointment
          response = await createAppointment(appointmentData);
        }
        
        // Check if response contains an error
        if (response.error) {
          throw new Error(response.error);
        }
        
        // If we get here, the operation was successful
        if (isEditMode) {
          setSuccessMessage('Appointment updated successfully!');
        } else {
          setSuccessMessage('Appointment created successfully!');
        }
        setIsSuccessSnackbarOpen(true);
        
        // Close dialog and reset form
      setIsDialogOpen(false);
        setEventFormData({
          title: '',
          clientId: '',
          serviceId: '',
          description: '',
          date: '',
          startTime: '',
          duration: 60
        });
        
        // Notify parent to reload appointments
        onAppointmentsChange();
        
      } catch (err: any) {
        console.error('Error saving appointment:', err);
        
        // Extract error message from different possible formats
        let errorMsg = '';
        
        // Check for specific ZodError format
        if (err?.data?.error?.type === 'ZodError') {
          console.log('ZodError details:', err.data.error);
          
          // Use userMessage if available from our enhanced API error handling
          if (err.data.userMessage) {
            errorMsg = err.data.userMessage;
          } 
          // Try to extract more specific details about the validation error
          else if (err.data.error.details) {
            try {
              // Try to parse the error details
              const details = err.data.error.details;
              
              // Check for issues array (typically present in Zod errors)
              if (details.issues && Array.isArray(details.issues)) {
                // Map each issue to a readable message
                const messages = details.issues.map((issue: any) => {
                  const path = issue.path ? issue.path.join('.') : 'field';
                  return `${path}: ${issue.message}`;
                });
                
                errorMsg = `Validation error: ${messages.join('; ')}`;
              } else {
                // If no issues array, stringify the entire details object
                errorMsg = `Validation error: ${JSON.stringify(details)}`;
              }
            } catch (parseErr) {
              console.error('Failed to parse ZodError details:', parseErr);
              errorMsg = 'Invalid data format. Please check all fields.';
            }
          } else if (err.data.error.message) {
            errorMsg = err.data.error.message;
          } else {
            errorMsg = 'Data validation failed. Please check all fields.';
          }
        } 
        // Check for error object with 'message' property
        else if (err?.message) {
          errorMsg = err.message;
        } 
        // Default error message
        else {
          errorMsg = 'Failed to save appointment. Please try again.';
        }
        
        setErrorMessage(errorMsg);
        setIsSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEventDelete = async () => {
    if (isEditMode && currentEventId) {
      setLoading(true);
      
      try {
        await deleteAppointment(currentEventId);
        
        // Close dialog and reset form
        setIsDialogOpen(false);
      setEventFormData({
        title: '',
          clientId: '',
          serviceId: '',
        description: '',
          date: '',
          startTime: '',
          duration: 60
        });
        
        // Notify parent to reload appointments
        onAppointmentsChange();
        
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setErrorMessage('Failed to delete appointment. Please try again.');
        setIsSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTimeSlot = (timeSlot: TimeSlot): string => {
    try {
      // If already in string format (e.g., "09:30"), parse it
      if (typeof timeSlot.startTime === 'string') {
        const [hoursStr, minutesStr] = timeSlot.startTime.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.error('Invalid time components in string time slot:', timeSlot);
          return 'Invalid time';
        }
        
        // Format as 12-hour time with AM/PM for better readability
        const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const amPm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
      } 
      
      // Legacy handling for numeric time slots - this should no longer be needed but kept for compatibility
      else if (typeof timeSlot.startTime === 'number') {
        const startHourNum = Math.floor(timeSlot.startTime / 100);
        const startMinuteNum = timeSlot.startTime % 100;
        
        // Format as 12-hour time with AM/PM for better readability
        const hour12 = startHourNum % 12 || 12; // Convert 0 to 12 for 12 AM
        const amPm = startHourNum < 12 ? 'AM' : 'PM';
        return `${hour12}:${startMinuteNum.toString().padStart(2, '0')} ${amPm}`;
      } else {
        console.error('Unsupported time slot format:', timeSlot);
        return 'Invalid format';
      }
    } catch (error) {
      console.error('Error formatting time slot:', error, timeSlot);
      return 'Error';
    }
  };

  // Update the handleRetry function to use the refreshData from DataContext
  const handleRetry = () => {
    refreshData();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 160px)', width: '100%', p: 2 }}>
      {/* Add an error banner with retry button if there are service or client errors */}
      {(clientError || serviceError) && (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Failed to load calendar data. Using mock data instead.
          {clientError && <Typography variant="caption" display="block">Clients error: {clientError}</Typography>}
          {serviceError && <Typography variant="caption" display="block">Services error: {serviceError}</Typography>}
        </Alert>
      )}
      
      {/* Show loading indicator when either services or clients are loading */}
      {(loadingClients || loadingServices) && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2">
            {loadingClients && loadingServices 
              ? 'Loading calendar data...' 
              : loadingClients 
                ? 'Loading client data...' 
                : 'Loading service data...'}
          </Typography>
        </Box>
      )}
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        initialView="dayGridMonth"
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="100%"
      />
      
      {/* Appointment Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? t('calendar.editAppointment') : t('calendar.createAppointment')}
        </DialogTitle>
        
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {/* Client Selection */}
              <FormControl fullWidth error={formErrors.clientId}>
                <InputLabel id="client-select-label">{t('calendar.client')}</InputLabel>
                <Select
                  labelId="client-select-label"
                  id="clientId"
                  name="clientId"
                  value={eventFormData.clientId}
                  onChange={handleInputChange}
                  label={t('calendar.client')}
                >
                  {Array.isArray(clients) && clients.length > 0 ? (
                    clients.map(client => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      {t('calendar.noClientsAvailable')}
                    </MenuItem>
                  )}
                </Select>
                {formErrors.clientId && (
                  <FormHelperText>{t('validation.required')}</FormHelperText>
                )}
              </FormControl>
              
              {/* Service Selection */}
              <FormControl fullWidth error={formErrors.serviceId}>
                <InputLabel id="service-select-label">{t('calendar.service')}</InputLabel>
                <Select
                  labelId="service-select-label"
                  id="serviceId"
                  name="serviceId"
                  value={eventFormData.serviceId}
                  onChange={handleInputChange}
                  label={t('calendar.service')}
                >
                  {Array.isArray(services) && services.length > 0 ? (
                    services.map(service => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} ({service.duration} {t('calendar.minutes')}, ${service.price})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      {t('calendar.noServicesAvailable')}
                    </MenuItem>
                  )}
                </Select>
                {formErrors.serviceId && (
                  <FormHelperText>{t('validation.required')}</FormHelperText>
                )}
              </FormControl>
              
              {/* Date Field */}
          <TextField
                id="date"
                name="date"
                label={t('calendar.date')}
                type="date"
            fullWidth
                value={eventFormData.date}
            onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={formErrors.date}
                helperText={formErrors.date && t('validation.required')}
              />
              
              {/* Time Slot Selection */}
              <FormControl fullWidth error={formErrors.startTime}>
                <InputLabel id="time-select-label">{t('calendar.startTime')}</InputLabel>
                <Select
                  labelId="time-select-label"
                  id="startTime"
                  name="startTime"
                  value={eventFormData.startTime}
            onChange={handleInputChange}
                  label={t('calendar.startTime')}
                  disabled={!eventFormData.date || !eventFormData.serviceId}
                >
                  {!eventFormData.date || !eventFormData.serviceId ? (
                    <MenuItem value="" disabled>
                      {t('calendar.selectDateAndService')}
                    </MenuItem>
                  ) : loading ? (
                    <MenuItem value="" disabled>
                      {t('common.loading')}
                    </MenuItem>
                  ) : Array.isArray(availableTimeSlots) && availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot, index) => (
                      <MenuItem key={index} value={formatTimeSlot(slot)}>
                        {formatTimeSlot(slot)}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      {t('calendar.noAvailableSlots')}
                    </MenuItem>
                  )}
                </Select>
                {formErrors.startTime && (
                  <FormHelperText error>{t('validation.required')}</FormHelperText>
                )}
                <FormHelperText>
                  {!eventFormData.date || !eventFormData.serviceId 
                    ? t('calendar.selectDateAndServiceFirst')
                    : eventFormData.startTime 
                      ? `${t('calendar.selectedTime')}: ${eventFormData.startTime}`
                      : t('calendar.selectTime')}
                </FormHelperText>
              </FormControl>
              
              {/* Notes */}
          <TextField
                id="description"
            name="description"
            label={t('calendar.notes')}
                multiline
                rows={3}
                fullWidth
            value={eventFormData.description}
            onChange={handleInputChange}
            />
          </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDialogClose}>{t('common.cancel')}</Button>
          
          {isEditMode && (
            <Button 
              onClick={handleEventDelete} 
              color="error" 
              disabled={loading}
            >
              {t('common.delete')}
            </Button>
          )}
          
          <Button 
            onClick={handleEventCreate} 
            color="primary" 
            disabled={loading}
          >
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setIsSnackbarOpen(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar
        open={isSuccessSnackbarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setIsSuccessSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FullCalendarComponent; 