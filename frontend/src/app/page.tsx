"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ElectionsTable } from '@/features/elections/components/ElectionsTable';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <ElectionsTable />
      </DashboardLayout>
    </AuthGuard>
  );
}