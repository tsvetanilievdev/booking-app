'use client';

import { ReactNode } from 'react';

interface ResetPasswordLayoutProps {
  children: ReactNode;
}

export default function ResetPasswordLayout({ children }: ResetPasswordLayoutProps) {
  // Reset password page should be publicly accessible
  return children;
} 