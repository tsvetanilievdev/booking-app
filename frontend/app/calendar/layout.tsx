'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface CalendarLayoutProps {
  children: ReactNode;
}

export default function CalendarLayout({ children }: CalendarLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 