"use client";

import React, { useEffect, useRef, useState } from "react";

const SRC = "/audio/the-gift-of-glow.mp3";

// "Hear our song" button (homepage hero). Owns its own audio; no floating player.
export function JingleInline() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = new Audio(SRC);
    a.preload = "none";
    audio.current = a;
    const sync = () => setPlaying(!a.paused);
    const end = () => { a.currentTime = 0; sync(); };
    a.addEventListener("play", sync); a.addEventListener("pause", sync); a.addEventListener("ended", end);
    return () => { a.pause(); a.removeEventListener("play", sync); a.removeEventListener("pause", sync); a.removeEventListener("ended", end); };
  }, []);

  const toggle = () => {
    const a = audio.current; if (!a) return;
    if (a.paused) a.play().catch(() => {}); else a.pause();
  };

  return (
    <button type="button" className={`jingle-inline ${playing ? "is-playing" : ""}`} data-nofish="1" onClick={toggle}>
      <span className="ji-dot" aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
      {playing ? "Pause our song" : "Hear our song"} · <em>The Gift of Glow</em>
      {playing && <span className="jingle-bars" aria-hidden="true"><i /><i /><i /><i /></span>}
    </button>
  );
}
