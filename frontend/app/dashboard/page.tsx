'use client';

import { useState, useCallback, useEffect } from 'react';
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
  LinearProgress,
  AlertTitle
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
import { useAuth } from '../context/AuthContext';
import { getUserBookings, Booking } from '../api/bookingApi';
import { getDashboardStats, DashboardStats as ApiDashboardStats } from '../api/dashboardApi';
import { getAppointments, Appointment as ApiAppointment } from '../api/appointmentApi';

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
  const { isAuthenticated, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  
  // Use the custom hook for data fetching and loading state management
  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    try {
      console.log('Fetching real dashboard data...');
      
      // Use our new API functions to get real data
      const statsPromise = getDashboardStats();
      const appointmentsPromise = getAppointments(
        new Date().toISOString().split('T')[0], // Today
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        'SCHEDULED'
      );
      
      // Set a timeout for API requests to prevent long waits
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('Dashboard API request timed out after 5 seconds');
          resolve(null);
        }, 5000);
      });
      
      // Race the API requests against the timeout
      const [statsResult, appointmentsResult] = await Promise.all([
        Promise.race([statsPromise, timeoutPromise]),
        Promise.race([appointmentsPromise, timeoutPromise])
      ]);
      
      // If we got stats data, use it, otherwise use mock
      const dashboardStats: DashboardStats = statsResult && statsResult.data ? {
        totalAppointments: statsResult.data.totalAppointments,
        totalClients: statsResult.data.totalClients,
        totalServices: statsResult.data.totalServices,
        totalRevenue: statsResult.data.totalRevenue,
        revenueChange: statsResult.data.revenueChange,
        clientsChange: statsResult.data.clientsChange,
        appointmentsChange: statsResult.data.appointmentsChange,
        servicesChange: statsResult.data.servicesChange,
      } : mockData.stats;
      
      // If we got appointments data, format it for the dashboard
      const appointments = appointmentsResult && appointmentsResult.data ? 
        appointmentsResult.data.slice(0, 5).map((apt: ApiAppointment) => ({
          id: apt.id,
          clientName: apt.client.name,
          serviceName: apt.service.name,
          date: new Date(apt.date + 'T' + Math.floor(apt.startTime / 100) + ':' + 
            (apt.startTime % 100).toString().padStart(2, '0')),
          status: apt.status
        })) : 
        mockData.appointments;
      
      console.log('Fetched dashboard data:', { stats: dashboardStats, appointments });
      
      return {
        stats: dashboardStats,
        appointments: appointments
      };
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      // Always return mock data on error to ensure the dashboard shows something
      return mockData;
    }
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
  
  // Fetch real bookings data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const response = await getUserBookings(1, 5);
        if (response.status === 'success' && response.data?.bookings) {
          setBookings(response.data.bookings);
        } else {
          setBookingsError('Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookingsError('An error occurred while fetching bookings');
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, router]);

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

  // Update the renderContent function to use real bookings data
  const renderContent = () => (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        {/* Show warning banner if using mock data due to API errors */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Using Demo Data</AlertTitle>
            We're currently showing demo data because the API is unavailable. 
            Some features may be limited. <Button size="small" onClick={refreshData}>Retry</Button>
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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

        {/* Main Content Cards */}
        <Grid container spacing={3}>
          {/* Upcoming Appointments Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Upcoming Appointments" 
                action={
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/bookings/new')}
                  >
                    Book New
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {bookingsLoading ? (
                  <Box sx={{ p: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                      Loading your appointments...
                    </Typography>
                  </Box>
                ) : bookingsError ? (
                  <Alert severity="error" sx={{ m: 2 }}>
                    {bookingsError}
                  </Alert>
                ) : bookings.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No upcoming appointments
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/bookings/new')}
                    >
                      Book an Appointment
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {bookings.map((booking) => (
                      <ListItem 
                        key={booking.id}
                        secondaryAction={
                          <Chip 
                            label={booking.status} 
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        }
                        divider
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Booking #${booking.id.substring(0, 8)}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => router.push('/bookings')}
                      >
                        View All Appointments
                      </Button>
                    </Box>
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity Card */}
          <Grid item xs={12} md={6}>
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
      </Container>
    </Box>
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