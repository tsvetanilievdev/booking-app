'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  ButtonGroup,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  InputAdornment,
  OutlinedInput
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  DownloadOutlined as DownloadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  EventNote as EventNoteIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { startOfMonth, endOfMonth, subMonths, format, parseISO, differenceInDays, addDays, isSameDay } from 'date-fns';
import MainLayout from '../components/layout/MainLayout';
import api from '../api/apiClient';

// Type definitions
interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface ServiceRevenueData {
  serviceName: string;
  revenue: number;
  appointments: number;
}

interface ClientData {
  clientName: string;
  totalSpent: number;
  appointments: number;
}

interface AppointmentsByStatus {
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  count: number;
}

interface AppointmentsByHour {
  hour: number;
  count: number;
}

interface AppointmentsByDay {
  day: number;
  count: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalClients: number;
  newClients: number;
  averageAppointmentValue: number;
  revenueByDate: RevenueData[];
  revenueByService: ServiceRevenueData[];
  topClients: ClientData[];
  appointmentsByStatus: AppointmentsByStatus[];
  appointmentsByHour: AppointmentsByHour[];
  appointmentsByDay: AppointmentsByDay[];
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: endOfMonth(new Date())
  });
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Color constants for charts
  const COLORS = ['#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0', '#0288d1'];
  const STATUS_COLORS = {
    SCHEDULED: '#1976d2',  // Blue
    COMPLETED: '#2e7d32',  // Green
    CANCELLED: '#d32f2f'   // Red
  };

  // Mock data for development
  const mockAnalyticsData: AnalyticsData = {
    totalRevenue: 8725.50,
    totalAppointments: 185,
    completedAppointments: 142,
    cancelledAppointments: 18,
    totalClients: 48,
    newClients: 12,
    averageAppointmentValue: 61.45,
    revenueByDate: Array.from({ length: 60 }).map((_, i) => {
      const date = format(addDays(subMonths(new Date(), 2), i), 'yyyy-MM-dd');
      // Generate some random revenue between $50 and $500
      const revenue = Math.floor(Math.random() * 450) + 50;
      return { date, revenue };
    }),
    revenueByService: [
      { serviceName: 'Haircut', revenue: 2450, appointments: 70 },
      { serviceName: 'Manicure', revenue: 1125, appointments: 45 },
      { serviceName: 'Facial', revenue: 1750, appointments: 35 },
      { serviceName: 'Massage', revenue: 2400, appointments: 30 },
      { serviceName: 'Hair Coloring', revenue: 1000, appointments: 5 }
    ],
    topClients: [
      { clientName: 'Diana Prince', totalSpent: 875.50, appointments: 15 },
      { clientName: 'Alice Johnson', totalSpent: 575.50, appointments: 12 },
      { clientName: 'Charlie Brown', totalSpent: 320.00, appointments: 8 },
      { clientName: 'Bob Smith', totalSpent: 210.00, appointments: 5 },
      { clientName: 'Edward Nygma', totalSpent: 120.00, appointments: 3 }
    ],
    appointmentsByStatus: [
      { status: 'COMPLETED', count: 142 },
      { status: 'SCHEDULED', count: 25 },
      { status: 'CANCELLED', count: 18 }
    ],
    appointmentsByHour: [
      { hour: 9, count: 15 },
      { hour: 10, count: 22 },
      { hour: 11, count: 28 },
      { hour: 12, count: 12 },
      { hour: 13, count: 10 },
      { hour: 14, count: 25 },
      { hour: 15, count: 35 },
      { hour: 16, count: 28 },
      { hour: 17, count: 10 }
    ],
    appointmentsByDay: [
      { day: 0, count: 15 },  // Sunday
      { day: 1, count: 32 },  // Monday
      { day: 2, count: 28 },  // Tuesday
      { day: 3, count: 35 },  // Wednesday
      { day: 4, count: 30 },  // Thursday
      { day: 5, count: 38 },  // Friday
      { day: 6, count: 7 }    // Saturday
    ]
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, fetch from API with date range
        // const params = {
        //   startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
        //   endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        // };
        // const response = await api.get('/analytics', { params });
        // setAnalyticsData(response.data);

        // Simulate API delay and use mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Filter the mock data based on the selected date range
        const filteredRevenueByDate = mockAnalyticsData.revenueByDate.filter(item => {
          const itemDate = parseISO(item.date);
          return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
        });
        
        setAnalyticsData({
          ...mockAnalyticsData,
          revenueByDate: filteredRevenueByDate
        });
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange, refreshTrigger]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleQuickDateRange = (months: number) => {
    setDateRange({
      startDate: startOfMonth(subMonths(new Date(), months)),
      endDate: endOfMonth(subMonths(new Date(), months - 1))
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d');
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hourFormat = hour % 12 || 12;
    return `${hourFormat}${ampm}`;
  };

  const formatDay = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const renderOverviewTab = () => {
    if (!analyticsData) return null;

    return (
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Revenue</Typography>
                <MoneyIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                {formatCurrency(analyticsData.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Avg. {formatCurrency(analyticsData.averageAppointmentValue)} per appointment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Appointments</Typography>
                <EventNoteIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                {analyticsData.totalAppointments}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {analyticsData.completedAppointments} completed, {analyticsData.cancelledAppointments} cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Clients</Typography>
                <GroupIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                {analyticsData.totalClients}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {analyticsData.newClients} new in this period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary">Completion Rate</Typography>
                <TimeIcon color="primary" />
              </Box>
              <Typography variant="h4" component="div">
                {Math.round((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {analyticsData.cancelledAppointments} cancellations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart
                  data={analyticsData.revenueByDate}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`Revenue: ${formatCurrency(value)}`, 'Revenue']}
                    labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1976d2" 
                    fill="rgba(25, 118, 210, 0.2)" 
                    activeDot={{ r: 8 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Service Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue by Service</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.revenueByService}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [`${formatCurrency(value)}`, 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1976d2" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Appointment Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Appointments by Status</Typography>
            <Box sx={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [value, 'Appointments']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Popular Times Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Appointments by Hour</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.appointmentsByHour}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={formatHour} />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, 'Appointments']}
                    labelFormatter={(label) => formatHour(label)}
                  />
                  <Bar dataKey="count" fill="#9c27b0" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Popular Days Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Appointments by Day</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.appointmentsByDay}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={formatDay} />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, 'Appointments']}
                    labelFormatter={(label) => formatDay(label)}
                  />
                  <Bar dataKey="count" fill="#ed6c02" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderServicesTab = () => {
    if (!analyticsData) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Service Performance</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Appointments</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg. Revenue</TableCell>
                    <TableCell align="right">% of Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.revenueByService.map((service) => (
                    <TableRow key={service.serviceName}>
                      <TableCell component="th" scope="row">
                        {service.serviceName}
                      </TableCell>
                      <TableCell align="right">{service.appointments}</TableCell>
                      <TableCell align="right">{formatCurrency(service.revenue)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(service.revenue / service.appointments)}
                      </TableCell>
                      <TableCell align="right">
                        {((service.revenue / analyticsData.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Service Appointments</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.revenueByService}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => [value, 'Appointments']} />
                  <Bar dataKey="appointments" fill="#0288d1" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Revenue Distribution</Typography>
            <Box sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analyticsData.revenueByService}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="serviceName"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.revenueByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderClientsTab = () => {
    if (!analyticsData) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Top Clients</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell align="right">Appointments</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell align="right">Avg. Spent per Appointment</TableCell>
                    <TableCell align="right">% of Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topClients.map((client) => (
                    <TableRow key={client.clientName}>
                      <TableCell component="th" scope="row">
                        {client.clientName}
                      </TableCell>
                      <TableCell align="right">{client.appointments}</TableCell>
                      <TableCell align="right">{formatCurrency(client.totalSpent)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(client.totalSpent / client.appointments)}
                      </TableCell>
                      <TableCell align="right">
                        {((client.totalSpent / analyticsData.totalRevenue) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Client Appointments</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.topClients}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="clientName" type="category" width={150} />
                  <RechartsTooltip formatter={(value: number) => [value, 'Appointments']} />
                  <Bar dataKey="appointments" fill="#9c27b0" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Client Spending</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart
                  data={analyticsData.topClients}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="clientName" type="category" width={150} />
                  <RechartsTooltip formatter={(value: number) => [formatCurrency(value), 'Total Spent']} />
                  <Bar dataKey="totalSpent" fill="#1976d2" name="Total Spent" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<BarChartIcon />} label="Overview" />
            <Tab icon={<PieChartIcon />} label="Services" />
            <Tab icon={<GroupIcon />} label="Clients" />
          </Tabs>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => handleQuickDateRange(1)}>Last Month</Button>
              <Button onClick={() => handleQuickDateRange(3)}>Last 3 Months</Button>
              <Button onClick={() => handleQuickDateRange(6)}>Last 6 Months</Button>
            </ButtonGroup>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDateRange(prev => ({ ...prev, startDate: newValue }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { width: 150 }
                    }
                  }}
                />
                <Typography variant="body2">to</Typography>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDateRange(prev => ({ ...prev, endDate: newValue }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { width: 150 }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && renderOverviewTab()}
            {tabValue === 1 && renderServicesTab()}
            {tabValue === 2 && renderClientsTab()}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
} 