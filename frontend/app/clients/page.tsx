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
  Star as StarIcon
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/apiClient';

interface Appointment {
  id: string;
  date: string;
  startTime: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  serviceName: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  appointmentCount: number;
  totalSpent: number;
  lastAppointment?: string;
  isVip: boolean;
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
    .max(20, 'Phone number is too long')
    .required('Phone number is required'),
  notes: Yup.string()
    .max(500, 'Notes must be less than 500 characters')
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

  // Mock clients data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '555-1234',
      notes: 'Prefers appointments in the morning.',
      appointmentCount: 12,
      totalSpent: 575.50,
      lastAppointment: '2024-05-28',
      isVip: true,
      appointments: [
        { id: 'a1', date: '2024-05-28', startTime: 9, status: 'COMPLETED', serviceName: 'Haircut', price: 35 },
        { id: 'a2', date: '2024-04-30', startTime: 10, status: 'COMPLETED', serviceName: 'Manicure', price: 25 },
        { id: 'a3', date: '2024-06-15', startTime: 14, status: 'SCHEDULED', serviceName: 'Facial', price: 50 }
      ]
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      phone: '555-5678',
      appointmentCount: 5,
      totalSpent: 210.00,
      lastAppointment: '2024-05-15',
      isVip: false,
      appointments: [
        { id: 'b1', date: '2024-05-15', startTime: 13, status: 'COMPLETED', serviceName: 'Haircut', price: 35 },
        { id: 'b2', date: '2024-06-20', startTime: 15, status: 'SCHEDULED', serviceName: 'Facial', price: 50 }
      ]
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      phone: '555-9012',
      notes: 'Allergic to certain hair products.',
      appointmentCount: 8,
      totalSpent: 320.00,
      lastAppointment: '2024-05-20',
      isVip: false,
      appointments: [
        { id: 'c1', date: '2024-05-20', startTime: 11, status: 'COMPLETED', serviceName: 'Haircut', price: 35 },
        { id: 'c2', date: '2024-03-15', startTime: 14, status: 'COMPLETED', serviceName: 'Massage', price: 80 }
      ]
    },
    {
      id: '4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      phone: '555-3456',
      appointmentCount: 15,
      totalSpent: 875.50,
      lastAppointment: '2024-05-25',
      isVip: true,
      appointments: [
        { id: 'd1', date: '2024-05-25', startTime: 10, status: 'COMPLETED', serviceName: 'Massage', price: 80 },
        { id: 'd2', date: '2024-04-10', startTime: 9, status: 'COMPLETED', serviceName: 'Facial', price: 50 },
        { id: 'd3', date: '2024-06-05', startTime: 15, status: 'SCHEDULED', serviceName: 'Manicure', price: 25 }
      ]
    },
    {
      id: '5',
      name: 'Edward Nygma',
      email: 'edward@example.com',
      phone: '555-7890',
      notes: 'Prefers late afternoon appointments.',
      appointmentCount: 3,
      totalSpent: 120.00,
      lastAppointment: '2024-05-10',
      isVip: false,
      appointments: [
        { id: 'e1', date: '2024-05-10', startTime: 16, status: 'COMPLETED', serviceName: 'Haircut', price: 35 }
      ]
    }
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, fetch from API
        // const response = await api.get('/clients');
        
        // Simulate API delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setClients(mockClients);
        setFilteredClients(mockClients);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load clients');
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
        client.phone.includes(searchQuery)
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
    if (!selectedClient) return;
    
    try {
      // In a real app, delete via API
      // await api.delete(`/clients/${selectedClient.id}`);
      
      // Update local state
      setClients(prevClients => prevClients.filter(client => client.id !== selectedClient.id));
      setDeleteConfirmOpen(false);
      setSelectedClient(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      if (dialogType === 'create') {
        // In a real app, create via API
        // const response = await api.post('/clients', values);
        
        // Create a new client with mock data
        const newClient: Client = {
          id: `new-${Date.now()}`,
          name: values.name,
          email: values.email,
          phone: values.phone,
          notes: values.notes,
          appointmentCount: 0,
          totalSpent: 0,
          isVip: false
        };
        
        setClients(prevClients => [...prevClients, newClient]);
      } else if (dialogType === 'edit' && selectedClient) {
        // In a real app, update via API
        // const response = await api.put(`/clients/${selectedClient.id}`, values);
        
        // Update local state
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === selectedClient.id 
              ? { ...client, ...values }
              : client
          )
        );
      }
      
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
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
      notes: ''
    };
    
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={ClientSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
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
              <Field
                as={TextField}
                name="notes"
                label="Notes"
                multiline
                rows={4}
                fullWidth
                error={touched.notes && Boolean(errors.notes)}
                helperText={touched.notes && errors.notes}
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
            {filteredClients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <React.Fragment key={client.id}>
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
                          {client.name}
                        </Typography>
                        {client.isVip && (
                          <Tooltip title="VIP Client">
                            <StarIcon
                              fontSize="small"
                              color="warning"
                              sx={{ ml: 1 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {client.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {client.phone}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(client.lastAppointment)}</TableCell>
                    <TableCell align="center">{client.appointmentCount}</TableCell>
                    <TableCell align="right">${client.totalSpent.toFixed(2)}</TableCell>
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
                                <Typography variant="body2">{client.notes}</Typography>
                              </Paper>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No clients found matching your search.
                  </Typography>
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
                        ${client.totalSpent.toFixed(2)}
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
                          {client.notes}
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