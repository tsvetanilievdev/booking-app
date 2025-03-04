'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/apiClient';

// Mock data for services
const mockServices = [
  {
    id: '1',
    name: 'Haircut',
    description: 'Professional haircut service',
    duration: 30,
    price: 35.00,
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    availableTimeStart: 9,
    availableTimeEnd: 17,
    bookingCount: 45,
    revenue: 1575.00
  },
  {
    id: '2',
    name: 'Manicure',
    description: 'Professional nail care for hands',
    duration: 45,
    price: 25.00,
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5, 6],
    availableTimeStart: 10,
    availableTimeEnd: 18,
    bookingCount: 32,
    revenue: 800.00
  },
  {
    id: '3',
    name: 'Facial',
    description: 'Rejuvenating facial treatment',
    duration: 60,
    price: 50.00,
    isAvailable: true,
    availableDays: [1, 3, 5],
    availableTimeStart: 9,
    availableTimeEnd: 16,
    bookingCount: 18,
    revenue: 900.00
  },
  {
    id: '4',
    name: 'Massage',
    description: 'Relaxing full body massage',
    duration: 90,
    price: 80.00,
    isAvailable: false,
    availableDays: [2, 4, 6],
    availableTimeStart: 10,
    availableTimeEnd: 17,
    bookingCount: 24,
    revenue: 1920.00
  }
];

// Validation schema for service form
const ServiceSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Name is required'),
  description: Yup.string()
    .min(5, 'Too Short!')
    .max(200, 'Too Long!')
    .required('Description is required'),
  duration: Yup.number()
    .min(5, 'Minimum duration is 5 minutes')
    .max(240, 'Maximum duration is 4 hours')
    .required('Duration is required'),
  price: Yup.number()
    .min(0, 'Price cannot be negative')
    .required('Price is required'),
  isAvailable: Yup.boolean(),
  availableDays: Yup.array()
    .of(Yup.number())
    .min(1, 'Select at least one day')
    .required('Available days are required'),
  availableTimeStart: Yup.number()
    .min(0, 'Invalid time')
    .max(23, 'Invalid time')
    .required('Start time is required'),
  availableTimeEnd: Yup.number()
    .min(0, 'Invalid time')
    .max(24, 'Invalid time')
    .required('End time is required')
    .test(
      'is-greater',
      'End time must be after start time',
      function(value) {
        const { availableTimeStart } = this.parent;
        return value > availableTimeStart;
      }
    )
});

// Days of the week
const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

// Time options for select
const timeOptions = Array.from({ length: 25 }, (_, i) => {
  const hour = i;
  const amPm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: hour,
    label: `${displayHour}:00 ${amPm}`
  };
});

export default function Services() {
  const [services, setServices] = useState(mockServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would fetch data from the API
        // const response = await api.get('/services');
        
        // For now, simulate API delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // setServices(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleOpenDialog = (service: any = null) => {
    setCurrentService(service);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentService(null);
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      // In a real app, we would call the API
      if (currentService) {
        // Update existing service
        // await api.put(`/services/${currentService.id}`, values);
        
        // Update local state
        setServices(services.map(service => 
          service.id === currentService.id ? { ...service, ...values } : service
        ));
      } else {
        // Create new service
        // const response = await api.post('/services', values);
        
        // Add to local state with mock ID
        const newService = {
          ...values,
          id: `${services.length + 1}`,
          bookingCount: 0,
          revenue: 0
        };
        setServices([...services, newService]);
      }
      
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      // In a real app, we would call the API
      // await api.put(`/services/${id}/availability`, { isAvailable: !isAvailable });
      
      // Update local state
      setServices(services.map(service => 
        service.id === id ? { ...service, isAvailable: !isAvailable } : service
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update service availability');
    }
  };

  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    try {
      // In a real app, we would call the API
      // await api.delete(`/services/${serviceToDelete}`);
      
      // Update local state
      setServices(services.filter(service => service.id !== serviceToDelete));
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete service');
    }
  };

  const formatTime = (hour: number) => {
    const amPm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${amPm}`;
  };

  const formatDays = (days: number[]) => {
    return days.map(day => daysOfWeek.find(d => d.value === day)?.label.substring(0, 3)).join(', ');
  };

  return (
    <MainLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Service
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: service.isAvailable ? 1 : 0.7
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {service.name}
                    </Typography>
                    <Chip 
                      label={service.isAvailable ? 'Available' : 'Unavailable'} 
                      color={service.isAvailable ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {service.duration} minutes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      ${service.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Available: {formatDays(service.availableDays)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hours: {formatTime(service.availableTimeStart)} - {formatTime(service.availableTimeEnd)}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Bookings: {service.bookingCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revenue: ${service.revenue.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(service)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(service.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={service.isAvailable}
                        onChange={() => handleToggleAvailability(service.id, service.isAvailable)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">Available</Typography>}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Service Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <Formik
          initialValues={
            currentService || {
              name: '',
              description: '',
              duration: 30,
              price: 0,
              isAvailable: true,
              availableDays: [1, 2, 3, 4, 5],
              availableTimeStart: 9,
              availableTimeEnd: 17
            }
          }
          validationSchema={ServiceSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="name"
                      label="Service Name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="duration"
                      label="Duration (minutes)"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min</InputAdornment>,
                      }}
                      error={touched.duration && Boolean(errors.duration)}
                      helperText={touched.duration && errors.duration}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="price"
                      label="Price"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      error={touched.price && Boolean(errors.price)}
                      helperText={touched.price && errors.price}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl 
                      fullWidth 
                      error={touched.availableDays && Boolean(errors.availableDays)}
                    >
                      <InputLabel id="available-days-label">Available Days</InputLabel>
                      <Select
                        labelId="available-days-label"
                        multiple
                        value={values.availableDays}
                        onChange={(e) => setFieldValue('availableDays', e.target.value)}
                        label="Available Days"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as number[]).map((value) => (
                              <Chip 
                                key={value} 
                                label={daysOfWeek.find(day => day.value === value)?.label} 
                                size="small" 
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.availableDays && errors.availableDays && (
                        <FormHelperText>{errors.availableDays as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      error={touched.availableTimeStart && Boolean(errors.availableTimeStart)}
                    >
                      <InputLabel id="start-time-label">Start Time</InputLabel>
                      <Select
                        labelId="start-time-label"
                        value={values.availableTimeStart}
                        onChange={(e) => setFieldValue('availableTimeStart', e.target.value)}
                        label="Start Time"
                      >
                        {timeOptions.slice(0, -1).map((time) => (
                          <MenuItem key={time.value} value={time.value}>
                            {time.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.availableTimeStart && errors.availableTimeStart && (
                        <FormHelperText>{errors.availableTimeStart as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      error={touched.availableTimeEnd && Boolean(errors.availableTimeEnd)}
                    >
                      <InputLabel id="end-time-label">End Time</InputLabel>
                      <Select
                        labelId="end-time-label"
                        value={values.availableTimeEnd}
                        onChange={(e) => setFieldValue('availableTimeEnd', e.target.value)}
                        label="End Time"
                      >
                        {timeOptions.slice(1).map((time) => (
                          <MenuItem key={time.value} value={time.value}>
                            {time.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.availableTimeEnd && errors.availableTimeEnd && (
                        <FormHelperText>{errors.availableTimeEnd as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.isAvailable}
                          onChange={(e) => setFieldValue('isAvailable', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Service is available for booking"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
} 