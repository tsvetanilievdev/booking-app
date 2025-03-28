'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
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
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
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
      toast.error(t('common.error'));
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
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-t-2 border-primary rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('navigation.dashboard')}
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('dashboard.welcomeBack')}, {user?.name}! {t('dashboard.welcomeBack')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>{t('dashboard.businessSnapshot')}</AlertTitle>
            <AlertDescription>
              {dashboardLoading 
                ? t('common.loading')
                : `${t('dashboard.welcomeBack')} ${todayAppointments.length} ${t('dashboard.todaysAppointments')} ${t('dashboard.welcomeBack')} ${upcomingAppointments.length} ${t('dashboard.next7Days')}.`}
            </AlertDescription>
          </Alert>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.todaysAppointments')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{todayAppointments.length}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.scheduledForToday')}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.upcomingAppointments')}</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.next7Days')}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalClients')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalClients}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.registeredClients')}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.revenue')}</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">${totalRevenue}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.totalRevenue')}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('dashboard.todaysSchedule')}</CardTitle>
              <CardDescription>
                {dashboardLoading 
                  ? t('dashboard.loadingSchedule')
                  : `${t('dashboard.welcomeBack')} ${todayAppointments.length} ${t('dashboard.todaysAppointments')}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <motion.div 
                    key={appointment.id} 
                    className="flex justify-between border-b pb-2 last:border-0"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <p className="text-sm font-medium">{appointment.Client?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.Service?.name || 'Unknown Service'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(appointment.startTime), 'HH:mm')}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  </motion.div>
                  <p className="text-sm font-medium">{t('dashboard.noAppointmentsToday')}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.scheduleIsClear')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>{t('dashboard.upcomingAppointments')}</CardTitle>
              <CardDescription>{t('dashboard.next7Days')}</CardDescription>
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
                  <motion.div 
                    key={appointment.id} 
                    className="flex justify-between border-b pb-2 last:border-0"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <p className="text-sm font-medium">{appointment.Client?.name || 'Unknown Client'}</p>
                      <p className="text-xs text-muted-foreground">{appointment.Service?.name || 'Unknown Service'}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{format(new Date(appointment.startTime), 'MMM d, HH:mm')}</p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  </motion.div>
                  <p className="text-sm font-medium">{t('dashboard.noUpcomingAppointments')}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.scheduleIsClearForWeek')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
} 