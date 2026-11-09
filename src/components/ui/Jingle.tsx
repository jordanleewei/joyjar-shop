"use client";

import React, { useEffect, useRef, useState } from "react";

const SRC = "/audio/the-gift-of-glow.mp3";
const EVT = "jj-jingle-toggle";

// Floating "The Gift of Glow" player, shown on every page.
export function JinglePlayer() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = new Audio(SRC);
    a.preload = "none";
    audio.current = a;
    const sync = () => {
      setPlaying(!a.paused);
      window.dispatchEvent(new CustomEvent("jj-jingle-state", { detail: !a.paused }));
    };
    const tick = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const end = () => { a.currentTime = 0; setProgress(0); sync(); };
    a.addEventListener("play", sync); a.addEventListener("pause", sync);
    a.addEventListener("timeupdate", tick); a.addEventListener("ended", end);
    const onToggle = () => toggleAudio(a);
    window.addEventListener(EVT, onToggle);
    return () => { a.pause(); window.removeEventListener(EVT, onToggle); };
  }, []);

  return (
    <button type="button" className={`jingle ${playing ? "is-playing" : ""}`} data-nofish="1"
      onClick={() => audio.current && toggleAudio(audio.current)}
      aria-label={playing ? "Pause the JoyJar song" : "Play the JoyJar song"}>
      <span className="jingle-icon" aria-hidden="true">
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" className="jingle-track" />
          <circle cx="18" cy="18" r="16" className="jingle-prog" style={{ strokeDashoffset: 100.5 * (1 - progress) }} />
        </svg>
        <b>{playing ? "❚❚" : "♪"}</b>
      </span>
      <span className="jingle-text">
        <strong>{playing ? "Now playing" : "Play our song"}</strong>
        <small>The Gift of Glow · 小胶傲之歌</small>
      </span>
      {playing && <span className="jingle-bars" aria-hidden="true"><i /><i /><i /><i /></span>}
    </button>
  );
}

function toggleAudio(a: HTMLAudioElement) {
  if (a.paused) a.play().catch(() => {}); else a.pause();
}

// Inline trigger (e.g. in the hero) that controls the same floating player.
export function JingleInline() {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const on = (e: Event) => setPlaying(!!(e as CustomEvent).detail);
    window.addEventListener("jj-jingle-state", on);
    return () => window.removeEventListener("jj-jingle-state", on);
  }, []);
  return (
    <button type="button" className={`jingle-inline ${playing ? "is-playing" : ""}`} data-nofish="1"
      onClick={() => window.dispatchEvent(new Event(EVT))}>
      <span className="ji-dot" aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
      {playing ? "Pause our song" : "Hear our song"} · <em>The Gift of Glow</em>
    </button>
  );
}
