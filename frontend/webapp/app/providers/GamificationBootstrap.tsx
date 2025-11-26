"use client";

import { useEffect } from "react";
import { User } from "next-auth";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import { getLeaderboard, getMyProgress, awardGamification } from "../actions/gamificationActions";
import { useProfileStore } from "@/hooks/useProfileStore";

type Props = {
  user: User | null;
  children: React.ReactNode;
};

export default function GamificationBootstrap({ user, children }: Props) {
  const pathname = usePathname();
  const setProfile = useProfileStore((state) => state.setProfile);
  const setLeaderboard = useProfileStore((state) => state.setLeaderboard);

  useEffect(() => {
    let ignore = false;

    async function sync() {
      if (!user) {
        setProfile(undefined);
        getLeaderboard().then(setLeaderboard).catch(() => setLeaderboard([]));
        return;
      }

      try {
        const profile = await getMyProgress();
        if (!ignore && profile) setProfile(profile);

        const daily = await awardGamification("daily-login");
        if (!ignore && daily) setProfile(daily);

        const leaderboard = await getLeaderboard();
        if (!ignore && leaderboard) setLeaderboard(leaderboard);
      } catch (error: any) {
        if (!ignore) {
          toast.error(error?.message ?? "Unable to sync profile");
        }
      }
    }

    sync();

    return () => {
      ignore = true;
    };
  }, [user, pathname, setProfile, setLeaderboard]);

  return <>{children}</>;
}
