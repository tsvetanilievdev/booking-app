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
import { Clock, Search, Plus, Grid3X3, AlignLeft, MoreHorizontal, Edit, Trash, Calendar, Check, X } from 'lucide-react';

// Mock service categories
const categories = [
  { id: 1, name: 'Haircuts', count: 5 },
  { id: 2, name: 'Coloring', count: 3 },
  { id: 3, name: 'Spa', count: 4 },
  { id: 4, name: 'Manicure', count: 2 },
  { id: 5, name: 'Pedicure', count: 2 },
];

// Mock data for services
const servicesData = [
  {
    id: 1,
    name: 'Men\'s Haircut',
    description: 'Professional haircut service for men including washing and styling.',
    duration: 30,
    price: 40,
    category: 'Haircuts',
    popular: true,
  },
  {
    id: 2,
    name: 'Women\'s Haircut',
    description: 'Complete haircut service for women including washing, cutting, and styling.',
    duration: 45,
    price: 65,
    category: 'Haircuts',
    popular: true,
  },
  {
    id: 3,
    name: 'Hair Coloring',
    description: 'Full hair coloring service with premium products.',
    duration: 120,
    price: 95,
    category: 'Coloring',
    popular: true,
  },
  {
    id: 4,
    name: 'Highlights',
    description: 'Partial or full highlights to add dimension to your hair.',
    duration: 90,
    price: 120,
    category: 'Coloring',
    popular: false,
  },
  {
    id: 5,
    name: 'Basic Manicure',
    description: 'Nail trimming, shaping, cuticle care, and polish application.',
    duration: 30,
    price: 35,
    category: 'Manicure',
    popular: false,
  },
  {
    id: 6,
    name: 'Full Facial',
    description: 'Deep cleansing facial treatment with massage and mask.',
    duration: 60,
    price: 80,
    category: 'Spa',
    popular: false,
  },
  {
    id: 7,
    name: 'Massage Therapy',
    description: 'Full body massage to release tension and promote relaxation.',
    duration: 60,
    price: 90,
    category: 'Spa',
    popular: true,
  },
  {
    id: 8,
    name: 'Basic Pedicure',
    description: 'Foot soak, nail trimming, cuticle care, and polish application.',
    duration: 45,
    price: 45,
    category: 'Pedicure',
    popular: false,
  },
];

export default function ServicesPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // New service form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    category: '',
    popular: false,
  });
  
  // Filter services based on search query and selected category
  const filteredServices = servicesData.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Handle form submit for new service
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically add the new service to your backend
    console.log('Adding new service:', newService);
    setIsAddDialogOpen(false);
    // Reset form
    setNewService({
      name: '',
      description: '',
      duration: '',
      price: '',
      category: '',
      popular: false,
    });
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage your service offerings and pricing
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="sm:w-auto w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service for your clients to book.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddService}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input 
                      id="name" 
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      placeholder="e.g. Men's Haircut"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe what this service includes..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input 
                        id="duration" 
                        type="number"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                        placeholder="30"
                        min="1"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        type="number"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        placeholder="50"
                        min="0"
                        step=".01"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="popular"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={newService.popular}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewService({...newService, popular: e.target.checked})}
                    />
                    <Label htmlFor="popular">Mark as popular service</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Service</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Categories sidebar */}
          <div className="md:w-64 w-full">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span>All Services</span>
                    <Badge variant="outline">{servicesData.length}</Badge>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${selectedCategory === category.name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="outline">{category.count}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Category
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Card>
              <CardHeader className="px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>
                    {selectedCategory || 'All Services'} ({filteredServices.length})
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search services..."
                        className="w-full sm:w-[250px] pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center border rounded-md">
                      <button
                        className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid view"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List view"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {filteredServices.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="mb-2 h-10 w-10 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No services found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or category filter.
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredServices.map((service) => (
                      <Card key={service.id} className="overflow-hidden">
                        {service.popular && (
                          <div className="bg-primary text-primary-foreground text-xs py-0.5 px-2 absolute right-2 top-2 rounded-sm">
                            Popular
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-1 text-sm mb-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{service.duration} min</span>
                          </div>
                          <div className="font-medium text-lg">${service.price}</div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4 pb-4">
                          <Badge variant="outline" className="mr-2">
                            {service.category}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Manage availability</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredServices.map((service) => (
                      <div key={service.id} className="flex justify-between items-center border rounded-lg p-4">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium">{service.name}</h3>
                            {service.popular && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration} min</span>
                            </div>
                            <div>${service.price}</div>
                            <Badge variant="outline">{service.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 