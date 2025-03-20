'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for appointments
const appointmentsData = [
  {
    id: 1,
    clientName: 'John Smith',
    service: 'Haircut',
    date: new Date(2023, 5, 15, 9, 0),
    duration: 45,
    status: 'confirmed',
  },
  {
    id: 2,
    clientName: 'Sarah Johnson',
    service: 'Manicure',
    date: new Date(2023, 5, 15, 10, 15),
    duration: 60,
    status: 'confirmed',
  },
  {
    id: 3,
    clientName: 'David Brown',
    service: 'Massage',
    date: new Date(2023, 5, 15, 11, 30),
    duration: 90,
    status: 'confirmed',
  },
  {
    id: 4,
    clientName: 'Emma Wilson',
    service: 'Full Service',
    date: new Date(2023, 5, 16, 14, 0),
    duration: 120,
    status: 'pending',
  },
  {
    id: 5,
    clientName: 'Michael Davis',
    service: 'Haircut',
    date: new Date(2023, 5, 17, 15, 30),
    duration: 45,
    status: 'confirmed',
  },
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  // Filter appointments based on search query and status filter
  const filteredAppointments = appointmentsData.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter appointments for the selected date
  const appointmentsForSelectedDate = filteredAppointments.filter(appointment => {
    if (!selectedDate) return false;
    return (
      appointment.date.getDate() === selectedDate.getDate() &&
      appointment.date.getMonth() === selectedDate.getMonth() &&
      appointment.date.getFullYear() === selectedDate.getFullYear()
    );
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your schedule and client bookings
            </p>
          </div>
          <Button className="sm:w-auto w-full">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="w-full sm:w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader className="px-6 py-4">
                <CardTitle>Appointments</CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointments found
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{appointment.clientName}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              <span>{format(appointment.date, 'PPP')}</span>
                              <Clock className="ml-2 mr-1 h-3 w-3" />
                              <span>{format(appointment.date, 'p')}</span>
                              <span className="ml-2">({appointment.duration} mins)</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{appointment.service}</Badge>
                          <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No appointments found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or search to find what you're looking for.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Select a date to view appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-auto w-full">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium mb-4">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                    </h3>
                    
                    {appointmentsForSelectedDate.length > 0 ? (
                      <div className="space-y-3">
                        {appointmentsForSelectedDate.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Clock className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{appointment.clientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(appointment.date, 'p')} - {appointment.service}
                                </p>
                              </div>
                            </div>
                            <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="text-lg font-medium">No appointments</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          There are no appointments scheduled for this day.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 