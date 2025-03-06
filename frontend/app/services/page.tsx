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
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService, 
  toggleServiceAvailability, 
  Service,
  CreateServiceData,
  UpdateServiceData,
  ServiceAvailabilityData
} from '../api/serviceApi';

// Define days of the week
const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

// Define hours for the time picker
const hours = Array.from({ length: 24 }, (_, i) => ({
  value: i * 100, // Format as 24-hour (e.g. 900 for 9:00 AM)
  label: i < 12 
    ? `${i === 0 ? 12 : i}:00 AM` 
    : `${i === 12 ? 12 : i - 12}:00 PM`
}));

// Validation schema for service form
const ServiceSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  duration: Yup.number()
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  isAvailable: Yup.boolean(),
  availableDays: Yup.array()
    .of(Yup.number().min(0).max(6))
    .min(1, 'Select at least one day')
    .required('Available days are required'),
  availableTimeStart: Yup.number()
    .required('Start time is required'),
  availableTimeEnd: Yup.number()
    .required('End time is required')
    .test(
      'is-greater-than-start',
      'End time must be after start time',
      function(value) {
        const { availableTimeStart } = this.parent;
        return value > availableTimeStart;
      }
    )
});

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await getServices();
        if (response.data) {
          setServices(response.data);
        } else {
          setServices([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  const handleOpenDialog = (service: Service | null = null) => {
    setEditingService(service);
    setIsEditMode(!!service);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setIsEditMode(false);
  };
  
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      let result: { data: Service | null; error?: string } | undefined;
      
      if (isEditMode && editingService) {
        // Update existing service
        const updateData: UpdateServiceData = {
          name: values.name,
          duration: values.duration,
          price: values.price,
          isAvailable: values.isAvailable,
          availableDays: values.availableDays,
          availableTimeStart: values.availableTimeStart,
          availableTimeEnd: values.availableTimeEnd
        };
        
        result = await updateService(editingService.id, updateData);
        
        if (result && result.data) {
          // Update service in the list
          setServices(prevServices => 
            prevServices.map(service => 
              service.id === editingService.id ? result!.data as Service : service
            )
          );
          setSuccess('Service updated successfully!');
          handleCloseDialog();
        } else {
          throw new Error(result?.error || 'Failed to update service');
        }
      } else {
        // Create new service
        const createData: CreateServiceData = {
          name: values.name,
          duration: values.duration,
          price: values.price,
          isAvailable: values.isAvailable,
          availableDays: values.availableDays,
          availableTimeStart: values.availableTimeStart,
          availableTimeEnd: values.availableTimeEnd
        };
        
        result = await createService(createData);
        
        if (result && result.data) {
          // Add new service to the list
          setServices(prevServices => [...prevServices, result!.data as Service]);
          setSuccess('Service created successfully!');
          handleCloseDialog();
        } else {
          // Check if the error message contains information about description field
          if (result?.error && result.error.includes('description')) {
            setError('The backend does not support the description field. Please contact your administrator.');
          } else {
            throw new Error(result?.error || 'Failed to create service');
          }
        }
      }
    } catch (err) {
      console.error('Error saving service:', err);
      let errorMessage = err instanceof Error ? err.message : 'Failed to save service';
      
      // Check for specific backend error patterns
      if (typeof errorMessage === 'string' && 
          (errorMessage.includes('description') || 
           errorMessage.includes('Unknown argument'))) {
        errorMessage = 'The service schema in the backend does not match the frontend. The description field is not supported.';
      } else if (errorMessage.includes('Notes must be an array of strings')) {
        errorMessage = 'Notes must be provided as an array of strings. Please enter notes in the correct format.';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const result = await toggleServiceAvailability(id, isAvailable);
      
      if (result.data) {
        // Update service availability in the list
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === id ? { ...service, isAvailable } : service
          )
        );
        setSuccess(`Service ${isAvailable ? 'enabled' : 'disabled'} successfully!`);
      } else {
        throw new Error(result.error || 'Failed to toggle service availability');
      }
    } catch (err) {
      console.error('Error toggling service availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle service availability');
    }
  };
  
  const handleDeleteClick = (id: string) => {
    setServiceToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    
    setSubmitting(true);
    try {
      const result = await deleteService(serviceToDelete);
      
      if (result.success) {
        // Remove service from the list
        setServices(prevServices => 
          prevServices.filter(service => service.id !== serviceToDelete)
        );
        setSuccess('Service deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };
  
  const formatTime = (timeValue: number) => {
    const hours = Math.floor(timeValue / 100);
    const minutes = timeValue % 100;
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
                      Revenue: ${service.revenue?.toFixed(2) || '0.00'}
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
                        onChange={(e) => handleToggleAvailability(service.id, e.target.checked)}
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
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <Formik
          initialValues={
            editingService || {
              name: '',
              duration: 30,
              price: 0,
              isAvailable: true,
              availableDays: [1, 2, 3, 4, 5],
              availableTimeStart: 900,
              availableTimeEnd: 1700
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
                        {hours.map((time) => (
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
                        {hours.map((time) => (
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
} 