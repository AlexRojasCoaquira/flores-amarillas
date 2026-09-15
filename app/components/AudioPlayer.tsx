"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles, Upload, Disc } from "lucide-react";

interface AudioPlayerProps {
  onSparkleSound?: (playSparkle: () => void) => void;
}

export default function AudioPlayer({ onSparkleSound }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [activeSongName, setActiveSongName] = useState("Floricienta - Flores Amarillas 🌻");
  const [isSynthMode, setIsSynthMode] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize audio element with Floricienta on mount
  useEffect(() => {
    const audio = new Audio("/floricienta.mp3");
    audio.loop = true;
    audio.volume = volume;
    htmlAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Initialize Web Audio Context for sound effects
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Play a gentle bell / sparkle note
  const playNote = (freq: number, timeOffset = 0, duration = 1.6, velocity = 0.2) => {
    try {
      const ctx = getAudioContext();
      if (!ctx || !gainNodeRef.current) return;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

      const now = ctx.currentTime + timeOffset;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(velocity, now + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(gainNodeRef.current);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Ignored
    }
  };

  // Celestial sparkle chime sound FX
  const playSparkleEffect = () => {
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        playNote(freq, i * 0.06, 1.2, 0.15);
      });
    } catch {
      // Ignored
    }
  };

  // Expose sparkle sound to parent
  useEffect(() => {
    if (onSparkleSound) {
      onSparkleSound(playSparkleEffect);
    }
  }, [onSparkleSound]);

  // Volume control synchronization
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle ambient synth fallback if selected
  useEffect(() => {
    if (isPlaying && isSynthMode) {
      const chordProgressions = [
        [261.63, 329.63, 392.0, 493.88, 587.33, 523.25],
        [220.0, 261.63, 329.63, 392.0, 493.88, 440.0],
        [174.61, 220.0, 261.63, 329.63, 392.0, 349.23],
        [196.0, 246.94, 293.66, 349.23, 440.0, 392.0],
      ];

      let chordIdx = 0;
      let noteIdx = 0;

      const playNextStep = () => {
        const chord = chordProgressions[chordIdx];
        const freq = chord[noteIdx];
        if (noteIdx === 0) playNote(freq * 0.5, 0, 3.0, 0.18);
        playNote(freq, 0, 1.6, 0.14);

        noteIdx++;
        if (noteIdx >= chord.length) {
          noteIdx = 0;
          chordIdx = (chordIdx + 1) % chordProgressions.length;
        }
      };

      playNextStep();
      const interval = setInterval(playNextStep, 480);
      synthTimerRef.current = interval;

      return () => {
        clearInterval(interval);
      };
    } else {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    }
  }, [isPlaying, isSynthMode]);

  const togglePlay = () => {
    getAudioContext();
    if (!isPlaying) {
      if (!isSynthMode && htmlAudioRef.current) {
        htmlAudioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Autoplay blocked, switching to synth fallback:", err);
          setIsSynthMode(true);
          setIsPlaying(true);
        });
      } else {
        setIsPlaying(true);
      }
      playSparkleEffect();
    } else {
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      setIsPlaying(false);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.src = url;
      htmlAudioRef.current.volume = volume;
      htmlAudioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsSynthMode(false);
        setActiveSongName(file.name.replace(/\.[^/.]+$/, ""));
      }).catch(console.error);
    }
  };

  const restoreFloricienta = () => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.src = "/floricienta.mp3";
      htmlAudioRef.current.volume = volume;
      setActiveSongName("Floricienta - Flores Amarillas 🌻");
      setIsSynthMode(false);
      if (isPlaying) {
        htmlAudioRef.current.play().catch(console.error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-full border border-amber-400/40 shadow-xl text-amber-200">
      {/* Play / Pause Principal */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/50 hover:to-amber-600/50 border border-amber-400/60 text-amber-200 transition-all font-medium text-xs tracking-wider cursor-pointer shadow-md group"
        title={isPlaying ? "Pausar Floricienta" : "Reproducir Floricienta - Flores Amarillas"}
      >
        <Music className={`w-3.5 h-3.5 text-amber-300 ${isPlaying ? "animate-spin" : "group-hover:scale-110"}`} />
        <span className="font-semibold">{isPlaying ? "Pausar" : "Floricienta 🌻"}</span>
      </button>

      {/* Track Name Indicator */}
      <span className="hidden lg:inline text-[11px] text-amber-300/80 max-w-[150px] truncate font-serif-luxury italic">
        {isPlaying ? `▶ ${activeSongName}` : activeSongName}
      </span>

      {/* Sparkle sound effect */}
      <button
        onClick={playSparkleEffect}
        className="p-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 text-amber-300 transition-all cursor-pointer"
        title="Destello Mágico (Efecto de sonido)"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>

      {/* Volume slider */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setVolume((v) => (v === 0 ? 0.7 : 0))}
          className="text-amber-300/80 hover:text-amber-200 cursor-pointer"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 accent-amber-400 bg-amber-950 rounded-lg cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Upload Custom Song */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleCustomAudioUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 text-amber-300/80 hover:text-amber-200 transition-all text-xs cursor-pointer flex items-center gap-1"
        title="Subir otra canción MP3"
      >
        <Upload className="w-3.5 h-3.5" />
      </button>

      {/* Reset to Floricienta if custom was loaded */}
      {activeSongName !== "Floricienta - Flores Amarillas 🌻" && (
        <button
          onClick={restoreFloricienta}
          className="p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs cursor-pointer"
          title="Restaurar canción de Floricienta"
        >
          <Disc className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
