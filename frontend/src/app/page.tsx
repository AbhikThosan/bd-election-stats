"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ElectionsTable } from '@/features/elections/components/ElectionsTable';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ElectionsTable />
    </DashboardLayout>
  );
}