"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AuctionCard from "./AuctionCard";
import { Auction, OwnedHero } from "@/types";
import AppPagination from "../components/AppPagination";
import { getData, getDetailedViewData } from "../actions/auctionActions";
import Filters from "./Filters";
import { useParamStore } from "@/hooks/useParamsStore";
import { shallow } from "zustand/shallow";
import qs from "query-string";
import EmptyFilter from "../components/EmptyFilter";
import { useAuctionStore } from "@/hooks/useAuctionStore";
import {isMobile} from 'react-device-detect';
import { User } from "next-auth";
import { useProfileStore } from "@/hooks/useProfileStore";
import Image from "next/image";
import goldIcon from "@/public/gold2.png";
import { numberWithCommas } from "../lib/numberWithComma";
import { getLeaderboard, getMyProgress, summonHero } from "../actions/gamificationActions";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import { characterCatalog, CharacterDefinition } from "../data/characterCatalog";
import AnimatedHeroSprite from "../components/AnimatedHeroSprite";
import { signIn, signOut } from "next-auth/react";
import BidList from "./details/[id]/BidList";
import SellHeroModal from "../components/SellHeroModal";
import HeroDetailModal from "../components/HeroDetailModal";
import DailySummonModal from "../components/DailySummonModal";
import { FaTag } from "react-icons/fa";
import { useSellModalStore } from "@/hooks/useSellModalStore";
import dailyBoxImg from "@/public/daily-box2.png";
import toast from "react-hot-toast";

type Props = {
  user: User | null;
};

