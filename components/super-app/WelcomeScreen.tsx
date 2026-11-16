'use client';

import React from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { GuestWelcome } from './GuestWelcome';
import { PlaceOrderEmptyState } from './PlaceOrderEmptyState';
import { User } from '@/types/auth.types';

interface WelcomeScreenProps {
  isAuthenticated: boolean;
  user: User | null;
  activeRole: string | null;
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  onOpenSettings: () => void;
  onOpenOrders?: () => void;
  onLogout: () => void;
  /** Customers get a clean canvas whose only action is placing an order. */
  onStartNewOrder?: () => void;
  isDarkMode: boolean;
}

const ADMIN_DESCRIPTION =
  'You are active with Administrative privileges for platform governance, audits and monitoring.';

const ROLE_DESCRIPTIONS: Record<string, string> = {
  PROVIDER: 'You are active as a Service Provider. Ready to manage service dispatches and job orders.',
  COUNSELOR: 'You are active as a Dedicated Counselor. Ready to consult incoming customer inquiries.',
  TECHNICIAN: 'You are active as a Field Technician. Ready for assigned repair tasks and customer location routing.',
  ADMIN: ADMIN_DESCRIPTION,
  MANAGER: ADMIN_DESCRIPTION,
  SUPPORT: 'You are active as Support Staff. Ready to resolve customer disputes and service questions.',
};
const CUSTOMER_DESCRIPTION =
  'You are logged in as a Customer and ready to consult counselors and book on-demand services.';

const QUICK_STEPS = [
  { icon: '💬', title: '1. Choose Service', text: 'Pick any service from the left list to open its chat window.' },
  {
    icon: '🛠️',
    title: '2. Direct In-Chat Booking',
    text: 'Click [Book Service] to select Dhaka address and schedule dispatch.',
  },
  {
    icon: '📞',
    title: '3. Live Consultation',
    text: 'Talk directly with technician counselors via audio or video call.',
  },
];

/*
 * Signed-in landing canvas. Uses the same Figma surface as the guest view
 * (#f7f5f3 canvas, white bordered 12px cards, #1daa61 actions); guests get GuestWelcome.
 * Only the look changed: copy, role descriptions and button handlers are as before.
 */
export function WelcomeScreen({
  isAuthenticated,
  user,
  activeRole,
  onOpenAuth,
  onOpenSettings,
  onOpenOrders,
  onLogout,
  onStartNewOrder,
}: WelcomeScreenProps) {
  if (!isAuthenticated) return <GuestWelcome onOpenAuth={onOpenAuth} />;
  const isCustomer = !activeRole || activeRole === 'CUSTOMER';
  if (isCustomer && onStartNewOrder) return <PlaceOrderEmptyState onPlaceOrder={onStartNewOrder} />;

  const roleDescription = (activeRole && ROLE_DESCRIPTIONS[activeRole]) || CUSTOMER_DESCRIPTION;
  const cardClass = 'rounded-[12px] border border-[#e5e5e5] bg-white';

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-auto bg-[#f7f5f3]">
      <div className="m-auto flex w-full max-w-[640px] flex-col items-center gap-[24px] px-[24px] py-[48px] text-center">
        <div className="space-y-[12px]">
          <Image src="/chat-list/brand-logo.svg" alt="" width={64} height={64} className="mx-auto" />
          <h2 className="text-[32px] font-semibold tracking-[-0.64px] text-[#202939]">
            Welcome to <span className="text-[#1daa61]">Super app</span>
          </h2>
          <p className="mx-auto max-w-[480px] text-[16px] font-medium leading-relaxed text-[#697586]">
            Your instant technician messaging and on-demand home service platform. Select any service from the left list to start live chatting with verified counselors.
          </p>
        </div>

        <div className={`${cardClass} w-full space-y-[16px] p-[24px]`}>
          <div className="flex items-center justify-center gap-[12px]">
            <div className="flex size-[48px] items-center justify-center rounded-full bg-[#1daa61] text-[18px] font-bold text-white">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left">
              <h4 className="text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">{user?.name}</h4>
              <p className="text-[14px] font-medium text-[#697586]">{user?.mobileNumber}</p>
              <span className="mt-[2px] inline-block rounded-[6px] border border-[#bccdba] bg-[#d7fdd2] px-[8px] py-[2px] text-[10px] font-bold uppercase text-[#205737]">
                Role: {activeRole || 'CUSTOMER'}
              </span>
            </div>
          </div>

          <p className="text-[14px] font-medium text-[#697586]">{roleDescription}</p>

          <div className="flex flex-wrap items-center justify-center gap-[12px] pt-[4px]">
            <button
              onClick={onOpenOrders}
              className="flex cursor-pointer items-center gap-[6px] rounded-[12px] bg-[#1daa61] px-[16px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452]"
            >
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="cursor-pointer rounded-[12px] border border-[#1daa61] bg-white px-[16px] py-[8px] text-[14px] font-semibold text-[#1daa61] transition-colors hover:bg-[#f0fbf4]"
            >
              Switch Role / Settings
            </button>
            <button
              onClick={onLogout}
              className="cursor-pointer rounded-[12px] border border-[#f1c8c8] bg-[#fff3f3] px-[16px] py-[8px] text-[14px] font-semibold text-[#d64545] transition-colors hover:bg-[#ffe6e6]"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-[12px] text-left md:grid-cols-3">
          {QUICK_STEPS.map((step) => (
            <div key={step.title} className={`${cardClass} p-[16px]`}>
              <div className="mb-[6px] text-[20px]">{step.icon}</div>
              <h4 className="text-[14px] font-semibold tracking-[-0.28px] text-[#202939]">{step.title}</h4>
              <p className="mt-[4px] text-[12px] font-medium text-[#697586]">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
