'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Tabs,
  Tab,
  Badge,
  Button,
  CircularProgress,
  Chip,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'client' | 'system';
  isRead: boolean;
  createdAt: string;
  action?: {
    text: string;
    url: string;
  };
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchNotifications = async () => {
      try {
        // In a real app, we would fetch from API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Appointment Booked',
            message: 'John Doe has booked a haircut appointment for tomorrow at 2:00 PM.',
            type: 'appointment',
            isRead: false,
            createdAt: '2024-03-04T08:30:00',
            action: {
              text: 'View Appointment',
              url: '/calendar'
            }
          },
          {
            id: '2',
            title: 'Appointment Cancelled',
            message: 'Emma Wilson has cancelled her spa treatment appointment scheduled for Friday.',
            type: 'appointment',
            isRead: true,
            createdAt: '2024-03-03T15:45:00',
            action: {
              text: 'View Calendar',
              url: '/calendar'
            }
          },
          {
            id: '3',
            title: 'New Client Registration',
            message: 'Sarah Johnson has registered as a new client. Complete her profile with additional details.',
            type: 'client',
            isRead: false,
            createdAt: '2024-03-03T11:20:00',
            action: {
              text: 'View Client',
              url: '/clients'
            }
          },
          {
            id: '4',
            title: 'Payment Received',
            message: 'Payment of $75.00 has been received for invoice #1234.',
            type: 'system',
            isRead: true,
            createdAt: '2024-03-02T09:15:00'
          },
          {
            id: '5',
            title: 'System Maintenance',
            message: 'The system will undergo maintenance on Sunday, March 10 from 2:00 AM to 4:00 AM. Some features may be unavailable during this time.',
            type: 'system',
            isRead: false,
            createdAt: '2024-03-01T12:00:00'
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    handleMenuClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    handleMenuClose();
  };

  const getFilteredNotifications = () => {
    if (tabValue === 0) return notifications;
    if (tabValue === 1) return notifications.filter(n => n.type === 'appointment');
    if (tabValue === 2) return notifications.filter(n => n.type === 'client');
    if (tabValue === 3) return notifications.filter(n => n.type === 'system');
    return [];
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon />;
      case 'client':
        return <PersonIcon />;
      case 'system':
        return <EventIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffInHours < 48) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh' 
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Notifications
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                sx={{ ml: 2 }}
              >
                <NotificationsIcon />
              </Badge>
            )}
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="notification tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  All
                  {unreadCount > 0 && (
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab 
              label="Appointments"
              icon={<CalendarIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab 
              label="Clients"
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"  
            />
            <Tab 
              label="System"
              icon={<EventIcon fontSize="small" />}
              iconPosition="start"  
            />
          </Tabs>
          
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {getFilteredNotifications().length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  You don't have any notifications in this category
                </Typography>
              </Box>
            ) : (
              getFilteredNotifications().map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                    }}
                    secondaryAction={
                      <Tooltip title="Options">
                        <IconButton 
                          edge="end" 
                          aria-label="more options"
                          onClick={(e) => handleMenuOpen(e, notification.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.isRead ? 'action.disabledBackground' : 'primary.main' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle1"
                            component="span"
                            sx={{ 
                              fontWeight: notification.isRead ? 'normal' : 'bold',
                              mr: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Chip 
                              label="New" 
                              size="small" 
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDateTime(notification.createdAt)}
                            </Typography>
                            {notification.action && (
                              <Button 
                                variant="text" 
                                size="small" 
                                href={notification.action.url}
                                sx={{ ml: 2 }}
                              >
                                {notification.action.text}
                              </Button>
                            )}
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  {index < getFilteredNotifications().length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))
            )}
          </List>
        </Paper>
      </Box>
      
      <Menu
        id="notification-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !notifications.find(n => n.id === selectedNotification)?.isRead && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification)}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            Mark as read
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedNotification && handleDeleteNotification(selectedNotification)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </MainLayout>
  );
} 