// Server actions for retrieving and mutating player progress and mystery box state from the backend.
'use server'

import { OwnedHero, PlayerProfile } from "@/types";
import { fetchWrapper } from "../lib/fetchWrapper";

export type SummonResult = {
  profile: PlayerProfile;
  hero?: OwnedHero | null;
  goldAwarded: number;
  rarity: string;
};

/**
 * Fetches the current user's progress profile.
 */
export async function getMyProgress(): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.get("progress/me");
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}

/**
 * Applies a gamification action (bid/list/sale/purchase/daily-login) and returns the updated profile.
 */
export async function awardGamification(action: string, amount?: number): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.post("progress/award", { action, amount });
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}

/**
 * Retrieves the leaderboard from the backend.
 */
export async function getLeaderboard(): Promise<PlayerProfile[]> {
  try {
    const res = await fetchWrapper.get("progress/leaderboard");
    if ((res as any)?.error) return [];
    return res as PlayerProfile[];
  } catch {
    return [];
  }
}

/**
 * Opens the daily mystery box for the current user.
 */
export async function openMysteryBox(): Promise<SummonResult | null> {
  try {
    const res = await fetchWrapper.post("progress/mystery", {});
    if ((res as any)?.error) return null;
    const result = res as { profile: PlayerProfile; hero?: OwnedHero; goldAwarded: number; rarity: string };
    return {
      profile: result.profile,
      hero: result.hero,
      goldAwarded: result.goldAwarded,
      rarity: result.rarity,
    };
  } catch {
    return null;
  }
}

/**
 * (Legacy) Opens the mystery box; username is unused but retained for compatibility.
 */
export async function summonHero(username: string): Promise<SummonResult | null> {
  try {
    const res = await fetchWrapper.post("progress/mystery", {});
    if ((res as any)?.error) return null;
    const result = res as { profile: PlayerProfile; hero?: OwnedHero; goldAwarded: number; rarity: string };
    return {
      profile: result.profile,
      hero: result.hero,
      goldAwarded: result.goldAwarded,
      rarity: result.rarity,
    };
  } catch {
    return null;
  }
}

/**
 * Claims an achievement reward for the current user.
 */
export async function claimAchievement(achievementId: string): Promise<PlayerProfile | null> {
  try {
    const res = await fetchWrapper.post("progress/claim-achievement", { achievementId });
    if ((res as any)?.error) return null;
    return res as PlayerProfile;
  } catch {
    return null;
  }
}
