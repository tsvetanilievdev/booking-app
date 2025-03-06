'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Verified as VerifiedIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateUserProfile } from '../api/userApi';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

// Mock data for the profile
const mockUserData = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Admin',
  phone: '+1 (123) 456-7890',
  joinDate: '2023-01-15',
  avatar: '',
  verified: true
};

const mockAppointmentHistory = [
  { 
    id: '1', 
    date: '2024-02-28', 
    time: '10:00 AM', 
    client: 'Alice Johnson', 
    service: 'Haircut', 
    status: 'completed' 
  },
  { 
    id: '2', 
    date: '2024-02-20', 
    time: '2:30 PM', 
    client: 'Bob Smith', 
    service: 'Massage', 
    status: 'completed' 
  },
  { 
    id: '3', 
    date: '2024-02-15', 
    time: '11:00 AM', 
    client: 'Carol Williams', 
    service: 'Manicure', 
    status: 'cancelled' 
  },
];

const mockActivityLog = [
  { 
    id: '1', 
    action: 'Logged in', 
    timestamp: '2024-03-04T09:30:00', 
    details: 'Successful login from Chrome on Windows' 
  },
  { 
    id: '2', 
    action: 'Updated service', 
    timestamp: '2024-03-03T14:45:00', 
    details: 'Modified "Haircut" service price from $25 to $30' 
  },
  { 
    id: '3', 
    action: 'Added client', 
    timestamp: '2024-03-02T11:20:00', 
    details: 'Added new client "Dave Miller"' 
  },
  { 
    id: '4', 
    action: 'Cancelled appointment', 
    timestamp: '2024-03-01T16:10:00', 
    details: 'Cancelled appointment #3 with Carol Williams' 
  },
];

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(mockUserData);
  const [appointmentHistory, setAppointmentHistory] = useState(mockAppointmentHistory);
  const [activityLog, setActivityLog] = useState(mockActivityLog);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Authentication check is now handled by the ProtectedRoute component in layout.tsx
    // We can focus just on fetching the user data
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getCurrentUser();
        console.log('User data response:', response); // Debug log
        
        if (response.status === 'success' && response.data?.user) {
          // Merge the real user data with the mock data for fields not provided by the API
          setUserData({
            ...mockUserData,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          });
        } else {
          setError('Failed to load user data: ' + (response.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('An error occurred while fetching user data: ' + 
          (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh' 
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main' 
                  }}
                >
                  {userData.avatar ? (
                    <img src={userData.avatar} alt={userData.name} />
                  ) : (
                    <PersonIcon sx={{ fontSize: 60 }} />
                  )}
                </Avatar>
                
                <Typography variant="h5" gutterBottom>
                  {userData.name}
                  {userData.verified && (
                    <VerifiedIcon 
                      color="primary" 
                      sx={{ ml: 1, verticalAlign: 'middle' }} 
                    />
                  )}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {userData.email}
                </Typography>
                
                <Chip 
                  label={userData.role} 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 1, mb: 2 }} 
                />
                
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  sx={{ mt: 2 }}
                  href="/settings"
                >
                  Edit Profile
                </Button>
              </Paper>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {userData.email}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {userData.phone}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {formatDate(userData.joinDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ width: '100%' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab 
                    icon={<EventIcon />} 
                    iconPosition="start" 
                    label="Appointment History" 
                  />
                  <Tab 
                    icon={<HistoryIcon />} 
                    iconPosition="start" 
                    label="Activity Log" 
                  />
                </Tabs>
                
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="h6" gutterBottom>
                    Recent Appointments
                  </Typography>
                  
                  <List>
                    {appointmentHistory.map((appointment) => (
                      <Paper 
                        key={appointment.id}
                        sx={{ 
                          mb: 2, 
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="body1">
                                {appointment.date}
                              </Typography>
                              <TimeIcon sx={{ ml: 2, mr: 1, color: 'primary.main' }} />
                              <Typography variant="body1">
                                {appointment.time}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Client:</strong> {appointment.client}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Service:</strong> {appointment.service}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                            <Chip
                              label={appointment.status.toUpperCase()}
                              color={appointment.status === 'completed' ? 'success' : 'error'}
                              size="small"
                            />
                            <Box sx={{ mt: 2 }}>
                              <Button 
                                variant="outlined" 
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </List>
                  
                  {appointmentHistory.length === 0 && (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                      No appointment history found.
                    </Typography>
                  )}
                  
                  {appointmentHistory.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button variant="outlined">
                        View All Appointments
                      </Button>
                    </Box>
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Activity History
                  </Typography>
                  
                  <List>
                    {activityLog.map((activity) => (
                      <ListItem
                        key={activity.id}
                        sx={{ 
                          mb: 2, 
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <HistoryIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.action}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {formatDateTime(activity.timestamp)}
                              </Typography>
                              {" — "}{activity.details}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {activityLog.length === 0 && (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                      No activity history found.
                    </Typography>
                  )}
                  
                  {activityLog.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button variant="outlined">
                        View Full Activity Log
                      </Button>
                    </Box>
                  )}
                </TabPanel>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
} 