'use client';

import { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Spa as ServicesIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/apiClient';

// Mock data for offline development
const mockStats = {
  totalAppointments: 156,
  totalClients: 78,
  totalServices: 12,
  totalRevenue: 8750.50
};

const mockAppointments = [
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
];

export default function Dashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState(mockStats);
  const [appointments, setAppointments] = useState(mockAppointments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would fetch data from the API
        // const statsResponse = await api.get('/dashboard/stats');
        // const appointmentsResponse = await api.get('/appointments?upcoming=true&limit=5');
        
        // For now, simulate API delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // setStats(statsResponse.data);
        // setAppointments(appointmentsResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of your business.
        </Typography>
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
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography component="h2" variant="h6">
                    Appointments
                  </Typography>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <CalendarIcon />
                  </Avatar>
                </Box>
                <Typography component="p" variant="h3" sx={{ my: 2 }}>
                  {stats.totalAppointments}
                </Typography>
                <Typography variant="body2">
                  Total appointments booked
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography component="h2" variant="h6">
                    Clients
                  </Typography>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
                <Typography component="p" variant="h3" sx={{ my: 2 }}>
                  {stats.totalClients}
                </Typography>
                <Typography variant="body2">
                  Total registered clients
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  bgcolor: theme.palette.info.light,
                  color: theme.palette.info.contrastText,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography component="h2" variant="h6">
                    Services
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <ServicesIcon />
                  </Avatar>
                </Box>
                <Typography component="p" variant="h3" sx={{ my: 2 }}>
                  {stats.totalServices}
                </Typography>
                <Typography variant="body2">
                  Available services
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  borderRadius: 2,
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography component="h2" variant="h6">
                    Revenue
                  </Typography>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <MoneyIcon />
                  </Avatar>
                </Box>
                <Typography component="p" variant="h3" sx={{ my: 2 }}>
                  ${stats.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Total revenue
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardHeader 
                  title="Upcoming Appointments" 
                  action={
                    <Button color="primary" href="/calendar">
                      View Calendar
                    </Button>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  <List sx={{ width: '100%' }}>
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
                              <EventIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${appointment.clientName} - ${appointment.serviceName}`}
                            secondary={format(appointment.date, 'EEEE, MMMM d, yyyy • h:mm a')}
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
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={0}>
                <CardHeader 
                  title="Recent Activity" 
                  action={
                    <Button color="primary" href="/activity">
                      View All
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Activity feed will be implemented in the next phase
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </MainLayout>
  );
} 