'use client';

import { useState, ReactNode } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Spa as ServicesIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  BarChart as AnalyticsIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../providers';
import { useLanguage } from '../../translations/LanguageContext';

const drawerWidth = 240;

interface MainLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { mode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const muiTheme = useMuiTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const menuItems: MenuItem[] = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.calendar'), icon: <CalendarIcon />, path: '/calendar' },
    { text: t('navigation.clients'), icon: <PeopleIcon />, path: '/clients' },
    { text: t('navigation.services'), icon: <ServicesIcon />, path: '/services' },
    { text: t('navigation.analytics'), icon: <AnalyticsIcon />, path: '/analytics' },
    { text: t('navigation.settings'), icon: <SettingsIcon />, path: '/settings' },
    { text: t('navigation.admin'), icon: <AdminIcon />, path: '/admin' },
  ];
  
  const drawer = (
    <>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: [1]
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {t('common.bookingSystem')}
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item: MenuItem) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.path} style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: pathname === item.path ? 'primary.contrastText' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', md: open ? 'none' : 'block' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === pathname)?.text || 'Booking System'}
          </Typography>
          
          <Box sx={{ display: 'flex' }}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationsOpen}
                aria-controls={Boolean(notificationsAnchorEl) ? 'notifications-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(notificationsAnchorEl) ? 'true' : undefined}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: open ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={isMobile ? open : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            '& .MuiDrawer-paper': {
              position: 'relative',
              whiteSpace: 'nowrap',
              width: drawerWidth,
              boxSizing: 'border-box',
              ...(!open && {
                overflowX: 'hidden',
                width: muiTheme.spacing(7),
                [muiTheme.breakpoints.up('sm')]: {
                  width: muiTheme.spacing(9),
                },
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
      
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} href="/profile" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={Link} href="/settings" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem component={Link} href="/logout" onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">New Appointment</Typography>
            <Typography variant="body2" color="text.secondary">
              John Doe booked a haircut for tomorrow at 2:00 PM
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">Appointment Cancelled</Typography>
            <Typography variant="body2" color="text.secondary">
              Jane Smith cancelled her appointment for today at 4:30 PM
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2">System Update</Typography>
            <Typography variant="body2" color="text.secondary">
              The system will be down for maintenance tonight from 2:00 AM to 4:00 AM
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem component={Link} href="/notifications" onClick={handleNotificationsClose}>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
} 