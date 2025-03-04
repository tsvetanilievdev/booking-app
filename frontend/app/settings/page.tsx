'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

export default function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveAccountSettings = () => {
    // Handle saving account settings
    setSnackbarOpen(true);
  };

  const handleSaveNotificationSettings = () => {
    // Handle saving notification settings
    setSnackbarOpen(true);
  };

  const handleSaveAppSettings = () => {
    // Handle saving app settings
    setSnackbarOpen(true);
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        
        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Account" />
            <Tab label="Notifications" />
            <Tab label="Application" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  defaultValue="John Doe"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue="john.doe@example.com"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  defaultValue="+1 (123) 456-7890"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button variant="contained" color="primary" onClick={handleSaveAccountSettings}>
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              }
              label="Email Notifications"
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={smsNotifications}
                  onChange={() => setSmsNotifications(!smsNotifications)}
                />
              }
              label="SMS Notifications"
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={appointmentReminders}
                  onChange={() => setAppointmentReminders(!appointmentReminders)}
                />
              }
              label="Appointment Reminders"
            />
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleSaveNotificationSettings}>
                Save Notification Settings
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Application Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              }
              label="Dark Mode"
            />
            <Box sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value as string)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="time-format-select-label">Time Format</InputLabel>
              <Select
                labelId="time-format-select-label"
                value={timeFormat}
                label="Time Format"
                onChange={(e) => setTimeFormat(e.target.value as string)}
              >
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
              </Select>
            </FormControl>
            
            <Button variant="contained" color="primary" onClick={handleSaveAppSettings}>
              Save Application Settings
            </Button>
          </TabPanel>
        </Paper>
      </Box>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </MainLayout>
  );
} 