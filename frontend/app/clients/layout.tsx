'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface ClientsLayoutProps {
  children: ReactNode;
}

export default function ClientsLayout({ children }: ClientsLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 