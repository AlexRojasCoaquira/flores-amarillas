"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Sparkles, Upload } from "lucide-react";

interface AudioPlayerProps {
  onSparkleSound?: (playSparkle: () => void) => void;
}

export default function AudioPlayer({ onSparkleSound }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [isSynthMode, setIsSynthMode] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize Web Audio Context
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

  // Play a gentle bell / harp note
  const playNote = (freq: number, timeOffset = 0, duration = 1.8, velocity = 0.25) => {
    try {
      const ctx = getAudioContext();
      if (!ctx || !gainNodeRef.current) return;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Warm sine / triangle blend
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

      // Gentle envelope: fast attack, slow bell decay
      const now = ctx.currentTime + timeOffset;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(velocity, now + 0.04);
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
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      notes.forEach((freq, i) => {
        playNote(freq, i * 0.07, 1.2, 0.2);
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

  // Romantic celestial melody loop
  useEffect(() => {
    if (isPlaying && isSynthMode) {
      // Romantic Arpeggio Sequence (Cmaj9, Am9, Fmaj7, G9, Em7, A9)
      const chordProgressions = [
        // Cmaj9 (C, E, G, B, D)
        [261.63, 329.63, 392.0, 493.88, 587.33, 523.25],
        // Am9 (A, C, E, G, B)
        [220.0, 261.63, 329.63, 392.0, 493.88, 440.0],
        // Fmaj7 (F, A, C, E, G)
        [174.61, 220.0, 261.63, 329.63, 392.0, 349.23],
        // G9 (G, B, D, F, A)
        [196.0, 246.94, 293.66, 349.23, 440.0, 392.0],
        // Em7 (E, G, B, D, F#)
        [164.81, 196.0, 246.94, 293.66, 369.99, 329.63],
        // Cmaj7 High
        [261.63, 329.63, 392.0, 523.25, 659.25, 587.33],
      ];

      let chordIdx = 0;
      let noteIdx = 0;

      const playNextStep = () => {
        const chord = chordProgressions[chordIdx];
        const freq = chord[noteIdx];

        // Play root note with extra duration on start of bar
        if (noteIdx === 0) {
          playNote(freq * 0.5, 0, 3.2, 0.22);
        }

        playNote(freq, 0, 1.8, 0.16);

        noteIdx++;
        if (noteIdx >= chord.length) {
          noteIdx = 0;
          chordIdx = (chordIdx + 1) % chordProgressions.length;
        }
      };

      playNextStep();
      const interval = setInterval(playNextStep, 460);
      synthTimerRef.current = interval;

      return () => {
        clearInterval(interval);
      };
    } else {
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    }
  }, [isPlaying, isSynthMode]);

  // Volume control
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    getAudioContext();
    if (!isPlaying) {
      if (!isSynthMode && htmlAudioRef.current) {
        htmlAudioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
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
    if (!htmlAudioRef.current) {
      htmlAudioRef.current = new Audio();
      htmlAudioRef.current.loop = true;
    }
    htmlAudioRef.current.src = url;
    htmlAudioRef.current.volume = volume;
    htmlAudioRef.current.play().then(() => {
      setIsPlaying(true);
      setIsSynthMode(false);
      setCustomAudioName(file.name.slice(0, 20) + (file.name.length > 20 ? "..." : ""));
    }).catch(console.error);
  };

  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-amber-400/30 shadow-lg text-amber-200">
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 transition-all font-medium text-xs tracking-wider cursor-pointer"
        title={isPlaying ? "Pausar Melodía" : "Reproducir Melodía"}
      >
        <Music className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin text-amber-300" : ""}`} />
        <span>{isPlaying ? "Música Activa" : "Melodía Mágica"}</span>
      </button>

      {/* Sparkle sound test */}
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
          onClick={() => setVolume((v) => (v === 0 ? 0.5 : 0))}
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
          className="w-16 h-1 accent-amber-400 bg-amber-950 rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Upload Custom MP3 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleCustomAudioUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-full bg-white/5 hover:bg-amber-400/20 text-amber-300/90 transition-all text-xs cursor-pointer flex items-center gap-1"
        title="Subir tu propia canción (MP3)"
      >
        <Upload className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">
          {customAudioName ? customAudioName : "Subir MP3"}
        </span>
      </button>
    </div>
  );
}
