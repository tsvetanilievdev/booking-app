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
import { Search, Plus, MoreHorizontal, Calendar, Mail, Phone, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for clients
const clientsData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    lastAppointment: new Date(2023, 4, 20),
    totalAppointments: 8,
    totalSpent: 560,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    lastAppointment: new Date(2023, 5, 5),
    totalAppointments: 12,
    totalSpent: 890,
  },
  {
    id: 3,
    name: 'David Brown',
    email: 'david.brown@example.com',
    phone: '+1 (555) 345-6789',
    lastAppointment: new Date(2023, 5, 12),
    totalAppointments: 3,
    totalSpent: 210,
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '+1 (555) 456-7890',
    lastAppointment: new Date(2023, 5, 1),
    totalAppointments: 5,
    totalSpent: 350,
  },
  {
    id: 5,
    name: 'Michael Davis',
    email: 'michael.davis@example.com',
    phone: '+1 (555) 567-8901',
    lastAppointment: new Date(2023, 4, 15),
    totalAppointments: 7,
    totalSpent: 490,
  },
  {
    id: 6,
    name: 'Jennifer White',
    email: 'jennifer.w@example.com',
    phone: '+1 (555) 678-9012',
    lastAppointment: new Date(2023, 5, 8),
    totalAppointments: 9,
    totalSpent: 720,
  },
  {
    id: 7,
    name: 'Robert Miller',
    email: 'robert.m@example.com',
    phone: '+1 (555) 789-0123',
    lastAppointment: new Date(2023, 3, 28),
    totalAppointments: 2,
    totalSpent: 150,
  },
  {
    id: 8,
    name: 'Lisa Taylor',
    email: 'lisa.t@example.com',
    phone: '+1 (555) 890-1234',
    lastAppointment: new Date(2023, 5, 10),
    totalAppointments: 4,
    totalSpent: 320,
  },
];

export default function ClientsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  
  // Filter clients based on search query
  const filteredClients = clientsData.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );
  
  // Paginate clients
  const paginatedClients = filteredClients.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Reset to first page when search query changes
    setPage(1);
  }, [searchQuery]);

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
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your client database
            </p>
          </div>
          <Button className="sm:w-auto w-full">
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
              {filteredClients.length} clients found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Appointment</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
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
                          <span>{format(client.lastAppointment, 'PP')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {client.totalAppointments} appointments
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${client.totalSpent}
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
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Book Appointment</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Client</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="mb-2 h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No clients found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search to find what you're looking for.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {filteredClients.length > itemsPerPage && (
              <div className="px-6 py-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      )
                      .map((pageNum, i, arr) => {
                        // Check if we need to add an ellipsis
                        if (i > 0 && pageNum - arr[i - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${pageNum}`}>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink 
                                  href="#" 
                                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                    e.preventDefault();
                                    setPage(pageNum);
                                  }}
                                  isActive={pageNum === page}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          );
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              href="#" 
                              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                              isActive={pageNum === page}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 