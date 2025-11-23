'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/hooks/useGamificationStore';
import { FaTrophy, FaTimes } from 'react-icons/fa';

export default function AchievementUnlock() {
  const { showAchievement, setShowAchievement } = useGamificationStore();

  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(null);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [showAchievement, setShowAchievement]);

  if (!showAchievement) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'from-gray-500 to-gray-600';
      case 'rare':
        return 'from-blue-500 to-blue-600';
      case 'epic':
        return 'from-purple-500 to-purple-600';
      case 'legendary':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full animate-slide-down">
        <div
          className={`bg-gradient-to-r ${getRarityColor(
            showAchievement.rarity
          )} p-1 rounded-xl shadow-2xl`}
        >
          <div className="bg-gray-900 rounded-lg p-6 relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>

            {/* Close button */}
            <button
              onClick={() => setShowAchievement(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>

            {/* Content */}
            <div className="flex items-center gap-4 relative z-10">
              {/* Icon */}
              <div
                className={`w-20 h-20 bg-gradient-to-br ${getRarityColor(
                  showAchievement.rarity
                )} rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce-slow`}
              >
                {showAchievement.icon}
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="text-yellow-400 text-sm font-semibold mb-1 flex items-center gap-2">
                  <FaTrophy />
                  ACHIEVEMENT UNLOCKED!
                </div>
                <h3 className="text-white text-xl font-bold mb-1">
                  {showAchievement.name}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  {showAchievement.description}
                </p>
                <div className="flex gap-3 text-sm">
                  <span className="text-yellow-400 font-semibold">
                    +{showAchievement.flogReward} FLOG
                  </span>
                  <span className="text-purple-400 font-semibold">
                    +{showAchievement.xpReward} XP
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(
                      showAchievement.rarity
                    )} text-white`}
                  >
                    {showAchievement.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
