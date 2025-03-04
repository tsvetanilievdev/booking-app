'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useLanguage } from '../translations/LanguageContext';

// Mock user data - in a real app, this would come from an API
const MOCK_USERS = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'USER', status: 'ACTIVE' },
  { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'USER', status: 'INACTIVE' },
];

// Mock service data
const MOCK_SERVICES = [
  { id: 1, name: 'Haircut', price: 25, duration: 30, category: 'Hair', availability: true },
  { id: 2, name: 'Massage', price: 50, duration: 60, category: 'Wellness', availability: true },
  { id: 3, name: 'Manicure', price: 20, duration: 45, category: 'Nails', availability: true },
];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  category: string;
  availability: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    status: 'ACTIVE'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserDialogOpen = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setSelectedUser(null);
      setUserFormData({
        name: '',
        email: '',
        role: 'USER',
        status: 'ACTIVE'
      });
    }
    setIsUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setIsUserDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setUserFormData({
        ...userFormData,
        [name]: value
      });
    }
  };

  const handleUserSave = () => {
    if (selectedUser) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...userFormData } : user
      );
      setUsers(updatedUsers);
      setSnackbar({
        open: true,
        message: t('admin.userSaved'),
        severity: 'success'
      });
    } else {
      // Create new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userFormData
      };
      setUsers([...users, newUser]);
      setSnackbar({
        open: true,
        message: t('admin.userSaved'),
        severity: 'success'
      });
    }
    setIsUserDialogOpen(false);
  };

  const handleConfirmDeleteOpen = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteClose = () => {
    setIsConfirmDeleteOpen(false);
  };

  const handleUserDelete = () => {
    if (selectedUser) {
      const filteredUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(filteredUsers);
      setSnackbar({
        open: true,
        message: t('admin.userDeleted'),
        severity: 'success'
      });
    }
    setIsConfirmDeleteOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('admin.title')}
      </Typography>
      
      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label={t('admin.userManagement')} id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label={t('admin.serviceManagement')} id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            <Tab label={t('admin.systemSettings')} id="admin-tab-2" aria-controls="admin-tabpanel-2" />
            <Tab label={t('admin.reports')} id="admin-tab-3" aria-controls="admin-tabpanel-3" />
          </Tabs>
        </Box>
        
        {/* User Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleUserDialogOpen()}
            >
              {t('admin.addUser')}
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>{t('profile.name')}</TableCell>
                  <TableCell>{t('profile.email')}</TableCell>
                  <TableCell>{t('admin.userRole')}</TableCell>
                  <TableCell>{t('admin.userStatus')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'ADMIN' ? 'primary' : 'default'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={
                          user.status === 'ACTIVE' ? 'success' : 
                          user.status === 'INACTIVE' ? 'warning' : 
                          'error'
                        } 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleUserDialogOpen(user)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleConfirmDeleteOpen(user)} size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Service Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
            >
              {t('services.addService')}
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>{t('services.serviceName')}</TableCell>
                  <TableCell>{t('services.price')}</TableCell>
                  <TableCell>{t('services.duration')}</TableCell>
                  <TableCell>{t('services.category')}</TableCell>
                  <TableCell>{t('services.availability')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.id}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>${service.price}</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>
                      <Chip 
                        label={service.availability ? t('services.available') : t('services.unavailable')} 
                        color={service.availability ? 'success' : 'error'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="body1">
            {t('admin.systemSettings')} - {t('general.noResults')}
          </Typography>
        </TabPanel>
        
        {/* Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="body1">
            {t('admin.reports')} - {t('general.noResults')}
          </Typography>
        </TabPanel>
      </Paper>
      
      {/* User Add/Edit Dialog */}
      <Dialog open={isUserDialogOpen} onClose={handleUserDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {selectedUser ? t('admin.editUser') : t('admin.addUser')}
        </DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label={t('profile.name')}
            value={userFormData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="email"
            label={t('profile.email')}
            value={userFormData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
            type="email"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">{t('admin.userRole')}</InputLabel>
            <Select
              labelId="role-select-label"
              name="role"
              value={userFormData.role}
              label={t('admin.userRole')}
              onChange={handleInputChange}
            >
              <MenuItem value="ADMIN">ADMIN</MenuItem>
              <MenuItem value="USER">USER</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-select-label">{t('admin.userStatus')}</InputLabel>
            <Select
              labelId="status-select-label"
              name="status"
              value={userFormData.status}
              label={t('admin.userStatus')}
              onChange={handleInputChange}
            >
              <MenuItem value="ACTIVE">{t('admin.active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('admin.inactive')}</MenuItem>
              <MenuItem value="SUSPENDED">{t('admin.suspended')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserDialogClose}>{t('common.cancel')}</Button>
          <Button onClick={handleUserSave} variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onClose={handleConfirmDeleteClose}>
        <DialogTitle>{t('common.confirmation')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.confirmUserDelete')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDeleteClose}>{t('common.cancel')}</Button>
          <Button onClick={handleUserDelete} variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 