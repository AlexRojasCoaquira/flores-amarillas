"use client";

import React, { useState } from "react";
import { Heart, Sparkles, Feather, ChevronDown, ChevronUp, Edit3 } from "lucide-react";

interface DedicationCardProps {
  recipientName: string;
  senderName: string;
  message: string;
  onEditClick: () => void;
  onFlowerRainClick: () => void;
}

export default function DedicationCard({
  recipientName,
  senderName,
  message,
  onEditClick,
  onFlowerRainClick,
}: DedicationCardProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="transition-all duration-500 ease-out">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="glass-panel-gold px-4 py-2.5 rounded-full flex items-center gap-2 text-amber-200 hover:text-amber-100 shadow-xl border border-amber-400/40 cursor-pointer animate-pulse-glow"
        >
          <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-serif-luxury text-sm">Ver Dedicatoria ✨</span>
          <ChevronUp className="w-4 h-4 text-amber-300" />
        </button>
      ) : (
        <div className="glass-panel-gold rounded-2xl p-5 max-w-md w-full border border-amber-300/40 shadow-2xl relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌻</span>
              <div>
                <h3 className="font-serif-luxury text-amber-200 text-base font-semibold tracking-wide">
                  Flores Amarillas Cósmicas
                </h3>
                <p className="text-[11px] text-amber-300/70 font-light">
                  Un regalo eterno en el infinito del universo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onEditClick}
                className="p-1.5 rounded-full hover:bg-amber-400/20 text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer"
                title="Personalizar Dedicatoria"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-full hover:bg-amber-400/20 text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer"
                title="Minimizar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recipient Title */}
          <div className="mb-2.5">
            <p className="text-[11px] uppercase tracking-widest text-amber-400/70 font-medium">
              Para:
            </p>
            <h2 className="font-romantic text-2xl sm:text-3xl text-amber-300 text-gold-glow leading-none mt-0.5">
              {recipientName || "Mi Persona Favorita"}
            </h2>
          </div>

          {/* Romantic Message Body */}
          <div className="my-3 px-3 py-2.5 rounded-xl bg-black/25 border border-amber-400/15 text-amber-100/90 text-sm leading-relaxed font-normal">
            <p className="italic font-serif-luxury text-[13.5px] leading-relaxed">
              &ldquo;{message}&rdquo;
            </p>
          </div>

          {/* Signature and Interactive Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-amber-400/15">
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80">
              <Feather className="w-3 h-3 text-amber-400" />
              <span className="font-serif-luxury italic">Con amor, {senderName || "Siempre tuyo"}</span>
            </div>

            <button
              onClick={onFlowerRainClick}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-400/40 hover:to-amber-500/40 border border-amber-400/50 text-amber-200 text-xs font-medium flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
              <span>Lluvia Dorada</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
