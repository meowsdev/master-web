'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getChatSocket } from '@/lib/socket';

interface TechnicianJobAlertsProps {
  isTechnician: boolean;
  userId?: string | null;
  /** The app's sound (it already respects the Sound Notifications setting). */
  playSound: (type: 'offer') => void;
}

interface JobNotice {
  referenceCode?: string | null;
  serviceName?: string | null;
}

const describeJob = (job: JobNotice) =>
  `${job.serviceName ?? ''}${job.referenceCode ? ` (#${job.referenceCode})` : ''}`.trim();

/**
 * Makes a job reach a technician's open app at once. The backend sends `jobAssigned` when their provider puts
 * them on an order and `jobUnassigned` when they are taken off it (or replaced). The job list is read again
 * and the technician gets a toast (and, for a new job, the sound). If the socket is down, the list's regular
 * refresh still brings the change in, and everything missed is picked up as soon as the connection is back.
 */
export function useTechnicianJobAlerts({ isTechnician, userId, playSound }: TechnicianJobAlertsProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isTechnician || !userId) return;
    const socket = getChatSocket();
    if (!socket) return;

    // The technician's job list shares the provider list's key (useTechnicianOrders).
    const refreshJobs = () => void queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });

    const handleAssigned = (job: JobNotice) => {
      refreshJobs();
      playSound('offer');
      const label = describeJob(job);
      toast.success(`🔧 নতুন কাজ পেয়েছেন${label ? `: ${label}` : ''}`, { duration: 8000 });
    };
    const handleUnassigned = (job: JobNotice) => {
      refreshJobs();
      const label = describeJob(job);
      toast.info(`এই কাজটি আপনার থেকে সরানো হয়েছে${label ? `: ${label}` : ''}`, { duration: 8000 });
    };

    socket.on('jobAssigned', handleAssigned);
    socket.on('jobUnassigned', handleUnassigned);
    socket.on('connect', refreshJobs);
    return () => {
      socket.off('jobAssigned', handleAssigned);
      socket.off('jobUnassigned', handleUnassigned);
      socket.off('connect', refreshJobs);
    };
  }, [isTechnician, userId, queryClient, playSound]);
}