export default function Listings({ user }: Props) {
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<{heroName: string; rarity: string; gold: number} | null>(null);
  const [summonedHero, setSummonedHero] = useState<{ hero: OwnedHero; gold: number; rarity: string } | null>(null);
  const [showSummonModal, setShowSummonModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(!user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionIdFromUrl = searchParams.get('auction');
  const profile = useProfileStore((state) => state.profile);
  const leaderboard = useProfileStore((state) => state.leaderboard);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLeaderboard = useProfileStore((state) => state.setLeaderboard);
  const [now, setNow] = useState(Date.now());
  const hashToCharacter = useCallback((auctionId: string): CharacterDefinition => {
    const hash = Array.from(auctionId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const idx = Math.abs(hash) % characterCatalog.length;
    return characterCatalog[idx];
  }, []);

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.3)]';
      case 'Epic': return 'border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
      case 'Rare': return 'border-blue-400/70 shadow-[0_0_12px_rgba(96,165,250,0.3)]';
      default: return 'border-slate-400/50';
    }
  };

  const normalizeImagePath = useCallback((path?: string) => {
    if (!path) return "";
    return path.toLowerCase().replace(/^https?:\/\/[^/]+/, "");
  }, []);

  const getImageKey = useCallback(
    (path?: string) => normalizeImagePath(path).replace(/frame_\d+\.(png|jpg|jpeg|webp)$/i, ""),
    [normalizeImagePath]
  );

  const allowedImageDomains = new Set([
    "cdn.pixabay.com",
    "people.com",
    "res.cloudinary.com",
    "images.unsplash.com",
    "api.dicebear.com",
  ]);

  const normalizeCardImage = (img?: string, fallback?: string) => {
    if (!img) return fallback ?? "";
    if (img.startsWith("http")) {
      try {
        const host = new URL(img).hostname.toLowerCase();
        if (!allowedImageDomains.has(host)) {
          return fallback ?? "";
        }
      } catch {
        return fallback ?? "";
      }
      return img;
    }
    return img.startsWith("/") ? img : `/${img}`;
  };

  const resolveAuctionCharacter = useCallback(
    (auction: Auction): CharacterDefinition => {
      const normalized = normalizeImagePath(auction.imageUrl)
        .replace("fallen_angel_", "fallen_angels_"); // fix legacy asset typo
      const auctionKey = getImageKey(auction.imageUrl);
      const matchByExactImage = characterCatalog.find(
        (c) => normalizeImagePath(c.cardImage) === normalized
      );
      if (matchByExactImage) return matchByExactImage;

      const matchByBasePath = characterCatalog.find(
        (c) => getImageKey(c.cardImage) === auctionKey
      );
      if (matchByBasePath) return matchByBasePath;

      return hashToCharacter(auction.id);
    },
    [getImageKey, hashToCharacter, normalizeImagePath]
  );

  const ownedIds = useMemo(
    () =>
      new Set(
        [
          ...((profile?.ownedHeroes ?? []).map((h) => h.variantId ?? h.heroId) || []),
          ...(profile?.recentPurchases ?? []),
        ].filter(Boolean) as string[]
      ),
    [profile?.ownedHeroes, profile?.recentPurchases]
  );
  const lastMystery = profile?.lastMysteryRewardAt ? new Date(profile.lastMysteryRewardAt).getTime() : 0;
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const elapsed = Math.max(0, now - lastMystery);
  const remaining = Math.max(0, windowMs - elapsed);
  const canOpen = remaining === 0;
  const cooldownProgress = Math.min(1, elapsed / windowMs);
  const recentReward =
    profile?.lastMysteryRewardAt &&
    remaining > 0 &&
    profile.lastMysteryRewardXp &&
    profile.lastMysteryRewardCoins
      ? { xp: profile.lastMysteryRewardXp, coins: profile.lastMysteryRewardCoins }
      : null;
  const params = useParamStore(
    (state) => ({
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      searchTerm: state.searchTerm,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      seller: state.seller,
      winner: state.winner,
      rarity: state.rarity,
      discipline: state.discipline,
    }),
    shallow
  );
  const data = useAuctionStore(
    (state) => ({
      auctions: state.auctions,
      totalCount: state.totalCount,
      pageCount: state.pageCount,
    }),
    shallow
  );

  const setData = useAuctionStore(state => state.setData);

  const setParams = useParamStore((state) => state.setParams);
  const url = qs.stringifyUrl({ url: "", query: params });
  const sellerActive = params.seller === user?.username;
  const winnerActive = params.winner === user?.username;
  const [selected, setSelected] = useState<{ auction: Auction; character: CharacterDefinition } | null>(null);
  const [sellPreselectedHero, setSellPreselectedHero] = useState<CharacterDefinition | null>(null);
  const [selectedCollectionHero, setSelectedCollectionHero] = useState<{ character: CharacterDefinition; acquiredAt?: string } | null>(null);
  const { isOpen: sellModalOpen, closeModal: closeSellModal, openModal: openSellModal } = useSellModalStore();
  const [userLiveAuctions, setUserLiveAuctions] = useState<Auction[]>([]);

  const refreshUserLiveAuctions = useCallback(async () => {
    if (!user?.username) {
      setUserLiveAuctions([]);
      return;
    }
    try {
      const query = qs.stringifyUrl({
        url: "",
        query: {
          seller: user.username,
          filterBy: "live",
          pageNumber: 1,
          pageSize: 100,
          orderBy: "endingSoon",
        },
      });
      const res = await getData(query);
      if ((res as any)?.error) throw (res as any).error;
      setUserLiveAuctions((res as any).results ?? []);
    } catch {
      setUserLiveAuctions([]);
    }
  }, [user?.username]);

  const activeUserAuctions = useMemo(
    () => userLiveAuctions.filter((a) => a.status?.toLowerCase() === "live"),
    [userLiveAuctions]
  );

  const listedAuctionImages = useMemo(() => {
    const keys: string[] = [];
    activeUserAuctions.forEach((a) => {
      const normalized = normalizeImagePath(a.imageUrl);
      const baseKey = getImageKey(a.imageUrl);
      if (normalized) keys.push(normalized);
      if (baseKey) keys.push(baseKey);
    });
    return new Set(keys);
  }, [activeUserAuctions, getImageKey, normalizeImagePath]);

  const listedHeroIds = useMemo(
    () =>
      new Set(
        activeUserAuctions
          .map((auction) => resolveAuctionCharacter(auction)?.id)
          .filter(Boolean) as string[]
      ),
    [activeUserAuctions, resolveAuctionCharacter]
  );

  const combined = useMemo(
    () =>
      data.auctions.map((auction) => ({
        auction,
        character: resolveAuctionCharacter(auction),
      })),
    [data.auctions, resolveAuctionCharacter]
  );

  const filteredCombined = useMemo(() => {
    return combined.filter(({ auction, character }) => {
      if (!character) return false;
      if (params.rarity && params.rarity !== 'all' && character.rarity.toLowerCase() !== params.rarity.toLowerCase()) {
        return false;
      }
      if (
        params.discipline &&
        params.discipline !== 'all' &&
        character.discipline.toLowerCase() !== params.discipline.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [combined, params.discipline, params.rarity]);

  // Use profile.ownedHeroes directly for display (has cardImage from backend)
  const ownedHeroesList = profile?.ownedHeroes ?? [];
  // Also keep catalog-based list for compatibility with SellHeroModal
  const ownedList = characterCatalog.filter((c) => ownedIds.has(c.id));

  const sellableHeroes = useMemo(
    () =>
      ownedList.filter(
        (c) =>
          !listedHeroIds.has(c.id) &&
          !listedAuctionImages.has(normalizeImagePath(c.cardImage)) &&
          !listedAuctionImages.has(getImageKey(c.cardImage))
      ),
    [ownedList, listedHeroIds, listedAuctionImages, normalizeImagePath, getImageKey]
  );

  const totalStats =
    profile?.totalHeroPower ??
    ownedList.reduce((sum, c) => {
      const s = c.stats;
      return sum + s.strength + s.intellect + s.vitality + s.agility;
    }, 0);
  const derivedLevel = profile?.level ?? Math.max(1, Math.floor(totalStats / 120));
  const nextThreshold = (derivedLevel + 1) * 120;
  const progressPct = nextThreshold ? Math.min(100, Math.round((totalStats / nextThreshold) * 100)) : 0;

  const refreshProfileAndBoard = useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      const profile = await getMyProgress();
      if (profile) {
        setProfile(profile);
      }
      const leaderboard = await getLeaderboard();
      if (leaderboard && leaderboard.length > 0) {
        setLeaderboard(leaderboard);
      }
      await refreshUserLiveAuctions();
    } catch {
      // ignore errors; keep current state
    }
  }, [user, setProfile, setLeaderboard, refreshUserLiveAuctions]);

  const ensureDicebearPng = (url: string) => {
    if (!url.includes("dicebear.com")) return url;
    const converted = url
      .replace(/\/7\.x\/[^/]+\//, "/7.x/adventurer/")
      .replace("/svg", "/png");
    if (converted.includes("?")) return converted;
    return `${converted}?seed=${user?.username ?? "avatar"}&backgroundType=gradientLinear&radius=40`;
  };

  function setWinner(){
    if(!user?.username) return;
    setParams({winner: user.username, seller: undefined, filterBy: 'finished'})
  }
  
  function setSeller(){
    if(!user?.username) return;
    setParams({seller: user.username, winner: undefined, filterBy: 'live'})
  }

  const formatShortId = (id: string) => id.replace(/-/g, '').slice(0, 8).toUpperCase();
  const deriveBasePath = (cardImage: string) => {
    const match = cardImage.match(/(.*)\/card\/frame_\d+\.png$/);
    return match ? match[1] : "";
  };

  const handleLogin = () => {
    signIn("id-server", { callbackUrl: "/", prompt: "login" });
  };

  const handleGuestLogin = async () => {
    const guestHint = process.env.NEXT_PUBLIC_GUEST_LOGIN_HINT || "guest";
    // Ensure any existing session is cleared before forcing a guest login
    await signOut({ redirect: false });
    await signIn("id-server", { login_hint: guestHint, prompt: "login", callbackUrl: "/" });
  };

  async function handleMysteryBox() {
    if (!profile || !canOpen || !user?.username) return;
    const result = await summonHero(user.username);
    if (result) {
      if (result.profile) {
        setProfile(result.profile);
      }
      if (result.hero) {
        const summoned = result.hero;
        const catalogHero =
          characterCatalog.find((c) => c.id === summoned.variantId) ||
          characterCatalog.find((c) => c.id.startsWith(summoned.heroId + "-")) ||
          characterCatalog.find((c) => c.name.toLowerCase() === summoned.name.toLowerCase());
        const fallbackCardImage =
          "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png";
        const preferredImage = catalogHero?.cardImage || summoned.cardImage || fallbackCardImage;
        const cardImage = normalizeCardImage(preferredImage, fallbackCardImage);
        const heroWithImage = { ...summoned, cardImage };

        setReward({ heroName: heroWithImage.name, rarity: heroWithImage.rarity, gold: result.goldAwarded });
        setSummonedHero({ hero: heroWithImage, gold: result.goldAwarded, rarity: result.rarity });
        setShowSummonModal(true);
        toast.custom(
          (t) => (
            <div
              className={`glass-panel border border-[var(--card-border)] rounded-2xl p-3 flex items-center gap-3 shadow-lg ${
                t.visible ? "animate-enter" : "animate-leave"
              }`}
            >
              <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-[var(--card-border)] bg-[rgba(26,32,48,0.7)]">
                {cardImage && (
                  <Image
                    src={cardImage}
                    alt={heroWithImage.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-[var(--muted)]">Daily Summon</span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {result.rarity} hero: {heroWithImage.name}
                </span>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      }
      await refreshProfileAndBoard();
    }
  }

  function setPageNumber(pageNumber: number) {
    setParams({ pageNumber: pageNumber });
  }

  useEffect(() => {
    getData(url).then((data) => {
      setData(data);
      setLoading(false);
    });
  }, [url, setData]);

  useEffect(() => {
    refreshUserLiveAuctions();
  }, [refreshUserLiveAuctions]);

  useEffect(() => {
    if (auctionIdFromUrl && !loading) {
      const auction = data.auctions.find((a) => a.id === auctionIdFromUrl);
      if (auction) {
        setSelected({ auction, character: resolveAuctionCharacter(auction) });
      } else {
        getDetailedViewData(auctionIdFromUrl)
          .then((auction) => {
            if (auction && auction.id) {
              setSelected({ auction, character: resolveAuctionCharacter(auction) });
            }
          })
          .catch(() => {});
      }
      router.replace("/", { scroll: false });
    }
  }, [auctionIdFromUrl, data.auctions, loading, resolveAuctionCharacter, router]);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  useEffect(() => {
    refreshProfileAndBoard();
    if (!user) return;
    const onFocus = () => refreshProfileAndBoard();
    const onPageShow = () => refreshProfileAndBoard();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshProfileAndBoard();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user, refreshProfileAndBoard]);

  if (loading) return <LoadingSpinner label="Summoning auctions..." />;

  if(isMobile) return <h3> This website is not supported for mobile devices. Please use a desktop to preview this demo. You will be able to still see activity notifications. </h3>

  const rarityTone: Record<CharacterDefinition['rarity'], string> = {
    Common: 'bg-[rgba(255,255,255,0.08)] text-[var(--text)] border-[var(--card-border)]',
    Rare: 'bg-gradient-to-r from-[rgba(59,130,246,0.25)] to-[rgba(56,189,248,0.18)] text-[var(--text)] border-[rgba(59,130,246,0.6)]',
    Epic: 'bg-gradient-to-r from-[rgba(139,92,246,0.3)] to-[rgba(236,72,153,0.2)] text-[var(--text)] border-[rgba(139,92,246,0.6)]',
    Legendary: 'bg-gradient-to-r from-[rgba(245,158,11,0.35)] to-[rgba(249,115,22,0.25)] text-[var(--text)] border-[rgba(245,158,11,0.65)]',
  };

  return (
    <>
      {!user && showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-panel rounded-3xl p-6 border border-[var(--card-border)] max-w-md w-full text-[var(--text)]">
            <h2 className="text-2xl font-bold mb-2">Welcome to Hero Exchange</h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              Sign in to bid, list heroes, and track your progress. You can also jump in as a guest to try the experience.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogin} className="soft-button w-full justify-center py-3 text-base">
                Login
              </button>
              <button onClick={handleGuestLogin} className="soft-button-ghost w-full justify-center py-3 text-base">
                Login as Guest
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full text-sm text-[var(--muted)] hover:text-[var(--text)]"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch mb-6">
          {/* Profile */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14">
                <div className="h-full w-full rounded-2xl overflow-hidden border border-white/70 shadow-lg bg-gradient-to-br from-[#5b7bff] to-[#9f7aea]" />
                <Image
                  src={ensureDicebearPng(
                    profile?.avatarUrl ??
                      `https://api.dicebear.com/7.x/adventurer/png?seed=${user.username}&backgroundType=gradientLinear&radius=40`
                  )}
                  alt="avatar"
                  fill
                  sizes="56px"
                  className="rounded-2xl object-cover"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 shadow text-slate-700">
                  Lv {profile?.level ?? 1}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">
                  Welcome back, {user.name ?? user.username}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-positive flex items-center gap-2">
                    <Image src={goldIcon} alt="gold" width={20} height={20} className="object-contain" />
                    {numberWithCommas(profile?.flogBalance ?? 0)}
                  </span>
                  <span className="badge badge-positive">Level {derivedLevel}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <div className="flex-1 min-w-[200px]">
                <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5b7bff] via-[#9f7aea] to-[#7dd3fc]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-2 items-center">
                  <span>Total stats {totalStats}</span>
                  <span className="text-slate-400">|</span>
                  <span>Progress to next {progressPct}%</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-2 min-w-[200px] justify-start md:justify-end">
                <span>Sold: {profile?.auctionsSold ?? 0}</span>
                <span className="text-slate-400">|</span>
                <span>Won: {profile?.auctionsWon ?? 0}</span>
                <span className="text-slate-400">|</span>
                <span>Bids: {profile?.bidsPlaced ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-slate-500 tracking-wide">Daily Summons</span>
                <span className="text-sm font-semibold text-slate-800">
                  {recentReward && !canOpen
                    ? `+${recentReward.coins} | +${recentReward.xp} power`
                    : reward
                    ? `+${reward?.gold ?? 0} | ${reward?.heroName ?? ""} (${reward?.rarity ?? ""})`
                    : canOpen
                    ? "Tap to summon a hero!"
                    : "Come back tomorrow"
                  }
                </span>
              </div>
              <button
                onClick={handleMysteryBox}
                disabled={!profile || !canOpen}
                className={`relative h-20 w-20 rounded-2xl shadow-lg overflow-hidden transition-transform ${canOpen ? "hover:scale-110 cursor-pointer" : "opacity-70 cursor-not-allowed"}`}
              >
                {!canOpen && (
                  <div
                    className="absolute inset-0 rounded-2xl z-10"
                    style={{
                      background: `conic-gradient(from 90deg, rgba(0,0,0,0.6) ${(1 - cooldownProgress) *
                        100}%, transparent ${(1 - cooldownProgress) * 100}%)`,
                    }}
                  />
                )}
                <Image
                  src={dailyBoxImg}
                  alt="Daily Summon"
                  fill
                  sizes="80px"
                  className={`object-contain ${canOpen ? "animate-pulse" : ""}`}
                />
                {!canOpen && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="text-sm font-bold text-white bg-black/60 px-2.5 py-1.5 rounded-lg">
                      {remaining < 60000 ? `${Math.ceil(remaining / 1000)}s` : `${Math.ceil(remaining / 3600000)}h`}
                    </span>
                  </div>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={setSeller}
                className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${sellerActive ? 'chip-active text-white' : ''}`}
              >
                My Listings
              </button>
              <button
                onClick={setWinner}
                className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${winnerActive ? 'chip-active text-white' : ''}`}
              >
                Auctions Won
              </button>
              <button
                onClick={() => {
                  setSellPreselectedHero(null);
                  openSellModal();
                }}
                className="chip-cta text-sm text-center"
              >
                List a hero
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Achievements</div>
              <span className="badge badge-neutral">Lifetime</span>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: "Bids placed", progress: profile?.bidsPlaced ?? 0, total: 100, milestone: "Master Bidder" },
                { label: "Auctions won", progress: profile?.auctionsWon ?? 0, total: 25, milestone: "Champion Collector" },
                { label: "Auctions created", progress: profile?.auctionsCreated ?? 0, total: 50, milestone: "Trading Legend" },
              ].map((achievement) => {
                const pct = Math.min(100, Math.round((achievement.progress / achievement.total) * 100));
                return (
                  <div key={achievement.label} className="rounded-2xl border border-white/60 bg-white/80 px-3 py-2">
                    <div className="flex items-center justify-between text-sm text-slate-800">
                      <span>{achievement.label}</span>
                      <span className="text-xs text-slate-500">{achievement.milestone}</span>
                    </div>
                    <div className="mt-1 h-2 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#5b7bff] to-[#9f7aea]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {achievement.progress}/{achievement.total} to unlock
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--accent-3)]/30 h-full flex flex-col" id="leaderboard">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Leaderboard
              </div>
              <span className="badge badge-neutral">Top 10</span>
            </div>
            <div className="space-y-2 flex-1 overflow-auto pr-1 max-h-[220px]">
              {leaderboard.slice(0, 50).map((entry, idx) => (
                <div
                  key={entry.username}
                  className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/80 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-6 text-center">
                      #{idx + 1}
                    </span>
                    <div className="relative h-8 w-8">
                      <Image
                        src={ensureDicebearPng(entry.avatarUrl)}
                        alt={entry.username}
                        fill
                        sizes="32px"
                        className="rounded-full border border-white/70 shadow object-cover"
                      />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-slate-800">
                        {entry.username}
                      </span>
                      <span className="text-xs text-slate-500">
                        Lv {entry.level}  {numberWithCommas(entry.experience)} XP
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Image src={goldIcon} alt="gold" width={12} height={12} className="object-contain" />
                    {numberWithCommas(entry.flogBalance)}
                  </span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-sm text-slate-500">
                  Keep playing to claim your spot.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 mt-8 items-start">
        <aside className="glass-panel ios-shadow rounded-3xl p-5 border border-[var(--card-border)] flex flex-col xl:sticky xl:top-4 xl:max-h-[calc(100vh-6rem)]">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="text-lg font-bold text-[var(--text)]">Collection</h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral-soft">{ownedHeroesList.length} owned</span>
              {ownedHeroesList.length > 0 && (
                <button
                  onClick={() => {
                    setSellPreselectedHero(null);
                    openSellModal();
                  }}
                  className="chip chip-cta text-xs flex items-center gap-1"
                >
                  <FaTag className="text-[10px]" />
                  Sell
                </button>
              )}
            </div>
          </div>
          {ownedHeroesList.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              You don&apos;t own any heroes yet. Win auctions to add them to your collection.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-glow pr-1 content-start">
              {ownedHeroesList.map((hero) => {
                // Look up cardImage from characterCatalog since backend may not include it
                // Try matching by variantId first, then by heroId prefix
                const catalogHero = characterCatalog.find(c => c.id === hero.variantId)
                  || characterCatalog.find(c => c.id.startsWith(hero.heroId + '-'));
                const cardImage = catalogHero?.cardImage || hero.cardImage || '';
                const normalizedCardPath = normalizeImagePath(cardImage);
                const baseCardKey = getImageKey(cardImage);
                const heroIsListed =
                  listedHeroIds.has(hero.variantId) ||
                  listedAuctionImages.has(normalizedCardPath) ||
                  listedAuctionImages.has(baseCardKey);

                // Convert OwnedHero to CharacterDefinition for modal/sell compatibility
                const heroAsCharacter: CharacterDefinition = {
                  id: hero.variantId,
                  name: hero.name,
                  discipline: hero.discipline as CharacterDefinition['discipline'],
                  rarity: hero.rarity as CharacterDefinition['rarity'],
                  stats: {
                    strength: hero.strength,
                    intellect: hero.intellect,
                    vitality: hero.vitality,
                    agility: hero.agility,
                  },
                  gold: (hero.strength + hero.intellect + hero.vitality + hero.agility) * 10,
                  cardImage: cardImage,
                  lore: catalogHero?.lore,
                };
                return (
                <div
                  key={hero.variantId}
                  onClick={() => setSelectedCollectionHero({ character: heroAsCharacter, acquiredAt: hero.acquiredAt })}
                  className={`relative rounded-xl border-2 bg-[rgba(26,32,48,0.65)] p-2 cursor-pointer transition-all duration-200 hover:scale-95 hover:brightness-110 ${getRarityBorder(hero.rarity)}`}
                >
                  {heroIsListed && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/60 text-amber-100 shadow-sm z-10">
                      Listed
                    </span>
                  )}
                  <div className="relative w-full pb-[100%]">
                    {cardImage && (
                      <Image src={cardImage} alt={hero.name} fill sizes="100px" className="object-contain absolute inset-0" />
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </aside>
        <section className="flex flex-col gap-4">
          <Filters />
          {filteredCombined.length === 0 ? (
            <EmptyFilter showReset />
          ) : (
            <div className="flex flex-col gap-6 min-h-[520px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCombined.map(({ auction, character }) => (
                  <AuctionCard
                    auction={auction}
                    character={character}
                    owned={ownedIds.has(character.id)}
                    key={auction.id}
                    onSelect={() => setSelected({ auction, character })}
                  />
                ))}
              </div>

              <div className="flex justify-center mt-auto">
                <AppPagination
                  pageChanged={setPageNumber}
                  currentPage={params.pageNumber}
                  pageCount={data.pageCount}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 pt-10 border border-[var(--card-border)] max-w-6xl w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-xl font-bold text-[var(--text)] z-10"
            >
              ✕
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)] gap-6 mt-4 pr-2">
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-square min-h-[320px] rounded-2xl overflow-hidden bg-[rgba(26,32,48,0.7)] border border-[var(--card-border)]">
                  <Image
                    src={selected.character.cardImage}
                    alt={selected.character.name}
                    fill
                    sizes="320px"
                    className="object-contain pointer-events-none"
                  />
                  {deriveBasePath(selected.character.cardImage) && (
                    <AnimatedHeroSprite
                      basePath={deriveBasePath(selected.character.cardImage)}
                      frameCount={18}
                      hero={false}
                      intervalMs={140}
                      idleFrames={[0, 1, 2, 3, 4, 5, 4, 3, 2, 1]}
                      blinkFrames={[15, 16, 15]}
                      minBlinkDelayMs={4200}
                      maxBlinkDelayMs={8400}
                      alt={selected.character.name}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="badge badge-positive text-base flex items-center gap-2">
                      <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
                      {numberWithCommas(selected.auction.currentHighBid ?? 0)}
                    </span>
                    <span className="badge badge-neutral-soft">{selected.character.discipline}</span>
                    <span className={`badge ${rarityTone[selected.character.rarity]}`}>{selected.character.rarity}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">{selected.character.name}</h2>
                    <div className="text-xs text-[var(--muted)] font-mono">
                      Listing ID: {formatShortId(selected.auction.id)}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {selected.character.lore ??
                      selected.auction.specs ??
                      "Legend speaks of this hero's untold potential."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Strength', value: selected.character.stats.strength },
                      { label: 'Intellect', value: selected.character.stats.intellect },
                      { label: 'Vitality', value: selected.character.stats.vitality },
                      { label: 'Agility', value: selected.character.stats.agility },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-3 py-2">
                        <div className="text-xs text-[var(--muted)]">{stat.label}</div>
                        <div className="text-lg font-semibold text-[var(--text)]">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full max-h-[70vh] overflow-auto">
                <BidList user={user} auction={selected.auction} />
              </div>
            </div>
          </div>
        </div>
      )}

      <SellHeroModal
        isOpen={sellModalOpen}
        onClose={() => {
          closeSellModal();
          setSellPreselectedHero(null);
        }}
        ownedHeroes={sellableHeroes}
        preselectedHero={sellPreselectedHero}
      />

      <HeroDetailModal
        hero={selectedCollectionHero?.character ?? null}
        onClose={() => setSelectedCollectionHero(null)}
        acquiredAt={selectedCollectionHero?.acquiredAt}
        previousOwners={[]}
      />

      <DailySummonModal
        isOpen={showSummonModal}
        onClose={() => setShowSummonModal(false)}
        hero={summonedHero?.hero ?? null}
        goldAwarded={summonedHero?.gold ?? 0}
        rarity={summonedHero?.rarity ?? "Common"}
      />
    </>
  );
}
