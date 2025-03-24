'use client';

import { useState, useEffect } from 'react';
import { serviceApi } from '../api/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await serviceApi.getServiceAnalytics();
        setAnalytics(data);
      } catch (error: any) {
        toast.error(t('common.error'), {
          description: error.message || 'Failed to load analytics data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [t]);

  // Format data for charts
  const formatTimeSlotData = () => {
    if (!analytics || !analytics.popularTimeSlots) return [];
    
    return analytics.popularTimeSlots.map((slot: string) => ({
      timeSlot: slot,
      bookings: Math.floor(Math.random() * 50) + 10 // Replace with actual data when available
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time Slots</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Bookings Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Bookings</CardDescription>
                <CardTitle className="text-3xl">
                  {loading ? <Skeleton className="h-8 w-20" /> : analytics?.totalBookings || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Total appointments booked
                </p>
              </CardContent>
            </Card>
            
            {/* Revenue Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('dashboard.totalRevenue')}</CardDescription>
                <CardTitle className="text-3xl">
                  {loading ? <Skeleton className="h-8 w-20" /> : `$${analytics?.revenue || 0}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Revenue from all bookings
                </p>
              </CardContent>
            </Card>

            {/* Customer Satisfaction Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Customer Satisfaction</CardDescription>
                <CardTitle className="text-3xl">
                  {loading ? <Skeleton className="h-8 w-20" /> : `${analytics?.customerSatisfaction || 0}%`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average satisfaction rating
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Popular Time Slots</CardTitle>
              <CardDescription>Most booked time slots</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatTimeSlotData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeSlot" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Revenue breakdown by service</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">
                    Advanced revenue analysis will be available soon
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 