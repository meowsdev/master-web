'use client';

import React, { useState } from 'react';
import {
  MoreVertical,
  Sparkles,
  Settings,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
} from 'lucide-react';

interface SidebarHeaderProps {
  isDarkMode: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectWelcome: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userName?: string | null;
  onLogout: () => void;
}

export function SidebarHeader({
  isDarkMode,
  soundEnabled,
  onToggleSound,
  onSelectWelcome,
  onOpenSettings,
  onOpenAuth,
  isAuthenticated,
  userName,
  onLogout,
}: SidebarHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]';
  const headerIconBtn = isDarkMode
    ? 'text-[#aebac1] hover:text-white hover:bg-white/10'
    : 'text-[#54656f] hover:text-[#111b21] hover:bg-black/5';

  return (
    <div className={`h-[60px] px-4 flex items-center justify-between border-b shrink-0 z-10 ${bgHeader}`}>
      {/* Super app Brand Heading */}
      <div className="flex items-center gap-2.5">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111b21] dark:text-[#e9edef]">
          Super app
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
            title="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div
              className={`absolute right-0 top-11 w-52 rounded-xl shadow-2xl py-2 border z-50 text-sm ${
                isDarkMode ? 'bg-[#233138] border-[#2f3b43] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
              }`}
            >
              <button
                onClick={() => {
                  onSelectWelcome();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Sparkles className="w-4 h-4 text-[#25D366]" />
                <span>Welcome Screen</span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Settings & Switch Role</span>
              </button>

              <button
                onClick={() => {
                  onToggleSound();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#25D366]" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}</span>
              </button>

              <div className={`my-1 border-t ${isDarkMode ? 'border-[#2f3b43]' : 'border-[#e9edef]'}`} />

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out ({userName || 'User'})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#e7fce3] dark:hover:bg-[#005c4b]/30 text-[#075E54] dark:text-[#25D366] font-bold flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
