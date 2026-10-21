'use client';

import React, { useState } from 'react';
import {
  Paperclip,
  Smile,
  Mic,
  Send,
  Wrench,
  MapPin,
} from 'lucide-react';

interface ChatComposerProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onSendVoiceNote: () => void;
  onOpenBooking: () => void;
  isDarkMode: boolean;
}

export function ChatComposer({
  inputText,
  onInputChange,
  onSendMessage,
  onSendVoiceNote,
  onOpenBooking,
  isDarkMode,
}: ChatComposerProps) {
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const bgComposer = isDarkMode ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div className={`h-[62px] border-t px-3 md:px-4 flex items-center gap-2 shrink-0 relative ${bgComposer}`}>
      {/* Attachment Clip Button */}
      <div className="relative">
        <button
          onClick={() => {
            setIsAttachmentOpen(!isAttachmentOpen);
            setIsEmojiPickerOpen(false);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
          title="Attach"
        >
          <Paperclip className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
        </button>

        {isAttachmentOpen && (
          <div
            className={`absolute left-0 bottom-14 w-56 rounded-2xl shadow-2xl p-2 border z-50 space-y-1 ${
              isDarkMode ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
            }`}
          >
            <button
              onClick={() => {
                onOpenBooking();
                setIsAttachmentOpen(false);
              }}
              className="w-full px-3 py-2 hover:bg-[#e7fce3] dark:hover:bg-[#005c4b]/30 rounded-xl flex items-center gap-3 text-[#075E54] dark:text-[#25D366] text-sm font-bold cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-[#25D366]" />
              </div>
              <span>Book Service</span>
            </button>

            <button
              onClick={() => {
                onInputChange('📍 Current Location: Dhanmondi 27, Dhaka');
                setIsAttachmentOpen(false);
              }}
              className="w-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 text-sm cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <span>Send Location</span>
            </button>
          </div>
        )}
      </div>

      {/* Emoji Picker Button */}
      <div className="relative">
        <button
          onClick={() => {
            setIsEmojiPickerOpen(!isEmojiPickerOpen);
            setIsAttachmentOpen(false);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
          title="Emoji"
        >
          <Smile className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
        </button>

        {isEmojiPickerOpen && (
          <div
            className={`absolute left-0 bottom-14 rounded-2xl shadow-xl p-3 border z-50 flex gap-2 text-2xl ${
              isDarkMode ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
            }`}
          >
            {['👍', '❤️', '😂', '🔥', '🙏', '⚡', '🛠️', '❄️'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onInputChange(inputText + emoji);
                  setIsEmojiPickerOpen(false);
                }}
                className="hover:scale-125 transition-transform cursor-pointer p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSendMessage();
        }}
        placeholder="Type a message"
        className={`rounded-[8px] px-4 py-2 text-[14.5px] outline-none flex-1 border-none shadow-none ${
          isDarkMode
            ? 'bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0]'
            : 'bg-white text-[#111b21] placeholder:text-[#8696a0]'
        }`}
      />

      {/* Send or Voice Record Button */}
      {inputText.trim() ? (
        <button
          onClick={onSendMessage}
          className="w-9 h-9 rounded-full bg-[#008069] hover:bg-[#075E54] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onSendVoiceNote}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0`}
          title="Record voice note"
        >
          <Mic className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
        </button>
      )}
    </div>
  );
}
