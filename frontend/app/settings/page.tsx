'use client';

import { useState, useEffect } from 'react';
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
  Snackbar,
  SelectChangeEvent
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { useLanguage } from '../translations/LanguageContext';
import { Language } from '../translations';

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
  const { language, setLanguage, t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
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

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <MainLayout>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('settings.title')}
        </Typography>
        
        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={t('settings.tabs.account')} />
            <Tab label={t('settings.tabs.notifications')} />
            <Tab label={t('settings.tabs.application')} />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              {t('settings.account.title')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.account.name')}
                  defaultValue="John Doe"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={t('settings.account.email')}
                  defaultValue="john.doe@example.com"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={t('settings.account.phone')}
                  defaultValue="+1 (123) 456-7890"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('settings.account.changePassword')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('settings.account.currentPassword')}
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={t('settings.account.newPassword')}
                  type="password"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label={t('settings.account.confirmNewPassword')}
                  type="password"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button variant="contained" color="primary" onClick={handleSaveAccountSettings}>
                  {t('settings.account.saveChanges')}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              {t('settings.notifications.title')}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
              }
              label={t('settings.notifications.emailNotifications')}
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={smsNotifications}
                  onChange={() => setSmsNotifications(!smsNotifications)}
                />
              }
              label={t('settings.notifications.smsNotifications')}
            />
            <Box sx={{ mb: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={appointmentReminders}
                  onChange={() => setAppointmentReminders(!appointmentReminders)}
                />
              }
              label={t('settings.notifications.appointmentReminders')}
            />
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleSaveNotificationSettings}>
                {t('settings.notifications.saveSettings')}
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              {t('settings.application.title')}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
              }
              label={t('settings.application.darkMode')}
            />
            <Box sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="language-select-label">{t('settings.application.language')}</InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                label={t('settings.application.language')}
                onChange={handleLanguageChange}
              >
                <MenuItem value="en">{t('settings.application.languages.english')}</MenuItem>
                <MenuItem value="bg">{t('settings.application.languages.bulgarian')}</MenuItem>
                <MenuItem value="es">{t('settings.application.languages.spanish')}</MenuItem>
                <MenuItem value="fr">{t('settings.application.languages.french')}</MenuItem>
                <MenuItem value="de">{t('settings.application.languages.german')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="time-format-select-label">{t('settings.application.timeFormat')}</InputLabel>
              <Select
                labelId="time-format-select-label"
                value={timeFormat}
                label={t('settings.application.timeFormat')}
                onChange={(e) => setTimeFormat(e.target.value as string)}
              >
                <MenuItem value="12h">{t('settings.application.timeFormats.12h')}</MenuItem>
                <MenuItem value="24h">{t('settings.application.timeFormats.24h')}</MenuItem>
              </Select>
            </FormControl>
            
            <Button variant="contained" color="primary" onClick={handleSaveAppSettings}>
              {t('settings.application.saveSettings')}
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
          {t('general.success')}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
} 