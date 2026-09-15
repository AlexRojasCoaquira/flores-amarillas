"use client";

import React, { useState, useCallback, useRef } from "react";
import UniverseScene from "./components/UniverseScene";
import AudioPlayer from "./components/AudioPlayer";
import DedicationCard from "./components/DedicationCard";
import CustomizationModal from "./components/CustomizationModal";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Camera,
  Heart,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Info,
} from "lucide-react";

export default function Home() {
  // State for customization
  const [photoUrl, setPhotoUrl] = useState("/default-woman.jpg");
  const [recipientName, setRecipientName] = useState("Para la Mujer Más Hermosa del Universo");
  const [senderName, setSenderName] = useState("Con todo mi corazón");
  const [message, setMessage] = useState(
    "En todo el infinito del cosmos, entre billones de estrellas y galaxias, tu sonrisa es la luz más radiante que existe. Estas flores amarillas son para ti, para que nunca olvides lo infinitamente especial que eres en mi vida. ✨💛"
  );

  // 3D Universe Settings
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [bloomIntensity, setBloomIntensity] = useState(0.7);

  // UI Modes
  const [isCinematicMode, setIsCinematicMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(true);

  // Audio sparkle callback reference
  const sparkleSoundRef = useRef<(() => void) | null>(null);

  const handleRegisterSparkle = useCallback((playSparkle: () => void) => {
    sparkleSoundRef.current = playSparkle;
  }, []);

  // Flower Shower & Confetti Fireworks
  const triggerFlowerShower = useCallback(() => {
    if (sparkleSoundRef.current) {
      sparkleSoundRef.current();
    }

    // Confetti burst from bottom corners and center
    const colors = ["#ffd700", "#ffb703", "#fb8500", "#ffe066", "#fff0a0", "#ff69b4"];

    // Center burst
    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ["circle", "star"],
      scalar: 1.3,
    });

    // Side flower petals
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        scalar: 1.2,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        scalar: 1.2,
      });
    }, 200);
  }, []);

  // Click on central photo in 3D scene
  const handlePhotoClick = useCallback(() => {
    triggerFlowerShower();
  }, [triggerFlowerShower]);

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030108] select-none">
      {/* 1. THREE.JS 3D UNIVERSE BACKGROUND & FLOWERS */}
      <UniverseScene
        photoUrl={photoUrl}
        isAutoRotate={isAutoRotate}
        orbitSpeed={orbitSpeed}
        bloomIntensity={bloomIntensity}
        onPhotoClick={handlePhotoClick}
      />

      {/* 2. CINEMATIC OVERLAY BUTTON (WHEN UI IS HIDDEN) */}
      {isCinematicMode && (
        <div className="absolute top-6 right-6 z-40 animate-fadeIn">
          <button
            onClick={() => setIsCinematicMode(false)}
            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-amber-300 hover:text-amber-100 border border-amber-400/40 text-xs font-medium cursor-pointer shadow-lg hover:shadow-amber-500/30 transition-all backdrop-blur-md"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>Mostrar Interfaz</span>
          </button>
        </div>
      )}

      {/* 3. MAIN UI OVERLAY (HIDDEN IN CINEMATIC MODE) */}
      {!isCinematicMode && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-30 transition-opacity duration-500">
          {/* TOP BAR */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto">
            {/* Title & Brand */}
            <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-amber-400/30">
              <span className="text-2xl animate-float">🌻</span>
              <div>
                <h1 className="font-title-luxury text-base sm:text-lg font-bold text-amber-200 tracking-wider text-gold-glow leading-none">
                  UNIVERSO DE FLORES AMARILLAS
                </h1>
                <p className="text-[10px] text-amber-300/75 tracking-widest uppercase font-light mt-0.5">
                  21 de Septiembre • Amor Infinito
                </p>
              </div>
            </div>

            {/* Quick Actions & Music Deck */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Music Player */}
              <AudioPlayer onSparkleSound={handleRegisterSparkle} />

              {/* Lluvia de Flores */}
              <button
                onClick={triggerFlowerShower}
                className="glass-btn px-3 py-2 rounded-full text-amber-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow"
                title="Lanzar Lluvia Cósmica de Flores"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Lluvia de Flores</span>
              </button>

              {/* Cambiar Foto / Personalizar */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="glass-btn px-3 py-2 rounded-full text-amber-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow"
                title="Personalizar Foto y Dedicatoria"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Cambiar Foto</span>
              </button>

              {/* Modo Cine */}
              <button
                onClick={() => setIsCinematicMode(true)}
                className="glass-btn p-2 rounded-full text-amber-200 cursor-pointer shadow"
                title="Modo Cine (Ocultar Interfaz)"
              >
                <EyeOff className="w-4 h-4 text-amber-300" />
              </button>

              {/* Pantalla Completa */}
              <button
                onClick={toggleFullScreen}
                className="glass-btn p-2 rounded-full text-amber-200 cursor-pointer shadow hidden sm:flex"
                title="Pantalla Completa"
              >
                <Maximize2 className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </header>

          {/* BOTTOM SECTION */}
          <footer className="flex flex-col sm:flex-row items-end sm:items-end justify-between gap-4 pointer-events-auto">
            {/* Dedication Card */}
            <DedicationCard
              recipientName={recipientName}
              senderName={senderName}
              message={message}
              onEditClick={() => setIsModalOpen(true)}
              onFlowerRainClick={triggerFlowerShower}
            />

            {/* Interactive Hints & Cosmos Info */}
            <div className="flex flex-col items-end gap-2">
              {showHelpTooltip && (
                <div className="glass-panel px-3.5 py-2 rounded-xl text-[11px] text-amber-300/80 border border-amber-400/20 max-w-xs text-right shadow-lg flex items-center gap-2">
                  <span>✨ <b>Consejo:</b> Arrastra para girar en 3D, haz zoom o haz clic en la foto central.</span>
                  <button
                    onClick={() => setShowHelpTooltip(false)}
                    className="text-amber-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="glass-btn px-3 py-1.5 rounded-full text-amber-300 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes Cósmicos</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* 4. CUSTOMIZATION MODAL */}
      <CustomizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        photoUrl={photoUrl}
        onPhotoChange={setPhotoUrl}
        recipientName={recipientName}
        onRecipientNameChange={setRecipientName}
        senderName={senderName}
        onSenderNameChange={setSenderName}
        message={message}
        onMessageChange={setMessage}
        orbitSpeed={orbitSpeed}
        onOrbitSpeedChange={setOrbitSpeed}
        isAutoRotate={isAutoRotate}
        onAutoRotateChange={setIsAutoRotate}
        bloomIntensity={bloomIntensity}
        onBloomIntensityChange={setBloomIntensity}
      />
    </main>
  );
}
