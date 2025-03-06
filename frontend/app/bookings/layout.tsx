'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface BookingsLayoutProps {
  children: ReactNode;
}

export default function BookingsLayout({ children }: BookingsLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 