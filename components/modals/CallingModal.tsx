'use client';

import React, { useState, useEffect } from 'react';
import { Video, Mic, MicOff, PhoneMissed } from 'lucide-react';
import { Service } from '@/types/service.types';

interface CallingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  callType: 'voice' | 'video';
  isDarkMode?: boolean;
}

export function CallingModal({
  isOpen,
  onClose,
  service,
  callType,
  isDarkMode = true,
}: CallingModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleEndCall = () => {
    setCallDuration(0);
    onClose();
  };

  if (!isOpen || !service) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 border text-white text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 ${
          isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#202c33] border-[#2f3b43]'
        }`}
      >
        {/* Caller Avatar */}
        <div className="relative mx-auto w-24 h-24">
          <div className="w-24 h-24 rounded-full bg-[#202c33] border-4 border-[#25D366] flex items-center justify-center text-4xl shadow-xl">
            {service.category?.iconUrl || '🛠️'}
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-[#111b21] animate-pulse" />
        </div>

        {/* Caller Info */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{service.name} Counselor</h3>
          <p className="text-xs text-[#25D366] font-medium uppercase tracking-wider">
            {callType === 'video' ? 'Super app Video Call' : 'WhatsApp Voice Call'}
          </p>
          <p className="text-sm text-[#8696a0] font-mono pt-1">
            {formatDuration(callDuration)}
          </p>
        </div>

        {/* Video Canvas Simulation */}
        {callType === 'video' && (
          <div className="w-full h-36 rounded-2xl bg-[#202c33] border border-[#2f3b43] flex flex-col items-center justify-center text-xs text-[#8696a0] space-y-2 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Video className="w-6 h-6 animate-pulse" />
            </div>
            <span>Encrypted Video Stream Connected</span>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-md text-[10px] text-white">
              720p HD
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer transition-all"
            title="End Call"
          >
            <PhoneMissed className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
