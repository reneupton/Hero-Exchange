'use client';

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
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {userGamification.level}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Level {userGamification.level}
              </div>
              <div className="text-xs text-gray-400">{userGamification.title}</div>
            </div>
          </div>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {userGamification.xp} / {userGamification.xpForNextLevel} XP
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 shadow-2xl border border-purple-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            {userGamification.title}
          </h2>
          <div className="text-purple-200 text-sm mt-1">
            {userGamification.achievementCount} Achievements •{' '}
            {userGamification.completedQuestsCount} Quests Completed
          </div>
        </div>
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-white">
            {userGamification.level}
          </span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-purple-200">
            <FaStar className="inline mr-1 text-yellow-400" />
            Experience Points
          </span>
          <span className="text-white font-semibold">
            {userGamification.xp} / {userGamification.xpForNextLevel} XP
          </span>
        </div>
        <div className="relative h-6 bg-purple-950 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all duration-500 flex items-center justify-end pr-3"
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
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3 border border-purple-800">
          <div className="text-purple-300 text-sm">Login Streak</div>
          <div className="text-2xl font-bold text-white">
            {userGamification.streakDays} days
          </div>
        </div>
        <div className="bg-purple-950 bg-opacity-50 rounded-lg p-3 border border-purple-800">
          <div className="text-purple-300 text-sm">Next Level</div>
          <div className="text-2xl font-bold text-yellow-400">
            {userGamification.xpForNextLevel - userGamification.xp} XP
          </div>
        </div>
      </div>
    </div>
  );
}
