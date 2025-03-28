'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/app/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminPanel } from '@/components/admin-panel';

// Icons
import {
  Calendar,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BarChart3,
  Coffee,
  Bell,
  MessageSquare,
  User,
  ShieldAlert,
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const NavItem = ({ icon: Icon, label, href, isActive }: NavItemProps) => (
  <Link href={href} className="w-full">
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start gap-2',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    </motion.div>
  </Link>
);

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const navItems = [
    { icon: LayoutDashboard, label: t('navigation.dashboard'), href: '/dashboard' },
    { icon: Calendar, label: t('navigation.appointments'), href: '/appointments' },
    { icon: Users, label: t('navigation.clients'), href: '/clients' },
    { icon: Coffee, label: t('navigation.services'), href: '/services' },
    { icon: BarChart3, label: t('navigation.analytics'), href: '/analytics' },
    { icon: Settings, label: t('navigation.settings'), href: '/settings' },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Helper to get user initials
  const getInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">Booking System</span>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <Popover>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl} alt={user?.name || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-flex">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5 text-sm">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        {t('navigation.profile')}
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500" 
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('navigation.logout')}</span>
                    </Button>
                  </motion.div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ width: '16rem', opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-16 left-0 z-30 w-64 bg-background border-r md:hidden overflow-hidden"
            >
              <nav className="grid gap-1 p-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavItem
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      isActive={pathname === item.href}
                    />
                  </motion.div>
                ))}
                
                {isAdmin && (
                  <motion.div 
                    className="mt-2 pt-2 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navItems.length * 0.05 + 0.1 }}
                  >
                    <AdminPanel />
                  </motion.div>
                )}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Sidebar for desktop */}
        <motion.aside 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden w-64 shrink-0 border-r md:block"
        >
          <nav className="grid gap-1 p-4">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={pathname === item.href}
                />
              </motion.div>
            ))}
            
            {isAdmin && (
              <motion.div 
                className="mt-2 pt-2 border-t border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05 + 0.1 }}
              >
                <AdminPanel />
              </motion.div>
            )}
          </nav>
        </motion.aside>
        
        {/* Main content */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex-1 overflow-auto p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
} 