'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface NotificationsLayoutProps {
  children: ReactNode;
}

export default function NotificationsLayout({ children }: NotificationsLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 