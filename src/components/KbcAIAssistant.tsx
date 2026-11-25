
"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  MessageCircle,
  Minimize2,
} from "lucide-react";

export default function KbcAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">

      {/* AI Assistant Window */}
      {isOpen && (
        <div className="mb-4 w-[340px] overflow-hidden rounded-2xl border border-[#EFE8A8]/30 bg-[#121414] shadow-[0_0_35px_rgba(239,232,168,0.15)] animate-in fade-in slide-in-from-bottom-5 duration-300">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EFE8A8]/20 bg-gradient-to-r from-[#24251e] to-[#121414] p-4">

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#EFE8A8]/10 p-2">
                <Sparkles className="text-[#EFE8A8]" size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-[#EFE8A8]">
                  KBC AI Assistant
                </h3>
                <p className="text-xs text-green-400">
                  ● Online Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 transition hover:text-[#EFE8A8]"
              aria-label="Close assistant"
            >
              <X size={21} />
            </button>
          </div>

          {/* Character */}
          <div className="relative flex h-[290px] items-end justify-center overflow-hidden bg-gradient-to-b from-[#25251e] to-[#121414]">

            <div className="absolute bottom-0 h-40 w-52 rounded-full bg-[#EFE8A8]/10 blur-3xl" />

            <img
              src="/kbc-ai-assistant.png"
              alt="KBC AI Assistant"
              className="relative z-10 h-full w-auto object-contain object-bottom"
            />
          </div>

          {/* Welcome Message */}
          <div className="px-5 pb-5 pt-3">
            <h3 className="text-center text-lg font-semibold text-[#EFE8A8]">
              Hello! Welcome to KBC
            </h3>

            <p className="mt-2 text-center text-sm leading-6 text-[#F5F1E6]/75">
              I'm your virtual assistant. I'm here to help you manage your
              Salon Academy activities.
            </p>

            <div className="mt-4 rounded-xl border border-[#EFE8A8]/20 bg-[#EFE8A8]/5 p-3 text-center">
              <p className="text-xs text-[#EFE8A8]">
                Your intelligent KBC assistant is getting ready!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <span className="text-xs text-gray-500">
              Powered by KBC AI
            </span>

            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#EFE8A8] hover:text-white"
            >
              Minimize <Minimize2 size={13} className="ml-1 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close KBC AI Assistant" : "Open KBC AI Assistant"}
        className="group relative flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[#EFE8A8]/60 bg-[#121414] shadow-[0_0_20px_rgba(239,232,168,0.25)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(239,232,168,0.45)]"
      >
        <span className="absolute inset-0 animate-ping rounded-full border border-[#EFE8A8]/30" />

        <img
          src="/kbc-ai-assistant.png"
          alt="Open KBC AI Assistant"
          className="relative z-10 h-full w-full rounded-full object-cover object-top"
        />

        <span className="absolute -right-1 -top-1 z-20 rounded-full border border-[#121414] bg-[#EFE8A8] p-1">
          {isOpen ? (
            <X size={13} className="text-[#121414]" />
          ) : (
            <MessageCircle size={13} className="text-[#121414]" />
          )}
        </span>
      </button>

    </div>
  );
}
