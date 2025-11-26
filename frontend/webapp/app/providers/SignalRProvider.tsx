"use client";

import { useAuctionStore } from "@/hooks/useAuctionStore";
import { useBidStore } from "@/hooks/useBidStore";
import {
  Auction,
  AuctionFinished,
  AuctionStatusChanged,
  Bid,
  UserAvatarUpdated,
  UserCooldownReset,
  UserProgressAdjusted,
} from "@/types";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { User } from "next-auth";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AuctionCreatedToast from "../components/AuctionCreatedToast";
import { getDetailedViewData } from "../actions/auctionActions";
import AuctionFinishedToast from "../components/AuctionFinishedToast";
import BidPlacedToast from "../components/BidPlacedToast";
import { getLeaderboard, getMyProgress } from "../actions/gamificationActions";
import { useProfileStore } from "@/hooks/useProfileStore";
import AdminActionToast from "../components/AdminActionToast";

type Props = {
  children: ReactNode;
  user: User | null;
};

export default function SignalRProvider({ children, user }: Props) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const setCurrentPrice = useAuctionStore((state) => state.setCurrentPrice);
  const setStatus = useAuctionStore((state) => state.setStatus);
  const addBid = useBidStore((state) => state.addBid);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLeaderboard = useProfileStore((state) => state.setLeaderboard);
  const playChime = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // ignore audio errors
    }
  };
  const profileRef = useRef(useProfileStore.getState().profile);

  useEffect(() => {
    const unsub = useProfileStore.subscribe((state) => {
      profileRef.current = state.profile;
    });
    return () => unsub();
  }, []);
  // Prefer explicit env override even in production; fall back to hosted default only if unset.
  const apiUrl =
    process.env.NEXT_PUBLIC_NOTIFY_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.flogitdemoapp.co.uk/notifications"
      : "http://localhost:7004/notifications");

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(apiUrl!)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [apiUrl]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to notification hub");

          connection.on("BidPlaced", (bid: Bid) => {
            console.log("Bid placed event received");
            console.log(bid);
            if (bid.bidStatus.includes("Accepted")) {
              setCurrentPrice(bid.auctionId, bid.amount);
            }
            addBid(bid);
            if (user?.username === bid.bidder) {
              getMyProgress()
                .then((profile) => {
                  if (profile) setProfile(profile);
                  return getLeaderboard();
                })
                .then(setLeaderboard)
                .catch(() => {});
            }

            const auction = getDetailedViewData(bid.auctionId);
            return toast.promise(
              auction,
              {
                loading: "Loading...",
                success: (auction) => (
                  <BidPlacedToast bid={bid} auction={auction} />
                ),
                error: (err) => "Bid placed !",
              },
              { success: { duration: 6000, icon: null } }
            );
          });

          connection.on("AuctionCreated", (auction: Auction) => {
            if (user?.username !== auction.seller) {
              playChime();
              return toast(<AuctionCreatedToast auction={auction} />, {
                duration: 6000,
              });
            }
          });

          connection.on(
            "AuctionFinished",
            (finishedAuction: AuctionFinished) => {
              if (
                user &&
            (finishedAuction.winner === user.username ||
              finishedAuction.seller === user.username)
          ) {
            getMyProgress()
              .then((profile) => {
                if (profile) setProfile(profile);
                return getLeaderboard();
              })
                  .then(setLeaderboard)
                  .catch(() => {});
              }

              const auction = getDetailedViewData(finishedAuction.auctionId);
              return toast.promise(
                auction,
                {
                  loading: "Loading...",
                  success: (auction) => (
                    <AuctionFinishedToast
                      finishedAuction={finishedAuction}
                      auction={auction}
                    />
                  ),
                  error: (err) => "Auction finished!",
                },
                { success: { duration: 6000, icon: null } }
              );
            }
          );

          connection.on(
            "UserProgressAdjusted",
            async (payload: UserProgressAdjusted) => {
              if (!user || payload.username !== user.username) return;
              try {
                const current = profileRef.current;
                if (current) {
                  const updated = { ...current };
                  if (typeof payload.balanceDelta === "number") {
                    updated.flogBalance = (updated.flogBalance ?? 0) + payload.balanceDelta;
                  }
                  if (typeof payload.xpDelta === "number") {
                    updated.experience = (updated.experience ?? 0) + payload.xpDelta;
                  }
                  if (typeof payload.level === "number") {
                    updated.level = payload.level;
                  }
                  profileRef.current = updated;
                  setProfile(updated);
                }
                const profile = await getMyProgress();
                if (profile) {
                  profileRef.current = profile;
                  setProfile(profile);
                }
                const leaderboard = await getLeaderboard();
                if (leaderboard) setLeaderboard(leaderboard);
                playChime();
                toast.custom(
                  <AdminActionToast type="progress" payload={payload as any} />,
                  { duration: 6000 }
                );
              } catch {
                // silent fail; keep existing state
              }
            }
          );

          connection.on(
            "UserAvatarUpdated",
            async (payload: UserAvatarUpdated) => {
              if (!user || payload.username !== user.username) return;
              try {
                const current = profileRef.current;
                if (current) {
                  const updated = { ...current, avatarUrl: payload.avatarUrl };
                  profileRef.current = updated;
                  setProfile(updated);
                }
                const profile = await getMyProgress();
                if (profile) {
                  profileRef.current = profile;
                  setProfile(profile);
                }
                playChime();
                toast.custom(
                  <AdminActionToast type="avatar" payload={payload as any} />,
                  { duration: 6000 }
                );
              } catch {
                // ignore errors; keep existing state
              }
            }
          );

          connection.on(
            "AuctionStatusChanged",
            async (payload: { auctionId: string; status: string; changedBy?: string }) => {
              setStatus(payload.auctionId, payload.status);
              try {
                const auction = await getDetailedViewData(payload.auctionId);
                if (
                  user &&
                  (auction.seller === user.username ||
                    (auction.winner && auction.winner === user.username))
                ) {
                  playChime();
                  toast.custom(
                    <AdminActionToast
                      type="status"
                      payload={{
                        auctionId: payload.auctionId,
                        status: payload.status,
                        changedBy: payload.changedBy,
                        title: auction.title,
                        brand: auction.brand,
                      }}
                    />,
                    { duration: 6000 }
                  );
                }
              } catch {
                // ignore errors; keep existing state
              }
            }
          );

          connection.on(
            "UserCooldownReset",
            async (payload: { username: string }) => {
              if (!user || payload.username !== user.username) return;
              try {
                const current = profileRef.current;
                if (current) {
                  const updated = {
                    ...current,
                    lastMysteryRewardAt: undefined,
                    lastMysteryRewardCoins: undefined as any,
                    lastMysteryRewardXp: undefined as any,
                    lastDailyReward: undefined,
                  };
                  profileRef.current = updated;
                  setProfile(updated);
                }
                const profile = await getMyProgress();
                if (profile) {
                  profileRef.current = profile;
                  setProfile(profile);
                }
                playChime();
                toast.custom(
                  <AdminActionToast
                    type="cooldown"
                    payload={{ username: payload.username }}
                  />,
                  { duration: 6000 }
                );
              } catch {
                // ignore errors
              }
            }
          );
        })
        .catch((error) => console.log(error));
    }

    return () => {
      connection?.stop();
    };
  }, [connection, setCurrentPrice, addBid, user, setProfile, setLeaderboard, setStatus]);

  return children;
}
