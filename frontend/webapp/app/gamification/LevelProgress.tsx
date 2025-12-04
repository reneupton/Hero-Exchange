"use client";
/* eslint-disable react/self-closing-comp */

import { useEffect } from 'react';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { gamificationService } from '../services/gamificationService';
import { FaStar, FaTrophy } from 'react-icons/fa';

type Props = {
  userId: string;
  compact?: boolean;
};

export default function LevelProgress({ userId, compact = false }: Props) {
  const { userGamification, setUserGamification } = useGamificationStore();

  useEffect(() => {
    const fetchUserGamification = async () => {
      try {
        const data = await gamificationService.getUserGamification(userId);
        setUserGamification(data);
      } catch (err) {
        console.error('Failed to load user gamification:', err);
      }
    };

    if (userId) {
      fetchUserGamification();
    }

    // Listen for wallet update events (which also means XP updates)
    const handleUpdate = () => {
      fetchUserGamification();
    };

    window.addEventListener('walletUpdate', handleUpdate);

    return () => {
      window.removeEventListener('walletUpdate', handleUpdate);
    };
  }, [userId, setUserGamification]);

  if (!userGamification) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-lg p-4">
        <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  const progressPercentage = (userGamification.xp / userGamification.xpForNextLevel) * 100;

  if (compact) {
    return (
      <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md animate-pulse">
              {userGamification.level}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Level {userGamification.level}
              </div>
              <div className="text-xs text-gray-500">{userGamification.title}</div>
            </div>
          </div>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 shimmer transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          {userGamification.xp} / {userGamification.xpForNextLevel} XP
        </div>
      </div>
    );
  }

  return (
    <div className="ios-card bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            {userGamification.title}
          </h2>
          <div className="text-gray-600 text-sm mt-1">
            {userGamification.achievementCount} Achievements •{' '}
            {userGamification.completedQuestsCount} Quests Completed
          </div>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg quest-pulse">
          <span className="text-3xl font-bold text-white">
            {userGamification.level}
          </span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            Experience Points
          </span>
          <span className="text-gray-900 font-semibold">
            {userGamification.xp} / {userGamification.xpForNextLevel} XP
          </span>
        </div>
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 shimmer transition-all duration-500 flex items-center justify-end pr-3"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {progressPercentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm">Login Streak</div>
          <div className="text-xl font-bold text-gray-900">
            {userGamification.streakDays} days
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm">Next Level</div>
          <div className="text-xl font-bold text-purple-600">
            {userGamification.xpForNextLevel - userGamification.xp} XP
          </div>
        </div>
      </div>
    </div>
  );
}
