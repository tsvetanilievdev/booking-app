'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 