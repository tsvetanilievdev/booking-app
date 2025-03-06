'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  TablePagination,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  Stack,
  Collapse,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon, 
  Loyalty as LoyaltyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Notes as NotesIcon,
  MoreVert as MoreVertIcon,
  StarOutline as StarOutlineIcon,
  Star as StarIcon,
  PersonOff as PersonOffIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import MainLayout from '../components/layout/MainLayout';
import { getClients, createClient, updateClient, deleteClient, Client as ApiClient, CreateClientData, UpdateClientData } from '../api/clientApi';

interface Appointment {
  id: string;
  date: string;
  startTime: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  serviceName: string;
  price: number;
}

interface Client extends ApiClient {
  totalSpent?: number;
  lastAppointment?: string;
  isVip?: boolean;
  appointments?: Appointment[];
}

// Validation schema for client form
const ClientSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(100, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-() ]+$/, 'Invalid phone number format')
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long'),
  notes: Yup.array().of(Yup.string())
});

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filterValue, setFilterValue] = useState<'all' | 'vip'>('all');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        // Get clients from API
        const response = await getClients();
        console.log('Client response raw:', response);
        
        if (response.data && response.data.length > 0) {
          // Add additional debugging
          console.log('Client data before processing:', response.data);
          
          // Transform clients to add frontend-specific fields if needed
          const clientsWithExtras = response.data.map(client => {
            console.log('Processing client:', client);
            return {
              ...client,
              // Ensure all required fields are present
              id: client.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              name: client.name || 'Unknown',
              email: client.email || '',
              phone: client.phone || '',
              notes: Array.isArray(client.notes) ? client.notes : (client.notes ? [client.notes] : []),
              // Add frontend-specific fields
              totalSpent: 0, // This would come from the API in a real implementation
              isVip: client.appointmentCount ? client.appointmentCount > 5 : false, // Simple VIP rule
              lastAppointment: undefined // Would come from API
            };
          });
          
          console.log('Processed clients:', clientsWithExtras);
          setClients(clientsWithExtras);
          setFilteredClients(clientsWithExtras);
        } else {
          console.warn('No clients returned from API:', response);
          setClients([]);
          setFilteredClients([]);
          
          // Show a message if there's an error
          if (response.error) {
            setError(`Failed to load clients: ${response.error}`);
          } else if (response.data && response.data.length === 0) {
            // This is not an error, just no clients yet
            console.log('No clients found in the system');
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search query and filter value
    let results = clients;
    
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      results = results.filter(client => 
        client.name.toLowerCase().includes(lowerCaseQuery) || 
        client.email.toLowerCase().includes(lowerCaseQuery) || 
        (client.phone?.includes(searchQuery) || false)
      );
    }
    
    if (filterValue === 'vip') {
      results = results.filter(client => client.isVip);
    }
    
    setFilteredClients(results);
    setPage(0); // Reset to first page on filter change
  }, [searchQuery, clients, filterValue]);

  const handleOpenDialog = (type: 'create' | 'edit', client: Client | null = null) => {
    setDialogType(type);
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      let submitting = true;
      try {
        const result: { success: boolean, error?: string } = await deleteClient(selectedClient.id);
        
        if (result.success) {
          // Remove client from the list
          setClients(prevClients => prevClients.filter(c => c.id !== selectedClient.id));
          setFilteredClients(prevClients => prevClients.filter(c => c.id !== selectedClient.id));
          setDeleteConfirmOpen(false);
          setSelectedClient(null);
          setAlertMessage({ type: 'success', text: 'Client deleted successfully!' });
        } else {
          throw new Error(result.error || 'Failed to delete client');
        }
      } catch (err) {
        console.error('Error deleting client:', err);
        setAlertMessage({ 
          type: 'error', 
          text: err instanceof Error ? err.message : 'Failed to delete client' 
        });
      } finally {
        submitting = false;
      }
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      let result: { 
        data: Client | null; 
        error?: string;
        success?: boolean;
      };
      
      // Ensure notes is an array of strings
      const notesArray = values.notes ? 
        (Array.isArray(values.notes) ? values.notes : [values.notes]) : 
        [];
      
      if (dialogType === 'edit' && selectedClient) {
        // Prepare update data
        const updateData: UpdateClientData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          notes: notesArray // Use the array of notes
        };
        
        // Update client
        result = await updateClient(selectedClient.id, updateData);
        
        if (result.data) {
          // Update the client in the list
          setClients(prevClients => 
            prevClients.map(c => c.id === selectedClient.id ? 
              { 
                ...c, 
                ...result.data as Client,
                // Preserve frontend-specific fields
                totalSpent: c.totalSpent,
                isVip: c.isVip,
                lastAppointment: c.lastAppointment,
                appointments: c.appointments 
              } : c)
          );
          setFilteredClients(prevClients => 
            prevClients.map(c => c.id === selectedClient.id ? 
              { 
                ...c, 
                ...result.data as Client,
                // Preserve frontend-specific fields
                totalSpent: c.totalSpent,
                isVip: c.isVip,
                lastAppointment: c.lastAppointment,
                appointments: c.appointments 
              } : c)
          );
          setAlertMessage({ type: 'success', text: 'Client updated successfully!' });
        } else {
          throw new Error(result.error || 'Failed to update client');
        }
      } else {
        // Prepare create data
        const createData: CreateClientData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          notes: notesArray // Use the array of notes
        };
        
        // Create new client
        result = await createClient(createData);
        
        if (result.data) {
          // Add the new client to the list
          const newClient = {
            ...result.data,
            totalSpent: 0,
            isVip: false,
            appointmentCount: 0
          } as Client;
          
          setClients(prevClients => [...prevClients, newClient]);
          setFilteredClients(prevClients => [...prevClients, newClient]);
          setAlertMessage({ type: 'success', text: 'Client created successfully!' });
        } else {
          throw new Error(result.error || 'Failed to create client');
        }
      }
      
      // Close dialog
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving client:', err);
      
      // Add special handling for the "Notes must be an array of strings" error
      let errorMessage = err instanceof Error ? err.message : 'Failed to save client';
      if (typeof errorMessage === 'string' && errorMessage.includes('Notes must be an array of strings')) {
        errorMessage = 'Notes must be provided as an array of strings.';
      }
      
      setAlertMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVipStatus = async (client: Client) => {
    try {
      // In a real app, update via API
      // await api.put(`/clients/${client.id}/vip`, { isVip: !client.isVip });
      
      // Update local state
      setClients(prevClients => 
        prevClients.map(c => 
          c.id === client.id 
            ? { ...c, isVip: !c.isVip }
            : c
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update VIP status');
    }
  };

  const handleExpandClient = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (date: string, time: number) => {
    const hours = Math.floor(time);
    const minutes = (time - hours) * 60;
    
    const dateObj = new Date(date);
    dateObj.setHours(hours, minutes);
    
    return format(dateObj, 'MMM d, yyyy h:mm a');
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM d, yyyy');
  };

  const renderClientForm = () => {
    const initialValues = selectedClient || {
      name: '',
      email: '',
      phone: '',
      notes: []
    };
    
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={ClientSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Field
                as={TextField}
                name="name"
                label="Name"
                fullWidth
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                name="email"
                label="Email"
                fullWidth
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Field
                as={TextField}
                name="phone"
                label="Phone"
                fullWidth
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                name="notes"
                label="Notes (one per line)"
                multiline
                rows={4}
                fullWidth
                value={Array.isArray(values.notes) ? values.notes.join('\n') : ''}
                onChange={(e) => {
                  // Split by newlines and filter empty lines
                  const notesArray = e.target.value
                    .split('\n')
                    .filter(note => note.trim() !== '');
                  setFieldValue('notes', notesArray);
                }}
                error={touched.notes && Boolean(errors.notes)}
                helperText={touched.notes && errors.notes ? 
                  (errors.notes as string) : 
                  "Enter each note on a separate line"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : dialogType === 'create' ? 'Create' : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    );
  };

  const renderClientTable = () => (
    <>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="30%">Name</TableCell>
              <TableCell width="20%">Contact</TableCell>
              <TableCell width="15%">Last Appointment</TableCell>
              <TableCell width="10%" align="center">Total Visits</TableCell>
              <TableCell width="15%" align="right">Total Spent</TableCell>
              <TableCell width="10%" align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients && filteredClients.length > 0 ? (
              filteredClients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <React.Fragment key={client.id || `client-${Math.random()}`}>
                    <TableRow
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: client.isVip ? 'rgba(255, 215, 0, 0.1)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {client.name || 'Unknown'}
                          </Typography>
                          {client.isVip && (
                            <Tooltip title="VIP Client">
                              <StarIcon
                                fontSize="small"
                                sx={{ color: 'gold', ml: 1 }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" display="block">
                          {client.email || 'No email'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.phone || 'No phone'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(client.lastAppointment)}</TableCell>
                      <TableCell align="center">{client.appointmentCount}</TableCell>
                      <TableCell align="right">${client.totalSpent?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="View Appointments">
                            <IconButton
                              size="small"
                              onClick={() => handleExpandClient(client.id)}
                            >
                              {expandedClientId === client.id ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Client">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog('edit', client)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Client">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(client)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ p: 0, borderBottom: expandedClientId === client.id ? undefined : 'none' }}
                      >
                        <Collapse in={expandedClientId === client.id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom component="div">
                                Appointment History
                              </Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    size="small"
                                    checked={client.isVip}
                                    onChange={() => handleToggleVipStatus(client)}
                                  />
                                }
                                label={<Typography variant="body2">VIP Status</Typography>}
                              />
                            </Box>
                            {client.appointments && client.appointments.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {client.appointments.map((appointment) => (
                                    <TableRow key={appointment.id}>
                                      <TableCell>
                                        {formatDateTime(appointment.date, appointment.startTime)}
                                      </TableCell>
                                      <TableCell>{appointment.serviceName}</TableCell>
                                      <TableCell>${appointment.price.toFixed(2)}</TableCell>
                                      <TableCell align="right">
                                        <Chip
                                          size="small"
                                          label={appointment.status}
                                          color={
                                            appointment.status === 'COMPLETED' ? 'success' :
                                            appointment.status === 'SCHEDULED' ? 'primary' :
                                            'error'
                                          }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No appointment history available.
                              </Typography>
                            )}
                            {client.notes && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Notes
                                </Typography>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ p: 1.5, backgroundColor: 'background.paper' }}
                                >
                                  <Typography variant="body2">{client.notes.join('\n')}</Typography>
                                </Paper>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <PersonOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No Clients Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {error ? 
                        `Error: ${error}` : 
                        (loading ? 
                          'Loading clients...' : 
                          'No clients match your search criteria or there are no clients in the system yet.'
                        )
                      }
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleOpenDialog('create', null)}
                    >
                      Add Your First Client
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredClients.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );

  const renderClientCards = () => (
    <>
      <Grid container spacing={3} sx={{ mb: 2 }}>
        {filteredClients
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: client.isVip ? 'rgba(255, 215, 0, 0.05)' : 'inherit',
                  position: 'relative'
                }}
              >
                {client.isVip && (
                  <StarIcon 
                    color="warning" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      fontSize: 20 
                    }} 
                  />
                )}
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {client.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <MailIcon 
                        fontSize="small" 
                        color="action" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {client.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PhoneIcon 
                        fontSize="small" 
                        color="action" 
                        sx={{ mr: 1 }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        {client.phone}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Visits
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {client.appointmentCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" align="right" display="block">
                        Total Spent
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${client.totalSpent?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Appointment
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(client.lastAppointment)}
                    </Typography>
                  </Box>
                  
                  {client.notes && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                          <NotesIcon fontSize="small" sx={{ mr: 0.5 }} /> Notes
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {client.notes.join('\n')}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box>
                      <Tooltip title="View Appointments">
                        <IconButton 
                          size="small" 
                          onClick={() => handleExpandClient(client.id)}
                        >
                          <CalendarIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Toggle VIP Status">
                        <IconButton 
                          size="small" 
                          color={client.isVip ? "warning" : "default"}
                          onClick={() => handleToggleVipStatus(client)}
                        >
                          {client.isVip ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box>
                      <Tooltip title="Edit Client">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog('edit', client)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Client">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(client)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        {filteredClients.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No clients found matching your search.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      <TablePagination
        component="div"
        count={filteredClients.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[6, 12, 24]}
      />
    </>
  );

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Clients
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Add Client
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tabs 
              value={filterValue} 
              onChange={(_, newValue) => setFilterValue(newValue)}
            >
              <Tab value="all" label="All Clients" />
              <Tab 
                value="vip" 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon fontSize="small" />
                    <span>VIP</span>
                  </Box>
                } 
              />
            </Tabs>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tabs
                value={viewMode}
                onChange={(_, newValue) => setViewMode(newValue)}
              >
                <Tab value="table" label="Table View" />
                <Tab value="cards" label="Card View" />
              </Tabs>
            </Box>
          </Box>
          <TextField
            placeholder="Search clients..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'table' ? (
          renderClientTable()
        ) : (
          renderClientCards()
        )}
      </Box>

      {/* Client Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogType === 'create' ? 'Add New Client' : 'Edit Client'}
        </DialogTitle>
        <DialogContent dividers>
          {renderClientForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedClient?.name}? This action cannot be undone.
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