'use client';

import { useEffect, useState } from 'react';
import { gamificationService } from '../services/gamificationService';
import { FaTrophy, FaMedal, FaAward, FaCoins, FaStar } from 'react-icons/fa';

type LeaderboardEntry = {
  userId: string;
  username: string;
  level: number;
  xp: number;
  title: string;
  flogBalance: number;
  achievementCount: number;
  rank: number;
};

type Props = {
  userId?: string;
  limit?: number;
};

export default function Leaderboard({ userId, limit = 100 }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'level' | 'flog' | 'achievements'>('level');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await gamificationService.getLeaderboard(limit);
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    switch (activeTab) {
      case 'level':
        return b.level !== a.level ? b.level - a.level : b.xp - a.xp;
      case 'flog':
        return b.flogBalance - a.flogBalance;
      case 'achievements':
        return b.achievementCount - a.achievementCount;
      default:
        return 0;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaTrophy className="text-yellow-400 text-2xl" />;
      case 2:
        return <FaMedal className="text-gray-300 text-2xl" />;
      case 3:
        return <FaMedal className="text-orange-400 text-2xl" />;
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-blue-900 border-blue-500';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-900 to-yellow-800 border-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-orange-900 to-orange-800 border-orange-500';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          Leaderboard
        </h2>
        <div className="text-sm text-gray-400">Top {limit} Players</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('level')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'level'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaStar className="inline mr-2" />
          Level
        </button>
        <button
          onClick={() => setActiveTab('flog')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'flog'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaCoins className="inline mr-2" />
          FLOG
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'achievements'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaAward className="inline mr-2" />
          Achievements
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {sortedLeaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaTrophy className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No leaderboard data available</p>
          </div>
        ) : (
          sortedLeaderboard.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = userId === entry.userId;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBgClass(
                  rank,
                  isCurrentUser
                )}`}
              >
                {/* Rank */}
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-400">(You)</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-400">{entry.title}</div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  {activeTab === 'level' && (
                    <>
                      <div className="text-center">
                        <div className="text-purple-400 font-bold text-lg">
                          {entry.level}
                        </div>
                        <div className="text-gray-500 text-xs">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300 font-semibold">
                          {entry.xp.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-xs">XP</div>
                      </div>
                    </>
                  )}
                  {activeTab === 'flog' && (
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-lg">
                        {entry.flogBalance.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs">FLOG</div>
                    </div>
                  )}
                  {activeTab === 'achievements' && (
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-lg">
                        {entry.achievementCount}
                      </div>
                      <div className="text-gray-500 text-xs">Achievements</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User's Current Rank */}
      {userId && !sortedLeaderboard.some((e) => e.userId === userId) && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 text-center">
            You are not currently ranked in the top {limit}
          </div>
        </div>
      )}
    </div>
  );
}
