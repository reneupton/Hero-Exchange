"use client";

import React from "react";
import Image from "next/image";
import { CharacterDefinition } from "../data/characterCatalog";
import goldIcon from "@/public/gold2.png";
import AnimatedHeroSprite from "./AnimatedHeroSprite";

type Props = {
  hero: CharacterDefinition | null;
  onClose: () => void;
  acquiredAt?: string;
  previousOwners?: string[];
};

const rarityTone: Record<CharacterDefinition["rarity"], string> = {
  Common: "bg-[rgba(255,255,255,0.08)] text-[var(--text)] border-[var(--card-border)]",
  Rare: "bg-gradient-to-r from-[rgba(59,130,246,0.25)] to-[rgba(56,189,248,0.18)] text-[var(--text)] border-[rgba(59,130,246,0.6)]",
  Epic: "bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(236,72,153,0.2)] text-[var(--text)] border-[rgba(139,92,246,0.6)]",
  Legendary: "bg-gradient-to-r from-[rgba(245,158,11,0.35)] to-[rgba(249,115,22,0.25)] text-[var(--text)] border-[rgba(245,158,11,0.65)]",
};

const deriveBasePath = (cardImage: string) => {
  const match = cardImage.match(/(.*)\/card\/frame_\d+\.png$/);
  return match ? match[1] : "";
};

export default function HeroDetailModal({ hero, onClose, acquiredAt, previousOwners = [] }: Props) {
  if (!hero) return null;

  const totalStats = hero.stats.strength + hero.stats.intellect + hero.stats.vitality + hero.stats.agility;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel rounded-3xl p-6 pt-10 border border-[var(--card-border)] max-w-2xl w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold text-[var(--text)] z-10 hover:text-[var(--accent)] transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col gap-4">
          {/* Hero Image */}
          <div className="relative w-full aspect-square min-h-[280px] max-h-[320px] rounded-2xl overflow-hidden bg-[rgba(26,32,48,0.7)] border border-[var(--card-border)]">
            {hero.cardImage && (
              <Image
                src={hero.cardImage}
                alt={hero.name}
                fill
                sizes="320px"
                className="object-contain pointer-events-none"
              />
            )}
            {hero.cardImage && deriveBasePath(hero.cardImage) && (
              <AnimatedHeroSprite
                basePath={deriveBasePath(hero.cardImage)}
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-positive text-base flex items-center gap-2">
                <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
                {hero.gold.toLocaleString()}
              </span>
              <span className="badge badge-neutral-soft">{hero.discipline}</span>
              <span className={`badge ${rarityTone[hero.rarity]}`}>{hero.rarity}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--text)]">{hero.name}</h2>
              <div className="text-xs text-[var(--muted)] font-mono">
                Total Power: {totalStats}
              </div>
            </div>

            <p className="text-sm text-[var(--muted)]">
              {hero.lore ?? "Legend speaks of this hero's untold potential."}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "STR", value: hero.stats.strength },
                { label: "INT", value: hero.stats.intellect },
                { label: "VIT", value: hero.stats.vitality },
                { label: "AGI", value: hero.stats.agility },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-3 py-2 text-center"
                >
                  <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                  <div className="text-lg font-semibold text-[var(--text)]">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Date Obtained */}
            {acquiredAt && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-4 py-3">
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Date Obtained</div>
                <div className="text-sm font-medium text-[var(--text)]">
                  {new Date(acquiredAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            )}

            {/* Previous Owners */}
            {previousOwners.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-4 py-3">
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-2">Previous Owners</div>
                <div className="flex flex-col gap-1">
                  {previousOwners.map((owner, idx) => (
                    <div key={idx} className="text-sm text-[var(--text)] flex items-center gap-2">
                      <span className="text-xs text-[var(--muted)]">#{previousOwners.length - idx}</span>
                      {owner}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previousOwners.length === 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-4 py-3">
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Previous Owners</div>
                <div className="text-sm text-[var(--muted)] italic">Original owner</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
