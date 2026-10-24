'use client';

import { useCallback } from 'react';

/**
 * Web Audio API synthesizer for authentic WhatsApp-style audio feedback
 * Generates synthetic tones for message sending and receiving without external MP3 dependencies
 */
export function useSuperAppAudio(soundEnabled: boolean) {
  const playSound = useCallback((type: 'send' | 'receive') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'send') {
        // High-pitch outgoing pop sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else {
        // Pleasant double-tone incoming chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // Audio playback fails gracefully if context cannot be started
    }
  }, [soundEnabled]);

  return { playSound };
}
