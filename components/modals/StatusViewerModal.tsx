'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusStory } from '@/types/super-app.types';

interface StatusViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StatusStory[];
}

export function StatusViewerModal({
  isOpen,
  onClose,
  stories,
}: StatusViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < stories.length - 1) return prev + 1;
        onClose();
        return 0;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [isOpen, stories.length, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm h-[520px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white select-none">
        {/* Progress Bars */}
        <div className="flex gap-1.5 w-full">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < currentIndex ? 'w-full' : idx === currentIndex ? 'w-full animate-pulse' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg shadow-sm">
              {currentStory.avatar}
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">{currentStory.author}</h4>
              <p className="text-[11px] text-white/80">{currentStory.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Center Content */}
        <div className="my-auto text-center space-y-4">
          <h2 className="text-2xl font-black leading-snug tracking-tight px-2">
            {currentStory.title}
          </h2>
          <p className="text-sm text-white/90 leading-relaxed px-4">
            {currentStory.caption}
          </p>
        </div>

        {/* Story Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full cursor-pointer ${
              currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-bold text-white/80">
            {currentIndex + 1} of {stories.length}
          </span>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
