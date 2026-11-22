'use client';

import React from 'react';
import { RailSelection, RailTab } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { isStaffRole } from '@/lib/roles';
import { CustomerNavigationRail } from './CustomerNavigationRail';
import { AdminNavigationRail } from './admin/AdminNavigationRail';
import { TeamButton } from './provider/team/TeamButton';

interface NavigationRailProps {
  /** The selected tab, or ORDERS / ACCOUNT while that right-hand panel is open. */
  activeRailTab: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onStartNewOrder?: () => void;
  user: User | null;
  activeRole: string | null;
  runningCount?: number;
}

/* One rail per kind of person: staff get the workspace rail (tabs by permission); everyone else the slim one. */
export function NavigationRail({ activeRailTab, onSelectTab, onOpenProfile, onOpenAuth, onStartNewOrder, user, activeRole, runningCount = 0 }: NavigationRailProps) {
  if (isStaffRole(activeRole)) {
    return <AdminNavigationRail selection={activeRailTab} onSelectTab={onSelectTab} profilePhoto={user?.profilePhoto} onOpenAccount={onOpenProfile} />;
  }

  // Providers and technicians work from their order list: no orders tab and no new-order button.
  const isWorkerView = activeRole === 'PROVIDER' || activeRole === 'TECHNICIAN';
  return (
    <CustomerNavigationRail
      isAuthenticated={Boolean(user)}
      selection={activeRailTab}
      onSelectTab={onSelectTab}
      onStartNewOrder={isWorkerView ? undefined : onStartNewOrder}
      showOrdersTab={!isWorkerView}
      profilePhoto={user?.profilePhoto}
      onOpenAccount={user ? onOpenProfile : onOpenAuth}
      runningCount={runningCount}
      accountTitle={user ? `${user.name} (${activeRole})` : 'Profile / Login'}
      teamSlot={user && activeRole === 'PROVIDER' ? <TeamButton userId={user.id} variant="rail" /> : undefined}
    />
  );
}
