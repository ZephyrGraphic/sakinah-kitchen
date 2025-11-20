"use client";

import { X, Sparkles, Send, Loader2 } from "lucide-react";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMoodInput: string;
  onInputChange: (value: string) => void;
  aiResponse: string | null;
  isAILoading: boolean;
  onAskAI: () => void;
}

export default function AIModal({
  isOpen,
  onClose,
  aiMoodInput,
  onInputChange,
  aiResponse,
  isAILoading,
  onAskAI,
}: AIModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-red-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-amber-400 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        <div className="bg-amber-400 p-4 flex justify-between items-center">
          <h3 className="font-black text-red-900 flex items-center gap-2 text-lg">
            <Sparkles size={20} className="fill-red-900" /> SAKINAH AI
          </h3>
          <button
            onClick={onClose}
            className="bg-white/20 p-1 rounded hover:bg-white/40 text-red-900"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 mb-4">
            <p className="text-sm text-red-900 font-medium">
              👋 Hai Bestie! Lagi ngerasa apa hari ini?
            </p>
          </div>
          {aiResponse && (
            <div className="bg-white p-4 rounded-2xl border-2 border-red-900 mb-4">
              <p className="text-sm font-bold text-red-950">{aiResponse}</p>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={aiMoodInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Misal: Lagi galau..."
              className="w-full p-3 pr-12 rounded-xl border-2 border-amber-300 outline-none font-bold text-red-900"
              onKeyDown={(e) => e.key === "Enter" && onAskAI()}
            />
            <button
              onClick={onAskAI}
              disabled={isAILoading || !aiMoodInput.trim()}
              className="absolute right-2 top-2 p-2 bg-red-900 text-amber-400 rounded-lg hover:bg-red-800 disabled:opacity-50"
            >
              {isAILoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

