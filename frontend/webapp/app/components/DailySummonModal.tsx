"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CharacterDefinition, characterCatalog } from "../data/characterCatalog";
import goldIcon from "@/public/gold2.png";
import AnimatedHeroSprite from "./AnimatedHeroSprite";
import { OwnedHero } from "@/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hero: OwnedHero | null;
  goldAwarded: number;
  rarity: string;
};

const rarityColors: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  Common: {
    bg: "from-slate-500/30 to-slate-600/20",
    border: "border-slate-400/60",
    glow: "",
    text: "text-slate-300",
  },
  Rare: {
    bg: "from-blue-500/40 to-cyan-500/25",
    border: "border-blue-400/70",
    glow: "shadow-[0_0_60px_rgba(59,130,246,0.5)]",
    text: "text-blue-300",
  },
  Epic: {
    bg: "from-purple-500/45 to-pink-500/30",
    border: "border-purple-400/70",
    glow: "shadow-[0_0_80px_rgba(168,85,247,0.6)]",
    text: "text-purple-300",
  },
  Legendary: {
    bg: "from-amber-400/50 to-orange-500/35",
    border: "border-amber-400/80",
    glow: "shadow-[0_0_100px_rgba(251,191,36,0.7)]",
    text: "text-amber-300",
  },
};

const deriveBasePath = (cardImage: string) => {
  const match = cardImage.match(/(.*)\/card\/frame_\d+\.png$/);
  return match ? match[1] : "";
};

export default function DailySummonModal({ isOpen, onClose, hero, goldAwarded, rarity }: Props) {
  const [phase, setPhase] = useState<"opening" | "reveal" | "shown">("opening");

  useEffect(() => {
    if (isOpen && hero) {
      setPhase("opening");
      // Opening animation duration
      const openTimer = setTimeout(() => setPhase("reveal"), 1500);
      // Reveal to shown transition
      const revealTimer = setTimeout(() => setPhase("shown"), 2500);
      return () => {
        clearTimeout(openTimer);
        clearTimeout(revealTimer);
      };
    }
  }, [isOpen, hero]);

  if (!isOpen || !hero) return null;

  // Look up card image from catalog
  const catalogHero = characterCatalog.find((c) => c.id === hero.variantId)
    || characterCatalog.find((c) => c.id.startsWith(hero.heroId + "-"));
  const cardImage = catalogHero?.cardImage || hero.cardImage || "";
  const basePath = cardImage ? deriveBasePath(cardImage) : "";

  const colors = rarityColors[rarity] || rarityColors.Common;
  const totalPower = hero.strength + hero.intellect + hero.vitality + hero.agility;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={phase === "shown" ? onClose : undefined}
    >
      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          phase === "opening" ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Opening Animation */}
        {phase === "opening" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 animate-pulse">
              <Image
                src="/daily-box2.png"
                alt="Mystery Summon"
                fill
                sizes="128px"
                className="object-contain animate-bounce"
              />
            </div>
            <div className="mt-6 text-[var(--text)] text-xl font-bold animate-pulse">
              Summoning Hero...
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Hero Reveal */}
        {(phase === "reveal" || phase === "shown") && (
          <div
            className={`glass-panel rounded-3xl p-6 border-2 ${colors.border} ${colors.glow} bg-gradient-to-br ${colors.bg} transition-all duration-500`}
          >
            {/* Rarity Banner */}
            <div className={`text-center mb-4 ${phase === "reveal" ? "animate-pulse" : ""}`}>
              <span className={`text-3xl font-black uppercase tracking-wider ${colors.text}`}>
                {rarity}
              </span>
              <span className="block text-sm text-[var(--muted)] mt-1">Hero Summoned!</span>
            </div>

            {/* Hero Image with Animation */}
            <div
              className={`relative w-full aspect-square max-h-[320px] rounded-2xl overflow-hidden bg-[rgba(26,32,48,0.7)] border ${colors.border} mb-4 ${
                phase === "reveal" ? "animate-[scaleIn_0.5s_ease-out]" : ""
              }`}
            >
              {cardImage && (
                <Image
                  src={cardImage}
                  alt={hero.name}
                  fill
                  sizes="320px"
                  className="object-contain pointer-events-none"
                />
              )}
              {basePath && (
                <AnimatedHeroSprite
                  basePath={basePath}
                  frameCount={18}
                  hero={false}
                  intervalMs={140}
                  idleFrames={[0, 1, 2, 3, 4, 5, 4, 3, 2, 1]}
                  blinkFrames={[15, 16, 15]}
                  minBlinkDelayMs={4200}
                  maxBlinkDelayMs={8400}
                  alt={hero.name}
                />
              )}
            </div>

            {/* Hero Info */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-[var(--text)]">{hero.name}</h2>
              <span className="text-sm text-[var(--muted)]">{hero.discipline}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: "STR", value: hero.strength },
                { label: "INT", value: hero.intellect },
                { label: "VIT", value: hero.vitality },
                { label: "AGI", value: hero.agility },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-2 py-2 text-center"
                >
                  <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                  <div className="text-lg font-semibold text-[var(--text)]">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Total Power & Gold */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-[var(--text)]">
                <span className="text-sm text-[var(--muted)]">Power:</span>
                <span className="font-bold text-lg">{totalPower}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src={goldIcon} alt="gold" width={20} height={20} className="object-contain" />
                <span className="font-bold text-lg text-[var(--accent-2)]">+{goldAwarded.toLocaleString()}</span>
              </div>
            </div>

            {/* Claim Button */}
            {phase === "shown" && (
              <button
                onClick={onClose}
                className="w-full soft-button py-3 rounded-xl justify-center text-base font-semibold"
              >
                Add to Collection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Particle Effects for Legendary */}
      {rarity === "Legendary" && (phase === "reveal" || phase === "shown") && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
