'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, Users, Coins, TrendingUp, CalendarClock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import appointmentApi, { Appointment } from '@/app/api/appointments';
import clientApi from '@/app/api/clients';
import serviceApi, { Service } from '@/app/api/services';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Dashboard data state
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      // Fetch today's appointments
      const todayResponse = await appointmentApi.getTodayAppointments();
      if (todayResponse?.data?.appointments) {
        setTodayAppointments(todayResponse.data.appointments);
      }
      
      // Fetch upcoming appointments (next 7 days)
      const weekResponse = await appointmentApi.getWeekAppointments();
      if (weekResponse?.data?.appointments) {
        setUpcomingAppointments(weekResponse.data.appointments);
      }
      
      // Fetch clients count
      const clientsResponse = await clientApi.getClients();
      if (clientsResponse) {
        // Handle different response formats
        if (Array.isArray(clientsResponse.data)) {
          setTotalClients(clientsResponse.data.length);
        } else if (clientsResponse.data?.clients && Array.isArray(clientsResponse.data.clients)) {
          setTotalClients(clientsResponse.data.clients.length);
        } else if (clientsResponse.results) {
          setTotalClients(clientsResponse.results);
        }
      }
      
      // Fetch revenue data
      try {
        const servicesResponse = await serviceApi.getServices();
        if (servicesResponse?.data) {
          let services: Service[] = [];
          if (Array.isArray(servicesResponse.data)) {
            services = servicesResponse.data;
          } else if (servicesResponse.data.services && Array.isArray(servicesResponse.data.services)) {
            services = servicesResponse.data.services;
          }
          
          // Calculate total revenue from services
          const revenue = services.reduce((total, service) => total + (service.price || 0), 0);
          setTotalRevenue(revenue);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
      
      setDashboardLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening with your business today.
          </p>
        </div>

        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Business Snapshot</AlertTitle>
          <AlertDescription>
            {dashboardLoading 
              ? "Loading your business data..." 
              : `You have ${todayAppointments.length} appointments today and ${upcomingAppointments.length} in the next week.`}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{todayAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Next 7 days</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalClients}</div>
                  <p className="text-xs text-muted-foreground">Registered clients</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">Total revenue</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {dashboardLoading 
                  ? "Loading schedule..." 
                  : `You have ${todayAppointments.length} appointments today`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between space-x-4 rounded-lg border p-3">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appointment.Client?.name || 'Unknown Client'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{appointment.Service?.name || 'Unknown Service'}</Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No appointments today</p>
                  <p className="text-xs text-muted-foreground">Your schedule is clear for the day</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{appointment.Client?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.Service?.name || 'Unknown Service'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(appointment.startTime), 'MMM d, HH:mm')}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No upcoming appointments</p>
                  <p className="text-xs text-muted-foreground">Your schedule is clear for the week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 