'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Plus, MoreHorizontal, Calendar, Mail, Phone, Edit, Trash, UserCheck, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Import API services
import clientApi, { Client, ClientCreateData } from '@/app/api/clients';
import { useRouter as useNavigationRouter } from 'next/navigation';

export default function ClientsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const navigationRouter = useNavigationRouter();
  
  // State for clients
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State for client form
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form state
  const [clientForm, setClientForm] = useState<ClientCreateData>({
    name: '',
    email: '',
    phone: '',
    notes: [],
    preferences: {}
  });

  // Fetch clients from the API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClients(searchQuery, page, itemsPerPage);
      setClients(response?.items || []);
      setTotalClients(response?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
      setLoading(false);
    }
  };

  // Fetch when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated, page, searchQuery, itemsPerPage]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'notes') {
      setClientForm(prev => ({
        ...prev,
        notes: [value]
      }));
    } else {
      setClientForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add new client
  const handleAddClient = async () => {
    try {
      setSubmitting(true);
      const newClient = await clientApi.createClient(clientForm);
      toast.success('Client added successfully');
      
      // Refresh client list
      fetchClients();
      
      // Reset form and close modal
      setClientForm({
        name: '',
        email: '',
        phone: '',
        notes: [],
        preferences: {}
      });
      setIsAddClientOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
      setSubmitting(false);
    }
  };

  // Update client
  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    
    try {
      setSubmitting(true);
      await clientApi.updateClient(selectedClient.id, clientForm);
      toast.success('Client updated successfully');
      
      // Refresh client list
      fetchClients();
      
      // Reset form and close modal
      setSelectedClient(null);
      setIsEditClientOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      setSubmitting(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      setSubmitting(true);
      await clientApi.deleteClient(selectedClient.id);
      toast.success('Client deleted successfully');
      
      // Refresh client list
      fetchClients();
      
      // Reset form and close modal
      setSelectedClient(null);
      setIsDeleteClientOpen(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      setSubmitting(false);
    }
  };

  // Toggle VIP status
  const handleToggleVipStatus = async (client: Client) => {
    try {
      await clientApi.updateClientVipStatus(client.id, !client.isVip);
      toast.success(`Client ${client.isVip ? 'removed from' : 'added to'} VIP status`);
      
      // Refresh client list
      fetchClients();
    } catch (error) {
      console.error('Error updating VIP status:', error);
      toast.error('Failed to update VIP status');
    }
  };

  // Open edit client modal
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes || [],
      preferences: client.preferences || {}
    });
    setIsEditClientOpen(true);
  };

  // Open delete client modal
  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteClientOpen(true);
  };

  // Open booking page for the client
  const navigateToBooking = (clientId: number) => {
    navigationRouter.push(`/appointments/new?clientId=${clientId}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalClients / itemsPerPage);

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
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client database
            </p>
          </div>
          <Button className="sm:w-auto w-full" onClick={() => {
            setClientForm({
              name: '',
              email: '',
              phone: '',
              notes: [],
              preferences: {}
            });
            setIsAddClientOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Client List</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clients..."
                  className="w-full sm:w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              {totalClients} clients found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {client.name}
                              {client.isVip && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">VIP</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center text-sm">
                                <Mail className="mr-1 h-3 w-3" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-1 h-3 w-3" />
                                <span>{client.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              <span>{client.lastVisit ? format(new Date(client.lastVisit), 'PP') : 'No visits yet'}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {client.totalVisits || 0} total visits
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${client.totalSpent || 0}
                          </TableCell>
                          <TableCell>
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
                                <DropdownMenuItem onClick={() => navigateToBooking(client.id)}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Book Appointment</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditModal(client)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Client</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleVipStatus(client)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  <span>{client.isVip ? 'Remove VIP Status' : 'Make VIP'}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDeleteModal(client)} className="text-red-600">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete Client</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No clients found. Try a different search or add a new client.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="p-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            className={page === 1 ? 'pointer-events-none opacity-50' : ''} 
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show pages around the current page
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (page <= 3) {
                            pageNumber = i + 1;
                          } else if (page >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = page - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink 
                                onClick={() => setPage(pageNumber)}
                                isActive={page === pageNumber}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        {totalPages > 5 && page < totalPages - 2 && (
                          <>
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink 
                                onClick={() => setPage(totalPages)}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : ''} 
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Client Modal */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database.
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
                value={clientForm.name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientForm.email}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone *
              </Label>
              <Input
                id="phone"
                name="phone"
                value={clientForm.phone}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={clientForm.notes?.[0] || ''}
                onChange={handleFormChange}
                placeholder="Add client notes"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddClientOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={submitting || !clientForm.name || !clientForm.phone}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Client Modal */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information.
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
                value={clientForm.name}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={clientForm.email}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone *
              </Label>
              <Input
                id="phone"
                name="phone"
                value={clientForm.phone}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={clientForm.notes?.[0] || ''}
                onChange={handleFormChange}
                placeholder="Add client notes"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditClientOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateClient}
              disabled={submitting || !clientForm.name || !clientForm.phone}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Client Modal */}
      <Dialog open={isDeleteClientOpen} onOpenChange={setIsDeleteClientOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteClientOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteClient}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 