"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Sparkles, Sliders, RefreshCw, Check } from "lucide-react";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  onPhotoChange: (newUrl: string) => void;
  recipientName: string;
  onRecipientNameChange: (val: string) => void;
  senderName: string;
  onSenderNameChange: (val: string) => void;
  message: string;
  onMessageChange: (val: string) => void;
  orbitSpeed: number;
  onOrbitSpeedChange: (val: number) => void;
  isAutoRotate: boolean;
  onAutoRotateChange: (val: boolean) => void;
  bloomIntensity: number;
  onBloomIntensityChange: (val: number) => void;
}

const POEM_PRESETS = [
  {
    title: "Flores en el Cosmos",
    text: "En todo el infinito del universo, no existe estrella ni flor tan radiante como tú. Estas flores amarillas son para iluminar cada uno de tus días y recordarte lo especial que eres.",
  },
  {
    title: "Mi Sol Eterno",
    text: "Así como el girasol busca incansablemente el calor del sol, mi corazón siempre encuentra su paz y alegría en tu sonrisa. Eres mi estrella más brillante.",
  },
  {
    title: "Promesa de Flores Amarillas",
    text: "Te regalo estas flores amarillas cósmicas que nunca se marchitarán, como símbolo de admiración, cariño incondicional y ternura eterna.",
  },
  {
    title: "Universo para Ti",
    text: "Si pudiera bajarte las estrellas, crearía un campo dorado en el cielo solo para verte sonreír. Gracias por hacer mi mundo un lugar mágico.",
  },
];

export default function CustomizationModal({
  isOpen,
  onClose,
  photoUrl,
  onPhotoChange,
  recipientName,
  onRecipientNameChange,
  senderName,
  onSenderNameChange,
  message,
  onMessageChange,
  orbitSpeed,
  onOrbitSpeedChange,
  isAutoRotate,
  onAutoRotateChange,
  bloomIntensity,
  onBloomIntensityChange,
}: CustomizationModalProps) {
  const [activeTab, setActiveTab] = useState<"photo" | "message" | "universe">("photo");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onPhotoChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onPhotoChange(urlInput.trim());
      setUrlInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-gold max-w-lg w-full rounded-3xl p-6 border border-amber-400/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-400/20">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-amber-200">
                Personalizar Experiencia
              </h2>
              <p className="text-xs text-amber-300/70">
                Ajusta la foto central, dedicatoria y cosmos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-400/20 text-amber-300/80 hover:text-amber-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 my-4 p-1 bg-black/40 rounded-xl border border-amber-400/20">
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "photo"
                ? "bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow"
                : "text-amber-300/60 hover:text-amber-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto Central</span>
          </button>
          <button
            onClick={() => setActiveTab("message")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "message"
                ? "bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow"
                : "text-amber-300/60 hover:text-amber-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicatoria</span>
          </button>
          <button
            onClick={() => setActiveTab("universe")}
            className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "universe"
                ? "bg-amber-500/30 text-amber-200 border border-amber-400/40 shadow"
                : "text-amber-300/60 hover:text-amber-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Universo 3D</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-amber-100">
          {/* TAB 1: FOTO CENTRAL */}
          {activeTab === "photo" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-black/30 border border-amber-400/20">
                {/* Photo Preview in Celestial Frame */}
                <div className="relative w-28 h-28 shrink-0 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Foto central"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="font-serif-luxury text-amber-200 text-sm font-semibold">
                    Fotografía en el Centro del Cosmos
                  </h4>
                  <p className="text-xs text-amber-300/70">
                    Sube la foto de esa persona especial para que sea el centro del universo 3D.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/60 text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Foto</span>
                    </button>

                    <button
                      onClick={() => onPhotoChange("/default-woman.jpg")}
                      className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-amber-300/80 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* URL input */}
              <form onSubmit={handleUrlSubmit} className="space-y-1.5">
                <label className="text-xs text-amber-300/80 font-medium">
                  O pegar enlace de imagen web:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-amber-400/30 text-amber-100 placeholder:text-amber-400/30 text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/50 text-amber-200 text-xs font-medium cursor-pointer"
                  >
                    Cargar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: DEDICATORIA */}
          {activeTab === "message" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-amber-300/80 font-medium block mb-1">
                    Para (Nombre de la persona):
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => onRecipientNameChange(e.target.value)}
                    placeholder="Ej: Mi Amor, Andrea, Mamá..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-amber-400/30 text-amber-100 placeholder:text-amber-400/30 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-amber-300/80 font-medium block mb-1">
                    De parte de (Tu firma):
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => onSenderNameChange(e.target.value)}
                    placeholder="Ej: Alex, Siempre tuyo..."
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-amber-400/30 text-amber-100 placeholder:text-amber-400/30 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-amber-300/80 font-medium block mb-1">
                  Mensaje / Carta de amor:
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => onMessageChange(e.target.value)}
                  placeholder="Escribe aquí tus sentimientos..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-amber-400/30 text-amber-100 placeholder:text-amber-400/30 text-xs focus:outline-none focus:border-amber-400 resize-none font-serif-luxury"
                />
              </div>

              {/* Romantic Presets */}
              <div>
                <label className="text-xs text-amber-300/80 font-medium block mb-1.5">
                  Plantillas y Poemas recomendados:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POEM_PRESETS.map((poem, idx) => (
                    <button
                      key={idx}
                      onClick={() => onMessageChange(poem.text)}
                      className="p-2.5 rounded-xl bg-black/30 hover:bg-amber-500/20 border border-amber-400/20 hover:border-amber-400/50 text-left transition-all cursor-pointer group"
                    >
                      <p className="text-xs font-semibold text-amber-200 group-hover:text-amber-100">
                        {poem.title}
                      </p>
                      <p className="text-[11px] text-amber-300/60 line-clamp-2 mt-0.5 font-serif-luxury italic">
                        {poem.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UNIVERSO 3D */}
          {activeTab === "universe" && (
            <div className="space-y-4">
              {/* Auto Rotate */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-amber-400/20">
                <div>
                  <p className="text-xs font-semibold text-amber-200">
                    Rotación Orbital Automática
                  </p>
                  <p className="text-[11px] text-amber-300/60">
                    Gira suavemente el cosmos alrededor de la foto
                  </p>
                </div>
                <button
                  onClick={() => onAutoRotateChange(!isAutoRotate)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                    isAutoRotate ? "bg-amber-500 justify-end" : "bg-neutral-800 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Orbit Speed */}
              <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-amber-400/20">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-200">Velocidad de Órbita</span>
                  <span className="text-amber-400 font-mono">{orbitSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={orbitSpeed}
                  onChange={(e) => onOrbitSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-400 bg-amber-950/80 rounded-lg cursor-pointer"
                />
              </div>

              {/* Bloom / Glow Intensity */}
              <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-amber-400/20">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-200">Brillo de Aura Dorada</span>
                  <span className="text-amber-400 font-mono">{bloomIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={bloomIntensity}
                  onChange={(e) => onBloomIntensityChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-amber-400 bg-amber-950/80 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-amber-400/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar & Explorar Universo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
