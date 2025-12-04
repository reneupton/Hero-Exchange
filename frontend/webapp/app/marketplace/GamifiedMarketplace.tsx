'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaCoins, FaStar, FaFire, FaTrophy, FaGift } from 'react-icons/fa';
import MarketplaceItemGrid from './MarketplaceItemGrid';
import FlogWallet from '../gamification/FlogWallet';
import LevelProgress from '../gamification/LevelProgress';
// import QuestTracker from '../gamification/QuestTracker'; // TEMPORARILY REMOVED
// import Leaderboard from '../gamification/Leaderboard'; // TEMPORARILY REMOVED
import ActivityFeed from '../gamification/ActivityFeed';
import MysteryBox from '../gamification/MysteryBox';
import ListItemForm from './ListItemForm';

type Props = {
  userId: string;
};

export default function GamifiedMarketplace({ userId }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showListItemModal, setShowListItemModal] = useState(false);
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState(false);
  // const [showLeaderboardModal, setShowLeaderboardModal] = useState(false); // TEMPORARILY REMOVED
  const [userBalance, setUserBalance] = useState(1000); // Demo balance

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'fashion', name: 'Fashion', icon: '👟' },
    { id: 'collectibles', name: 'Collectibles', icon: '💎' },
    { id: 'mystery', name: 'Mystery Boxes', icon: '🎁' },
  ];

  const rarities = [
    { id: 'all', name: 'All Rarities', color: 'gray' },
    { id: 'common', name: 'Common', color: 'slate' },
    { id: 'uncommon', name: 'Uncommon', color: 'green' },
    { id: 'rare', name: 'Rare', color: 'blue' },
    { id: 'epic', name: 'Epic', color: 'purple' },
    { id: 'legendary', name: 'Legendary', color: 'yellow' },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Recently Listed' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'ending', name: 'Ending Soon' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* iOS Navigation Bar with Blur */}
      <div className="blur-backdrop sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="logo-pulse">
                <FaFire className="text-4xl text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FlogIt Arena</h1>
                <p className="text-sm text-gray-500">Trade. Earn. Level Up.</p>
              </div>
            </div>

            {/* Quick Stats - iOS Style */}
            <div className="flex gap-4">
              <div className="ios-card px-6 py-3 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-purple-600">1,234</div>
                <div className="text-xs text-gray-500">Active Listings</div>
              </div>
              <div className="ios-card px-6 py-3 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-green-600">567</div>
                <div className="text-xs text-gray-500">Trades Today</div>
              </div>
              <div className="ios-card px-6 py-3 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-blue-600">892</div>
                <div className="text-xs text-gray-500">Active Traders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-[1920px] mx-auto px-8 py-6">
        <div className="ios-card p-6 mb-6">
          <div className="flex gap-4 mb-4">

            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for items, sellers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'ios-button-gaming shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Rarity Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-gray-500 text-sm font-medium mr-2">
              Filter by Rarity:
            </span>
            {rarities.map((rarity) => (
              <button
                key={rarity.id}
                onClick={() => setSelectedRarity(rarity.id)}
                className={`rarity-badge transition-all ${
                  selectedRarity === rarity.id
                    ? `rarity-${rarity.id} shadow-md`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {rarity.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - User Stats & Quests */}
          <div className="col-span-3 space-y-4">
            {/* User Profile Card */}
            <div className="ios-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md">
                  DU
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">Demo User</h3>
                  <p className="text-gray-500 text-sm">Market Expert</p>
                </div>
              </div>

              <LevelProgress userId={userId} />
            </div>

            {/* Wallet */}
            <FlogWallet userId={userId} compact={false} />

            {/* Quick Actions */}
            <div className="ios-card p-6">
              <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowListItemModal(true)}
                  className="w-full ios-button-gaming py-3 rounded-xl font-semibold shadow-md"
                >
                  + List New Item
                </button>
                <button
                  onClick={() => setShowMysteryBoxModal(true)}
                  className="w-full ios-button-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <FaGift />
                  Open Mystery Box
                </button>
                {/* TEMPORARILY REMOVED - View Leaderboard button */}
              </div>
            </div>

            {/* TEMPORARILY REMOVED - Daily Quests */}
            {/* <QuestTracker userId={userId} /> */}
          </div>

          {/* Center - Marketplace Grid */}
          <div className="col-span-6">
            <MarketplaceItemGrid
              userId={userId}
              searchTerm={searchTerm}
              category={selectedCategory}
              rarity={selectedRarity}
              sortBy={sortBy}
            />
          </div>

          {/* Right Sidebar - Activity */}
          <div className="col-span-3 space-y-4">
            {/* TEMPORARILY REMOVED - Leaderboard */}
            {/* <Leaderboard userId={userId} limit={10} /> */}

            {/* Activity Feed */}
            <ActivityFeed userId={userId} limit={15} showUserOnly={false} />

            {/* Mystery Box Preview */}
            <div className="ios-card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <h3 className="text-yellow-700 font-bold text-lg mb-2 flex items-center gap-2">
                <FaGift className="text-yellow-600" />
                Mystery Boxes
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Try your luck! Open boxes for rare items and FLOG rewards.
              </p>
              <button
                onClick={() => setShowMysteryBoxModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                View All Boxes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMysteryBoxModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mystery Boxes</h2>
              <button
                onClick={() => setShowMysteryBoxModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <MysteryBox userId={userId} userBalance={userBalance} />
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARILY REMOVED - Leaderboard Modal */}

      {showListItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">List New Item</h2>
              <button
                onClick={() => setShowListItemModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ListItemForm userId={userId} onClose={() => setShowListItemModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
