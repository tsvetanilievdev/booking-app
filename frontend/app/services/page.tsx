'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Clock, Search, Plus, Grid3X3, AlignLeft, MoreHorizontal, Edit, Trash, Calendar, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import serviceApi, { Service, ServiceCreateData } from '@/app/api/services';

// Days of the week for availability selection
const daysOfWeek = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
];

export default function ServicesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State for services
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isDeleteServiceOpen, setIsDeleteServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for service
  const [serviceForm, setServiceForm] = useState<ServiceCreateData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    availableDays: [1, 2, 3, 4, 5], // Monday to Friday by default
    availableTimeStart: 9, // 9 AM
    availableTimeEnd: 17, // 5 PM
  });

  // Fetch services from the API
  const fetchServices = async () => {
    try {
      setLoading(true);
      console.log('Fetching services...');
      
      const response = await serviceApi.getServices();
      console.log('Raw service API response:', response);
      
      if (response.status === 'success') {
        // Handle both possible response structures
        if (Array.isArray(response.data)) {
          // Direct array of services
          console.log('Found direct services array with length:', response.data.length);
          setServices(response.data);
          console.log('Services state set to:', response.data);
        } else if (response.data && response.data.services && Array.isArray(response.data.services)) {
          // Nested services array
          console.log('Found nested services array with length:', response.data.services.length);
          setServices(response.data.services);
          console.log('Services state set to:', response.data.services);
        } else {
          console.warn('Services data has unexpected format:', response.data);
          setServices([]);
        }
      } else {
        console.warn('Unexpected response format:', response);
        setServices([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
      setServices([]);
      setLoading(false);
    }
  };

  // Fetch when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Filter services based on search query and active tab
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'available' && service.isAvailable) ||
                      (activeTab === 'unavailable' && !service.isAvailable);
    
    return matchesSearch && matchesTab;
  });

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const numericFields = ['price', 'duration', 'availableTimeStart', 'availableTimeEnd'];
    
    if (numericFields.includes(name)) {
      setServiceForm(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setServiceForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Toggle day selection in availableDays array
  const toggleDaySelection = (dayId: number) => {
    setServiceForm(prev => {
      const currentDays = [...prev.availableDays];
      const dayIndex = currentDays.indexOf(dayId);
      
      if (dayIndex === -1) {
        // Add the day if not present
        return {
          ...prev,
          availableDays: [...currentDays, dayId].sort()
        };
      } else {
        // Remove the day if already present
        currentDays.splice(dayIndex, 1);
        return {
          ...prev,
          availableDays: currentDays
        };
      }
    });
  };

  // Add new service
  const handleAddService = async () => {
    try {
      setSubmitting(true);
      await serviceApi.createService(serviceForm);
      toast.success('Service added successfully');
      
      // Refresh service list
      fetchServices();
      
      // Reset form and close modal
      setIsAddServiceOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
      setSubmitting(false);
    }
  };

  // Update service
  const handleUpdateService = async () => {
    if (!selectedService) return;
    
    try {
      setSubmitting(true);
      await serviceApi.updateService(selectedService.id, serviceForm);
      toast.success('Service updated successfully');
      
      // Refresh service list
      fetchServices();
      
      // Reset form and close modal
      setSelectedService(null);
      setIsEditServiceOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      setSubmitting(false);
    }
  };

  // Delete service
  const handleDeleteService = async () => {
    if (!selectedService) return;
    
    try {
      setSubmitting(true);
      await serviceApi.deleteService(selectedService.id);
      toast.success('Service deleted successfully');
      
      // Refresh service list
      fetchServices();
      
      // Reset form and close modal
      setSelectedService(null);
      setIsDeleteServiceOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      setSubmitting(false);
    }
  };

  // Toggle service availability
  const handleToggleAvailability = async (service: Service) => {
    try {
      // Create a serviceData object with only the fields allowed in ServiceCreateData
      const serviceData: Partial<ServiceCreateData> = {
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        availableDays: service.availableDays,
        availableTimeStart: service.availableTimeStart,
        availableTimeEnd: service.availableTimeEnd
      };

      // Update the service on the backend
      await serviceApi.updateService(service.id, serviceData);
      
      // Show success message
      toast.success(`Service is now ${!service.isAvailable ? 'available' : 'unavailable'}`);
      
      // Refresh service list
      fetchServices();
    } catch (error) {
      console.error('Error toggling service availability:', error);
      toast.error('Failed to update service availability');
    }
  };

  // Open edit service modal
  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      availableDays: service.availableDays,
      availableTimeStart: service.availableTimeStart,
      availableTimeEnd: service.availableTimeEnd
    });
    setIsEditServiceOpen(true);
  };

  // Open delete service modal
  const openDeleteModal = (service: Service) => {
    setSelectedService(service);
    setIsDeleteServiceOpen(true);
  };

  // Format time for display (convert from 24h to AM/PM)
  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage your service offerings
            </p>
          </div>
          <Button className="sm:w-auto w-full" onClick={() => {
            setServiceForm({
              name: '',
              description: '',
              price: 0,
              duration: 30,
              availableDays: [1, 2, 3, 4, 5],
              availableTimeStart: 9,
              availableTimeEnd: 17,
            });
            setIsAddServiceOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Services</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
            </TabsList>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className={!service.isAvailable ? 'opacity-75' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Service</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAvailability(service)}>
                              {service.isAvailable ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  <span>Mark as Unavailable</span>
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  <span>Mark as Available</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteModal(service)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete Service</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="font-normal">
                          ${service.price}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          <Clock className="mr-1 h-3 w-3" /> {service.duration} mins
                        </Badge>
                        {!service.isAvailable && (
                          <Badge variant="destructive" className="font-normal">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>Available: {service.availableDays.map(d => daysOfWeek.find(day => day.id === d)?.label.slice(0, 3)).join(', ')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Hours: {formatTime(service.availableTimeStart)} - {formatTime(service.availableTimeEnd)}</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Grid3X3 className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No services found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search to find what you're looking for.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Service</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAvailability(service)}>
                              <X className="mr-2 h-4 w-4" />
                              <span>Mark as Unavailable</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteModal(service)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete Service</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="font-normal">
                          ${service.price}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          <Clock className="mr-1 h-3 w-3" /> {service.duration} mins
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>Available: {service.availableDays.map(d => daysOfWeek.find(day => day.id === d)?.label.slice(0, 3)).join(', ')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Hours: {formatTime(service.availableTimeStart)} - {formatTime(service.availableTimeEnd)}</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Check className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No available services found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or adding a new service.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="unavailable" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditModal(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Service</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleAvailability(service)}>
                              <Check className="mr-2 h-4 w-4" />
                              <span>Mark as Available</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteModal(service)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete Service</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="font-normal">
                          ${service.price}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          <Clock className="mr-1 h-3 w-3" /> {service.duration} mins
                        </Badge>
                        <Badge variant="destructive" className="font-normal">
                          Unavailable
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>Available: {service.availableDays.map(d => daysOfWeek.find(day => day.id === d)?.label.slice(0, 3)).join(', ')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>Hours: {formatTime(service.availableTimeStart)} - {formatTime(service.availableTimeEnd)}</span>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <X className="mb-2 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No unavailable services found</h3>
                <p className="text-sm text-muted-foreground">
                  All your services are currently available.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Service Modal */}
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Add a new service to your offerings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={serviceForm.name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={serviceForm.description}
                onChange={handleFormChange}
                placeholder="Describe the service"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={serviceForm.price}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (mins) *
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="5"
                step="5"
                value={serviceForm.duration}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Available Days
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={serviceForm.availableDays.includes(day.id) ? "default" : "outline"}
                    className="mb-1"
                    onClick={() => toggleDaySelection(day.id)}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availableTimeStart" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="availableTimeStart"
                  name="availableTimeStart"
                  type="number"
                  min="0"
                  max="23"
                  value={serviceForm.availableTimeStart}
                  onChange={handleFormChange}
                  className="w-20"
                />
                <span>{serviceForm.availableTimeStart < 12 ? 'AM' : 'PM'}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availableTimeEnd" className="text-right">
                End Time
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="availableTimeEnd"
                  name="availableTimeEnd"
                  type="number"
                  min="0"
                  max="23"
                  value={serviceForm.availableTimeEnd}
                  onChange={handleFormChange}
                  className="w-20"
                />
                <span>{serviceForm.availableTimeEnd < 12 ? 'AM' : 'PM'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddServiceOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddService}
              disabled={submitting || !serviceForm.name || serviceForm.price <= 0 || serviceForm.duration <= 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Modal */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={serviceForm.name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={serviceForm.description}
                onChange={handleFormChange}
                placeholder="Describe the service"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={serviceForm.price}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (mins) *
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="5"
                step="5"
                value={serviceForm.duration}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Available Days
              </Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.id}
                    type="button"
                    variant={serviceForm.availableDays.includes(day.id) ? "default" : "outline"}
                    className="mb-1"
                    onClick={() => toggleDaySelection(day.id)}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availableTimeStart" className="text-right">
                Start Time
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="availableTimeStart"
                  name="availableTimeStart"
                  type="number"
                  min="0"
                  max="23"
                  value={serviceForm.availableTimeStart}
                  onChange={handleFormChange}
                  className="w-20"
                />
                <span>{serviceForm.availableTimeStart < 12 ? 'AM' : 'PM'}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availableTimeEnd" className="text-right">
                End Time
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="availableTimeEnd"
                  name="availableTimeEnd"
                  type="number"
                  min="0"
                  max="23"
                  value={serviceForm.availableTimeEnd}
                  onChange={handleFormChange}
                  className="w-20"
                />
                <span>{serviceForm.availableTimeEnd < 12 ? 'AM' : 'PM'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditServiceOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateService}
              disabled={submitting || !serviceForm.name || serviceForm.price <= 0 || serviceForm.duration <= 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Modal */}
      <Dialog open={isDeleteServiceOpen} onOpenChange={setIsDeleteServiceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteServiceOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteService}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 