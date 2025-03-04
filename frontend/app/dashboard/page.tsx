'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Container,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Spa as ServicesIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import MainLayout from '../components/layout/MainLayout';
import LoadingState from '../components/common/LoadingState';
import useData from '../hooks/useData';
import { useRouter } from 'next/navigation';

// Interface definitions
interface DashboardStats {
  totalAppointments: number;
  totalClients: number;
  totalServices: number;
  totalRevenue: number;
  revenueChange: number;
  clientsChange: number;
  appointmentsChange: number;
  servicesChange: number;
}

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  date: Date;
  status: string;
}

interface DashboardData {
  stats: DashboardStats;
  appointments: Appointment[];
}

// Mock data for offline development
const mockData: DashboardData = {
  stats: {
    totalAppointments: 156,
    totalClients: 78,
    totalServices: 12,
    totalRevenue: 8750.50,
    revenueChange: 12.5,
    clientsChange: 5.2,
    appointmentsChange: 8.3,
    servicesChange: 0
  },
  appointments: [
    {
      id: '1',
      clientName: 'John Doe',
      serviceName: 'Haircut',
      date: new Date(2025, 2, 4, 10, 0),
      status: 'SCHEDULED'
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      serviceName: 'Manicure',
      date: new Date(2025, 2, 4, 13, 30),
      status: 'SCHEDULED'
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      serviceName: 'Massage',
      date: new Date(2025, 2, 5, 15, 0),
      status: 'SCHEDULED'
    },
    {
      id: '4',
      clientName: 'Sarah Williams',
      serviceName: 'Facial',
      date: new Date(2025, 2, 6, 11, 0),
      status: 'SCHEDULED'
    }
  ]
};

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  
  // Use the custom hook for data fetching and loading state management
  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    // In a real app, we would fetch data from the API
    // const statsResponse = await api.get('/dashboard/stats');
    // const appointmentsResponse = await api.get('/appointments?upcoming=true&limit=5');
    
    // For now, simulate API delay and use mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockData;
  }, []);
  
  const { 
    data, 
    loading, 
    error,
    fetchData: refreshData
  } = useData<DashboardData>(fetchDashboardData, {
    initialData: mockData, // Use mock data as initial state to prevent undefined
    fetchOnMount: true
  });
  
  // Extract the data for easier access
  const stats = data?.stats || mockData.stats;
  const appointments = data?.appointments || mockData.appointments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUpIcon color="success" fontSize="small" />;
    } else if (change < 0) {
      return <TrendingDownIcon color="error" fontSize="small" />;
    } else {
      return null;
    }
  };

  // Content to render when data is ready
  const renderContent = () => (
    <>
      {/* KPI Summary Cards - Most important metrics */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Business Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Appointments
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {stats.totalAppointments}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                    <CalendarIcon />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTrendIcon(stats.appointmentsChange)}
                  <Typography variant="body2" color={stats.appointmentsChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                    {stats.appointmentsChange > 0 ? '+' : ''}{stats.appointmentsChange}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Clients
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {stats.totalClients}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTrendIcon(stats.clientsChange)}
                  <Typography variant="body2" color={stats.clientsChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                    {stats.clientsChange > 0 ? '+' : ''}{stats.clientsChange}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      ${stats.totalRevenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                    <MoneyIcon />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTrendIcon(stats.revenueChange)}
                  <Typography variant="body2" color={stats.revenueChange > 0 ? 'success.main' : 'error.main'} sx={{ ml: 0.5 }}>
                    {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange}% from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Card elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Services
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {stats.totalServices}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.light }}>
                    <ServicesIcon />
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTrendIcon(stats.servicesChange)}
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    No change
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Detailed Section */}
      <Grid container spacing={3}>
        {/* Left Column - Upcoming Appointments */}
        <Grid item xs={12} md={7} lg={8}>
          <Card elevation={0}>
            <CardHeader 
              title="Upcoming Appointments" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => router.push('/calendar')}
                  >
                    View Calendar
                  </Button>
                  <IconButton size="small">
                    <MoreIcon />
                  </IconButton>
                </Box>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List disablePadding>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      divider
                      secondaryAction={
                        <Chip 
                          label={appointment.status} 
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <TimeIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {appointment.clientName} - {appointment.serviceName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {format(appointment.date, 'EEEE, MMMM d • h:mm a')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No upcoming appointments"
                      secondary="Your schedule is clear for now"
                    />
                  </ListItem>
                )}
              </List>
              {appointments.length > 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button 
                    color="primary" 
                    size="small"
                    onClick={() => router.push('/calendar')}
                  >
                    View All Appointments
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Quick Actions and Notifications */}
        <Grid item xs={12} md={5} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions Card */}
            <Card elevation={0}>
              <CardHeader 
                title="Quick Actions" 
                titleTypographyProps={{ variant: 'h6' }}
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/clients/new')}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                    >
                      Add Client
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth
                      variant="outlined" 
                      startIcon={<ServicesIcon />}
                      onClick={() => router.push('/services/new')}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                    >
                      Add Service
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth
                      variant="outlined" 
                      startIcon={<CalendarIcon />}
                      onClick={() => router.push('/calendar?view=month')}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                    >
                      Monthly View
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth
                      variant="outlined" 
                      startIcon={<SettingsIcon />}
                      onClick={() => router.push('/settings')}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                    >
                      Settings
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card elevation={0}>
              <CardHeader 
                title="Recent Activity" 
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="activity tabs"
                    sx={{ minHeight: '36px' }}
                  >
                    <Tab label="All" sx={{ minHeight: '36px', py: 0 }} />
                    <Tab label="Clients" sx={{ minHeight: '36px', py: 0 }} />
                  </Tabs>
                }
              />
              <Divider />
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Activity feed will be implemented in the next phase
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome section - Using inverted pyramid to put most important content at top */}
        <Box sx={{ mb: 4 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            spacing={2} 
            mb={2}
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's an overview of your business.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/calendar?action=new')}
              disabled={loading}
            >
              New Appointment
            </Button>
          </Stack>
        </Box>

        {/* Refresh button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            size="small"
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Error alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" size="small" onClick={refreshData}>
                Retry
              </Button>
            }
          >
            {error.message || 'Failed to load dashboard data'}
          </Alert>
        )}

        {/* Loading state */}
        {loading ? (
          <LoadingState message="Loading your dashboard data..." height={400} />
        ) : (
          renderContent()
        )}
      </Container>
    </MainLayout>
  );
} 