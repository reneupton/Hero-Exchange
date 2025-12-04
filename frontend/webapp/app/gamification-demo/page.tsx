'use client';

import { useState } from 'react';
import FlogWallet from '../gamification/FlogWallet';
import LevelProgress from '../gamification/LevelProgress';
import QuestTracker from '../gamification/QuestTracker';
import AchievementUnlock from '../gamification/AchievementUnlock';
import Leaderboard from '../gamification/Leaderboard';
import ActivityFeed from '../gamification/ActivityFeed';
import MysteryBox from '../gamification/MysteryBox';

export default function GamificationDemo() {
  // Demo user ID (you can change this to test different users)
  const [userId] = useState('demo-user-123');
  const [userBalance] = useState(1000);

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🎮 FlogIt Arena - Gamification Demo
        </h1>
        <p className="text-gray-400">
          Showcasing all gamification components with live API connections
        </p>
        <p className="text-sm text-yellow-400 mt-2">
          Backend running on: http://localhost:7005
        </p>
      </div>

      {/* Achievement Notification (Global) */}
      <AchievementUnlock />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LevelProgress userId={userId} />
            <FlogWallet userId={userId} compact={false} />
          </div>

          {/* Quests */}
          <QuestTracker userId={userId} />

          {/* Mystery Boxes */}
          <MysteryBox userId={userId} userBalance={userBalance} />

          {/* Leaderboard */}
          <Leaderboard userId={userId} limit={10} />
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed userId={userId} limit={20} showUserOnly={false} />
        </div>
      </div>

      {/* API Connection Status */}
      <div className="max-w-7xl mx-auto mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-white font-semibold mb-2">🔌 API Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">
            Gamification API: <span className="text-green-400">http://localhost:7005</span>
          </div>
          <div className="text-gray-400">
            Swagger UI: <a href="http://localhost:7005/swagger" target="_blank" className="text-blue-400 hover:underline">Open Swagger</a>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Note: If components show loading states, ensure the GamificationService is running on port 7005
        </p>
      </div>
    </div>
  );
}
