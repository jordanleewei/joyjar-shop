"use client";

import React, { useEffect, useRef, useState } from "react";
import { FishMawPet } from "./MemberCard";

const LINES = ["Duang duang! 💛", "Feed me please! 🍚", "啵!", "I'm full of collagen ✨", "Glow up time!", "More snacks?", "Hehe, that tickles!", "You're my favourite human 💕"];

type Food = { id: number; x: number; y: number };

// A little pond: the pet wanders, follows your pointer, swims to food you drop, and reacts when tapped.
export function PetPond({ colour, accessory, name, height = 340 }: { colour: string; accessory: string; name: string; height?: number }) {
  const pond = useRef<HTMLDivElement>(null);
  const petEl = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 120, y: 120, vx: 0, vy: 0, face: 1 });
  const target = useRef<{ x: number; y: number } | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const foods = useRef<Food[]>([]);
  const [foodList, setFoodList] = useState<Food[]>([]);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [fed, setFed] = useState(0);
  const [happy, setHappy] = useState(false);
  const idRef = useRef(1);
  const bubbleTimer = useRef<number>(0);
  const PET = 120; // rendered pet width

  const say = (t: string) => {
    setBubble(t);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 1800);
  };
  const heart = (x: number, y: number) => {
    const id = idRef.current++;
    setHearts((h) => [...h, { id, x, y }]);
    window.setTimeout(() => setHearts((h) => h.filter((k) => k.id !== id)), 1100);
  };

  useEffect(() => {
    const el = pond.current; if (!el) return;
    const r = el.getBoundingClientRect();
    pos.current.x = r.width / 2 - PET / 2; pos.current.y = r.height / 2 - PET * 0.41;
    let raf = 0, last = performance.now(), wanderAt = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const b = el.getBoundingClientRect();
      const W = b.width - PET, H = b.height - PET * 0.82;
      const p = pos.current;

      // what to swim towards: food > pointer > wander spot
      let goal: { x: number; y: number } | null = null, speed = 55;
      if (foods.current.length) {
        const f = foods.current.reduce((a, c) => (Math.hypot(c.x - p.x, c.y - p.y) < Math.hypot(a.x - p.x, a.y - p.y) ? c : a));
        goal = { x: f.x - PET / 2, y: f.y - PET * 0.41 }; speed = 140;
        if (Math.hypot(goal.x - p.x, goal.y - p.y) < 16) {
          foods.current = foods.current.filter((k) => k.id !== f.id);
          setFoodList([...foods.current]);
          setFed((n) => n + 1);
          heart(p.x + PET / 2, p.y);
          say(["Yum! 😋", "Nom nom!", "So tasty!", "More please!"][Math.floor(Math.random() * 4)]);
        }
      } else if (pointer.current) {
        goal = { x: pointer.current.x - PET / 2, y: pointer.current.y - PET * 0.41 }; speed = 80;
      } else {
        if (!target.current || now > wanderAt || Math.hypot(target.current.x - p.x, target.current.y - p.y) < 10) {
          target.current = { x: Math.random() * W, y: Math.random() * H };
          wanderAt = now + 2500 + Math.random() * 2500;
        }
        goal = target.current;
      }

      if (goal && !reduce) {
        const dx = goal.x - p.x, dy = goal.y - p.y, d = Math.hypot(dx, dy) || 1;
        const want = Math.min(speed, d * 2.2);
        p.vx += ((dx / d) * want - p.vx) * Math.min(1, dt * 2.5);
        p.vy += ((dy / d) * want - p.vy) * Math.min(1, dt * 2.5);
      }
      p.x = Math.max(0, Math.min(W, p.x + p.vx * dt));
      p.y = Math.max(0, Math.min(H, p.y + p.vy * dt));
      if (Math.abs(p.vx) > 6) p.face = p.vx > 0 ? -1 : 1; // the pet art faces left
      const tilt = Math.max(-14, Math.min(14, p.vy * 0.15)) * (p.face === 1 ? 1 : -1);
      if (petEl.current) petEl.current.style.transform = `translate(${p.x}px, ${p.y}px) scaleX(${p.face}) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const local = (e: React.PointerEvent | React.MouseEvent) => {
    const r = pond.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const dropFood = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".pond-pet")) return;
    const { x, y } = local(e);
    const f = { id: idRef.current++, x, y };
    foods.current = [...foods.current, f].slice(-5);
    setFoodList([...foods.current]);
  };

  const tapPet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHappy(true); window.setTimeout(() => setHappy(false), 650);
    const p = pos.current;
    heart(p.x + PET / 2, p.y);
    say(LINES[Math.floor(Math.random() * LINES.length)].replace("human", name ? "human" : "human"));
  };

  return (
    <div className="pond" ref={pond} style={{ height }} onClick={dropFood}
      onPointerMove={(e) => { if (e.pointerType === "mouse") pointer.current = local(e); }}
      onPointerLeave={() => { pointer.current = null; }}
      role="application" aria-label={`Play with ${name}: tap the water to drop food, tap ${name} to say hi`}>
      <div className="pond-ripples" aria-hidden="true"><i /><i /><i /></div>
      {foodList.map((f) => <span key={f.id} className="pond-food" style={{ left: f.x, top: f.y }} />)}
      <div className="pond-pet" ref={petEl} onClick={tapPet} style={{ width: PET }}>
        <div className={happy ? "pond-happy" : ""}><FishMawPet colour={colour} accessory={accessory} size={PET} /></div>
      </div>
      {bubble && <span className="pond-bubble" style={{ left: pos.current.x + PET / 2, top: Math.max(8, pos.current.y - 28) }}>{bubble}</span>}
      {hearts.map((h) => <span key={h.id} className="pond-heart" style={{ left: h.x, top: h.y }}>💛</span>)}
      <div className="pond-hud">
        <span className="pond-name">{name}</span>
        <span className="pond-tip">Tap the water to feed · tap {name} to say hi{fed ? ` · fed ${fed}×` : ""}</span>
      </div>
    </div>
  );
}
