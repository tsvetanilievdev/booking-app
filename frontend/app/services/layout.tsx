'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
} 