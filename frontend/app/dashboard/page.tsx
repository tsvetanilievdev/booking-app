'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, Users, Coins, TrendingUp, CalendarClock } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

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
          <AlertTitle>Business Analytics Updated</AlertTitle>
          <AlertDescription>
            Your business analytics have been updated. You had 15% more bookings this week!
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">132</div>
              <p className="text-xs text-muted-foreground">+6 new this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,290</div>
              <p className="text-xs text-muted-foreground">+10% from last week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>You have 12 appointments today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: '09:00 - 09:45', client: 'John Smith', service: 'Haircut' },
                { time: '10:15 - 11:00', client: 'Sarah Johnson', service: 'Manicure' },
                { time: '11:30 - 12:15', client: 'David Brown', service: 'Massage' },
                { time: '14:00 - 15:30', client: 'Emma Wilson', service: 'Full Service' }
              ].map((appt, index) => (
                <div key={index} className="flex items-center justify-between space-x-4 rounded-lg border p-3">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appt.client}</p>
                      <p className="text-xs text-muted-foreground">{appt.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{appt.service}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: 'New booking', client: 'Lisa Taylor', time: '10 minutes ago' },
                { action: 'Booking modified', client: 'Michael Davis', time: '25 minutes ago' },
                { action: 'Payment received', client: 'Jennifer White', time: '1 hour ago' },
                { action: 'Booking canceled', client: 'Robert Miller', time: '2 hours ago' },
                { action: 'New client registered', client: 'Amanda Lee', time: '3 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.client}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 