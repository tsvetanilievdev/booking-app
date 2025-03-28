'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Search, Plus, Filter, MoreHorizontal, Trash2, Edit, X, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay, addMinutes } from 'date-fns';
// Import FullCalendar and required plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
// Import API services
import appointmentApi, { Appointment, AppointmentCreateData } from '@/app/api/appointments';
import serviceApi, { Service } from '@/app/api/services';
import clientApi, { Client } from '@/app/api/clients';
// Toast notifications
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Colors for FullCalendar events
const eventColors = {
  confirmed: '#22c55e', // green
  pending: '#eab308',   // yellow
  cancelled: '#ef4444', // red
};

export default function AppointmentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const calendarRef = useRef<any>(null);
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Client search states
  const [clientSearch, setClientSearch] = useState('');
  const [clientOpen, setClientOpen] = useState(false);
  
  // Service search states
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceOpen, setServiceOpen] = useState(false);
  
  // Separate client and service open states for create and edit modals
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [editServiceOpen, setEditServiceOpen] = useState(false);
  
  // Get today's date for date validation
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Generate time slots in 5-minute intervals
  const generateTimeSlots = () => {
    const timeSlots = [];
    // Only include hours from 6:00 to 22:00 (excluding 22:00)
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        timeSlots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return timeSlots;
  };
  
  const timeSlots = generateTimeSlots();

  // Filter out already booked time slots for the selected date
  const getAvailableTimeSlots = (selectedDate: string, editingAppointmentId?: string) => {
    // If no date is selected, return all time slots
    if (!selectedDate) return timeSlots;
    
    // Create a copy of all time slots
    const availableSlots = [...timeSlots];
    
    // Get the appointments for the selected date
    const dateAppointments = appointments.filter(appointment => {
      // Skip the current appointment being edited
      if (editingAppointmentId && appointment.id === editingAppointmentId) {
        return false;
      }
      
      const appointmentDate = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      return appointmentDate === selectedDate && !appointment.isCancelled;
    });
    
    if (dateAppointments.length === 0) return availableSlots;
    
    // Find booked time slots
    const bookedTimeSlots = new Set<string>();
    
    dateAppointments.forEach(appointment => {
      const startTime = new Date(appointment.startTime);
      const endTime = new Date(appointment.endTime);
      
      // Get time ranges
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      
      // Mark all time slots within this appointment as booked
      availableSlots.forEach(timeSlot => {
        const [hour, minute] = timeSlot.split(':').map(Number);
        
        // Check if this time slot is within the appointment time range
        if ((hour > startHour || (hour === startHour && minute >= startMinute)) &&
            (hour < endHour || (hour === endHour && minute < endMinute))) {
          bookedTimeSlots.add(timeSlot);
        }
      });
    });
    
    // Filter out booked time slots
    return availableSlots.filter(slot => !bookedTimeSlots.has(slot));
  };

  // Form state for new appointment
  const [formData, setFormData] = useState<{
    serviceId: string;
    clientId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
  }>({
    serviceId: '',
    clientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endTime: '',
    notes: '',
  });

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchClients();
      fetchServices();
    }
  }, [isAuthenticated]);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointments();
      console.log('Appointments API response:', response);
      
      if (response && response.data) {
        if (Array.isArray(response.data.appointments)) {
          // Standard response format
          console.log('Setting appointments from appointments array:', response.data.appointments);
          setAppointments(response.data.appointments);
        } else if (Array.isArray(response.data)) {
          // Alternative response format
          console.log('Setting appointments from direct data array:', response.data);
          setAppointments(response.data);
        } else {
          console.warn('Unexpected appointments data format:', response.data);
          setAppointments([]);
        }
      } else {
        console.warn('No appointment data in response:', response);
        setAppointments([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]); // Set to empty array on error
      setLoading(false);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await clientApi.getClients();
      console.log('Fetched clients response:', response);
      
      if (response.status === 'success') {
        // Handle both possible response structures
        if (Array.isArray(response.data)) {
          // Direct array of clients
          console.log('Setting clients to direct array:', response.data);
          setClients(response.data);
        } else if (response.data && response.data.clients && Array.isArray(response.data.clients)) {
          // Nested clients array
          console.log('Setting clients to nested array:', response.data.clients);
          setClients(response.data.clients);
        } else {
          console.log('No clients found in response or unexpected format:', response);
          setClients([]);
        }
      } else {
        console.log('API response not successful:', response);
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setClients([]); // Set to empty array on error
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await serviceApi.getServices();
      console.log('Fetched services response:', response);
      
      if (response.status === 'success') {
        // Handle both possible response structures
        if (Array.isArray(response.data)) {
          // Direct array of services
          console.log('Setting services to direct array:', response.data);
          setServices(response.data);
        } else if (response.data && response.data.services && Array.isArray(response.data.services)) {
          // Nested services array
          console.log('Setting services to nested array:', response.data.services);
          setServices(response.data.services);
        } else {
          console.log('No services found in response or unexpected format:', response);
          setServices([]);
        }
      } else {
        console.log('No services found in response or unexpected format:', response);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setServices([]); // Set to empty array on error
    }
  };

  // Handle auth redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Filter appointments based on search query and status filter - with null checks
  const filteredAppointments = appointments ? appointments.filter(appointment => {
    const clientName = appointment.Client?.name || '';
    const serviceName = appointment.Service?.name || '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "confirmed" && !appointment.isCancelled) ||
      (statusFilter === "cancelled" && appointment.isCancelled);
    
    return matchesSearch && matchesStatus;
  }) : [];

  // Convert appointments to FullCalendar events - with null checks
  const calendarEvents = appointments ? appointments.map(appointment => {
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    
    const status = appointment.isCancelled ? 'cancelled' : 'confirmed';
    
    return {
      id: appointment.id,
      title: `${appointment.Client?.name || 'Unknown Client'} - ${appointment.Service?.name || 'Unknown Service'}`,
      start: startTime,
      end: endTime,
      backgroundColor: eventColors[status as keyof typeof eventColors],
      borderColor: eventColors[status as keyof typeof eventColors],
      extendedProps: {
        status: status,
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        notes: appointment.notes,
        appointment: appointment
      }
    };
  }) : [];

  // Handle appointment form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate end time based on service duration and start time
  useEffect(() => {
    if (formData.serviceId && formData.startTime) {
      const selectedService = services.find(s => s.id === formData.serviceId);
      if (selectedService) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
        setFormData(prev => ({
          ...prev,
          endTime: format(endDate, 'HH:mm')
        }));
      }
    }
  }, [formData.serviceId, formData.startTime, services]);

  // Create a new appointment
  const handleCreateAppointment = async () => {
    try {
      setSubmitting(true);
      
      // Convert clientId to number
      const clientId = parseInt(formData.clientId);
      if (isNaN(clientId)) {
        toast.error('Invalid client selected');
        setSubmitting(false);
        return;
      }

      // Create proper date objects with timezone consideration
      const [year, month, day] = formData.date.split('-').map(Number);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      // Create Date objects (month is 0-indexed in JavaScript Date)
      const startDateTime = new Date(year, month - 1, day, startHours, startMinutes);
      const endDateTime = new Date(year, month - 1, day, endHours, endMinutes);
      
      // Check if the appointment time is in the past
      const now = new Date();
      if (startDateTime <= now) {
        toast.error('Appointment time must be in the future');
        setSubmitting(false);
        return;
      }
      
      // Handle case where end time is on the next day
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      console.log('Appointment times (local):', { 
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        now: now.toString()
      });
      
      // Create appointment data with properly formatted ISO date strings
      const appointmentData: AppointmentCreateData = {
        serviceId: formData.serviceId,
        clientId: clientId,
        startTime: startDateTime.toISOString(), // Includes timezone info
        endTime: endDateTime.toISOString(),     // Includes timezone info
        notes: formData.notes ? [formData.notes] : [],
        userId: user?.id
      };

      console.log('Creating appointment with data:', appointmentData);
      
      // Submit to API
      const response = await appointmentApi.createAppointment(appointmentData);
      
      // Update state
      setAppointments(prev => [...prev, response.data.appointment]);
      toast.success('Appointment created successfully');
      
      // Reset form and close modal
      setFormData({
        serviceId: '',
        clientId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        endTime: '',
        notes: '',
      });
      setIsCreateModalOpen(false);
      
      setSubmitting(false);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      if (error.response?.data?.error?.message) {
        // Display the specific error message from the server
        toast.error(`Error: ${error.response.data.error.message}`);
      } else {
        toast.error('Failed to create appointment');
      }
      setSubmitting(false);
    }
  };

  // Update an appointment
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      // Convert clientId to number
      const clientId = parseInt(formData.clientId);
      if (isNaN(clientId)) {
        toast.error('Invalid client selected');
        setSubmitting(false);
        return;
      }

      // Create proper date objects with timezone consideration
      const [year, month, day] = formData.date.split('-').map(Number);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      // Create Date objects (month is 0-indexed in JavaScript Date)
      const startDateTime = new Date(year, month - 1, day, startHours, startMinutes);
      const endDateTime = new Date(year, month - 1, day, endHours, endMinutes);
      
      // Check if the appointment time is in the past
      const now = new Date();
      if (startDateTime <= now) {
        toast.error('Appointment time must be in the future');
        setSubmitting(false);
        return;
      }
      
      // Handle case where end time is on the next day
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      
      console.log('Updated appointment times (local):', { 
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        now: now.toString()
      });

      // Create appointment data with properly formatted ISO date strings
      const appointmentData: Partial<AppointmentCreateData> = {
        serviceId: formData.serviceId,
        clientId: clientId,
        startTime: startDateTime.toISOString(), // Includes timezone info
        endTime: endDateTime.toISOString(),     // Includes timezone info
        notes: formData.notes ? [formData.notes] : [],
        userId: user?.id
      };

      console.log('Updating appointment with data:', appointmentData);
      
      // Submit to API
      const response = await appointmentApi.updateAppointment(selectedAppointment.id, appointmentData);
      
      // Update state
      setAppointments(prev => 
        prev.map(item => 
          item.id === selectedAppointment.id ? response.data.appointment : item
        )
      );
      toast.success('Appointment updated successfully');
      
      // Reset form and close modal
      setSelectedAppointment(null);
      setIsEditModalOpen(false);
      
      setSubmitting(false);
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      if (error.response?.data?.error?.message) {
        // Display the specific error message from the server
        toast.error(`Error: ${error.response.data.error.message}`);
      } else {
        toast.error('Failed to update appointment');
      }
      setSubmitting(false);
    }
  };

  // Delete an appointment
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setSubmitting(true);
      
      // Submit to API
      await appointmentApi.deleteAppointment(selectedAppointment.id);
      
      // Update state
      setAppointments(prev => prev.filter(item => item.id !== selectedAppointment.id));
      toast.success('Appointment deleted successfully');
      
      // Reset form and close modal
      setSelectedAppointment(null);
      setIsDeleteModalOpen(false);
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
      setSubmitting(false);
    }
  };

  // Cancel an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setSubmitting(true);
      
      // Submit to API
      const response = await appointmentApi.cancelAppointment(appointmentId);
      
      // Update state
      setAppointments(prev => 
        prev.map(item => 
          item.id === appointmentId ? response.data.appointment : item
        )
      );
      toast.success('Appointment cancelled successfully');
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
      setSubmitting(false);
    }
  };

  // Open edit modal for a specific appointment
  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Set form data based on selected appointment
    setFormData({
      serviceId: appointment.serviceId,
      clientId: appointment.clientId.toString(),
      date: format(new Date(appointment.startTime), 'yyyy-MM-dd'),
      startTime: format(new Date(appointment.startTime), 'HH:mm'),
      endTime: format(new Date(appointment.endTime), 'HH:mm'),
      notes: appointment.notes && appointment.notes.length > 0 ? appointment.notes[0] : ''
    });
    
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  // Handle date click in calendar
  const handleDateClick = (info: any) => {
    // Set the selected date for the form 
    const clickedDate = new Date(info.dateStr);
    
    // Reset form with selected date
    setFormData({
      serviceId: '',
      clientId: '',
      date: format(clickedDate, 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm'),
      endTime: '',
      notes: '',
    });
    
    // Open create modal
    setIsCreateModalOpen(true);
  };

  // Handle event click in calendar
  const handleEventClick = (info: any) => {
    const appointment = info.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    
    const startDateTime = new Date(appointment.startTime);
    const endDateTime = new Date(appointment.endTime);
    
    // Set form data based on selected appointment
    setFormData({
      serviceId: appointment.serviceId,
      clientId: appointment.clientId.toString(),
      date: format(startDateTime, 'yyyy-MM-dd'),
      startTime: format(startDateTime, 'HH:mm'),
      endTime: format(endDateTime, 'HH:mm'),
      notes: appointment.notes && appointment.notes.length > 0 ? appointment.notes[0] : ''
    });
    
    setIsEditModalOpen(true);
  };

  // Get the service duration for end time calculation
  const getServiceDuration = (serviceId: string): number => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.duration : 60; // Default to 60 minutes if not found
  };

  // Generate filtered clients based on search - improve search to be more flexible
  const filteredClients = clients
    ? clients.filter(client => {
        const searchLower = clientSearch.toLowerCase().trim();
        if (!searchLower) return true; // Show all when search is empty
        
        return (
          client.name.toLowerCase().includes(searchLower) ||
          (client.email && client.email.toLowerCase().includes(searchLower)) ||
          (client.phone && client.phone.toLowerCase().includes(searchLower))
        );
      })
    : [];
    
  // Generate filtered services based on search - improve search to be more flexible
  const filteredServices = services
    ? services.filter(service => {
        const searchLower = serviceSearch.toLowerCase().trim();
        if (!searchLower) return true; // Show all when search is empty
        
        return (
          service.name.toLowerCase().includes(searchLower) ||
          (service.description && service.description.toLowerCase().includes(searchLower))
        );
      })
    : [];

  // Client and service selection debug logs
  useEffect(() => {
    console.log("Current formData:", formData);
    console.log("Available clients:", clients);
    console.log("Available services:", services);
  }, [formData, clients, services]);

  if (authLoading) {
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
          <Button className="sm:w-auto w-full" onClick={() => {
            setFormData({
              serviceId: '',
              clientId: '',
              date: format(new Date(), 'yyyy-MM-dd'),
              startTime: format(new Date(), 'HH:mm'),
              endTime: '',
              notes: '',
            });
            setIsCreateModalOpen(true);
          }}>
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
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
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
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                <div className="divide-y">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div>
                              <p className="font-medium">
                                {appointment.Client ? appointment.Client.name : 'Unknown Client'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.Service ? appointment.Service.name : 'Unknown Service'}
                              </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                                <span>{format(new Date(appointment.startTime), 'PPP')}</span>
                              <Clock className="ml-2 mr-1 h-3 w-3" />
                                <span>{format(new Date(appointment.startTime), 'p')}</span>
                                <span className="ml-2">
                                  ({appointment.Service ? appointment.Service.duration : '??'} mins)
                                </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">{appointment.Service ? appointment.Service.name : 'Unknown Service'}</Badge>
                            <Badge className={appointment.isCancelled ? statusColors.cancelled : statusColors.confirmed}>
                              {appointment.isCancelled ? 'Cancelled' : 'Confirmed'}
                          </Badge>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditModal(appointment)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!appointment.isCancelled && (
                                <Button variant="ghost" size="icon" onClick={() => handleCancelAppointment(appointment.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => openDeleteModal(appointment)}>
                                <Trash2 className="h-4 w-4" />
                          </Button>
                            </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No appointments found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters or search to find what you're looking for.
                      </p>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View and manage your appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-[700px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="calendar-container">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}
                        >
                          Month
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}
                        >
                          Week
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => calendarRef.current?.getApi().changeView('timeGridDay')}
                        >
                          Day
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => calendarRef.current?.getApi().prev()}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => calendarRef.current?.getApi().today()}>
                          Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => calendarRef.current?.getApi().next()}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Button>
                      </div>
                              </div>
                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                      initialView="timeGridWeek"
                      headerToolbar={{
                        left: '',
                        center: 'title',
                        right: ''
                      }}
                      events={calendarEvents}
                      height="700px"
                      nowIndicator={true}
                      slotMinTime="08:00:00"
                      slotMaxTime="20:00:00"
                      businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                        startTime: '09:00',
                        endTime: '18:00',
                      }}
                      eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false,
                      }}
                      selectable={true}
                      selectMirror={true}
                      dayMaxEvents={true}
                      dateClick={handleDateClick}
                      eventClick={handleEventClick}
                      eventContent={(eventInfo) => {
                        const status = eventInfo.event.extendedProps.status;
                        return (
                          <div className="fc-event-content-wrapper p-1">
                            <div className="font-semibold">{eventInfo.event.title}</div>
                            <div className="text-xs">
                              {format(eventInfo.event.start!, 'h:mm a')} - 
                              {format(eventInfo.event.end!, 'h:mm a')}
                              </div>
                            <div className="text-xs capitalize">
                              {status}
                            </div>
                          </div>
                        );
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Appointment Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Client
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    console.log("Client selected:", value);
                    setFormData(prev => ({...prev, clientId: value}));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-2">
                      <Input
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredClients.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No clients found
                      </div>
                    ) : (
                      filteredClients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            {client.email && <span className="text-xs text-muted-foreground">{client.email}</span>}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceId" className="text-right">
                Service
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => {
                    console.log("Service selected:", value);
                    setFormData(prev => {
                      const newState = {...prev, serviceId: value};
                      
                      // Auto-calculate end time when service is selected if start time exists
                      if (newState.startTime) {
                        const selectedService = services.find(s => s.id === value);
                        if (selectedService) {
                          const [hours, minutes] = newState.startTime.split(':').map(Number);
                          const startDate = new Date();
                          startDate.setHours(hours, minutes, 0, 0);
                          
                          const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
                          newState.endTime = format(endDate, 'HH:mm');
                        }
                      }
                      
                      console.log("New form data after service selection:", newState);
                      return newState;
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-2">
                      <Input
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredServices.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No services found
                      </div>
                    ) : (
                      filteredServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-xs text-muted-foreground">{service.duration} mins</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    date: newDate,
                    // Reset times when date changes
                    startTime: '',
                    endTime: ''
                  }));
                }}
                min={today} // Prevent selecting past dates
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.startTime} 
                  onValueChange={(value) => {
                    // Auto-calculate end time when start time changes if service is selected
                    setFormData(prev => {
                      const newState = {...prev, startTime: value};
                      if (newState.serviceId) {
                        const selectedService = services.find(s => s.id === newState.serviceId);
                        if (selectedService) {
                          const [hours, minutes] = value.split(':').map(Number);
                          const startDate = new Date();
                          startDate.setHours(hours, minutes, 0, 0);
                          
                          const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
                          newState.endTime = format(endDate, 'HH:mm');
                        }
                      }
                      return newState;
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getAvailableTimeSlots(formData.date).map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.endTime} 
                  onValueChange={(value) => setFormData(prev => ({...prev, endTime: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getAvailableTimeSlots(formData.date).map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Add appointment notes"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAppointment}
              disabled={submitting || !formData.clientId || !formData.serviceId || !formData.date || !formData.startTime || !formData.endTime}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientId" className="text-right">
                Client
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    console.log("Edit modal: Client selected:", value);
                    setFormData(prev => ({...prev, clientId: value}));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-2">
                      <Input
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredClients.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No clients found
                      </div>
                    ) : (
                      filteredClients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            {client.email && <span className="text-xs text-muted-foreground">{client.email}</span>}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceId" className="text-right">
                Service
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => {
                    console.log("Edit modal: Service selected:", value);
                    setFormData(prev => {
                      const newState = {...prev, serviceId: value};
                      
                      // Auto-calculate end time when service is selected if start time exists
                      if (newState.startTime) {
                        const selectedService = services.find(s => s.id === value);
                        if (selectedService) {
                          const [hours, minutes] = newState.startTime.split(':').map(Number);
                          const startDate = new Date();
                          startDate.setHours(hours, minutes, 0, 0);
                          
                          const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
                          newState.endTime = format(endDate, 'HH:mm');
                        }
                      }
                      
                      console.log("Edit modal: New form data after service selection:", newState);
                      return newState;
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="p-2">
                      <Input
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredServices.length === 0 ? (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No services found
                      </div>
                    ) : (
                      filteredServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-xs text-muted-foreground">{service.duration} mins</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    date: newDate,
                    // Reset times when date changes
                    startTime: '',
                    endTime: ''
                  }));
                }}
                min={today} // Prevent selecting past dates
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.startTime} 
                  onValueChange={(value) => {
                    // Auto-calculate end time when start time changes if service is selected
                    setFormData(prev => {
                      const newState = {...prev, startTime: value};
                      if (newState.serviceId) {
                        const selectedService = services.find(s => s.id === newState.serviceId);
                        if (selectedService) {
                          const [hours, minutes] = value.split(':').map(Number);
                          const startDate = new Date();
                          startDate.setHours(hours, minutes, 0, 0);
                          
                          const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
                          newState.endTime = format(endDate, 'HH:mm');
                        }
                      }
                      return newState;
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getAvailableTimeSlots(formData.date, selectedAppointment?.id).map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.endTime} 
                  onValueChange={(value) => setFormData(prev => ({...prev, endTime: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getAvailableTimeSlots(formData.date, selectedAppointment?.id).map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Add appointment notes"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAppointment}
              disabled={submitting || !formData.clientId || !formData.serviceId || !formData.date || !formData.startTime || !formData.endTime}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAppointment}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Appointment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 