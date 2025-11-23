'use client';

import { useEffect, useState } from 'react';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { gamificationService } from '../services/gamificationService';
import { FaCheckCircle, FaClock, FaCoins, FaStar, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';

type Props = {
  userId: string;
};

export default function QuestTracker({ userId }: Props) {
  const { questProgress, setQuestProgress } = useGamificationStore();
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const data = await gamificationService.getUserQuestProgress(userId);
        setQuestProgress(data);
      } catch (err) {
        console.error('Failed to load quests:', err);
      }
    };

    if (userId) {
      fetchQuests();
    }
  }, [userId, setQuestProgress]);

  const handleClaimReward = async (questProgressId: string, questName: string) => {
    try {
      setClaiming(questProgressId);
      const result = await gamificationService.claimQuestReward(userId, questProgressId);

      toast.success(`Quest completed! +${result.flogRewarded} FLOG, +${result.xpRewarded} XP`, {
        icon: '🎉',
        duration: 4000,
      });

      // Refresh quests
      const data = await gamificationService.getUserQuestProgress(userId);
      setQuestProgress(data);
    } catch (err) {
      toast.error('Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaClock className="text-blue-400" />
          Daily Quests
        </h2>
        <div className="text-sm text-gray-400">
          Resets in{' '}
          <span className="text-white font-semibold">
            {new Date(new Date().setHours(24, 0, 0, 0) - Date.now()).getHours()}h
          </span>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {questProgress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaGift className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No quests available</p>
          </div>
        ) : (
          questProgress.map((qp) => (
            <div
              key={qp.id}
              className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                qp.completed
                  ? 'border-green-500 shadow-green-500/20 shadow-lg'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Quest Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{qp.quest.name}</h3>
                    {qp.completed && (
                      <FaCheckCircle className="text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{qp.quest.description}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>
                    {qp.progress} / {qp.target}
                  </span>
                </div>
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                      qp.completed
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                    style={{ width: `${getProgressPercentage(qp.progress, qp.target)}%` }}
                  ></div>
                </div>
              </div>

              {/* Rewards and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaCoins />
                    <span className="font-semibold">+{qp.quest.flogReward}</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-400">
                    <FaStar />
                    <span className="font-semibold">+{qp.quest.xpReward} XP</span>
                  </div>
                </div>

                {qp.completed && !qp.claimed && (
                  <button
                    onClick={() => handleClaimReward(qp.id, qp.quest.name)}
                    disabled={claiming === qp.id}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {claiming === qp.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <FaGift />
                        Claim Reward
                      </>
                    )}
                  </button>
                )}

                {qp.claimed && (
                  <div className="text-sm text-gray-500 italic flex items-center gap-1">
                    <FaCheckCircle />
                    Claimed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
