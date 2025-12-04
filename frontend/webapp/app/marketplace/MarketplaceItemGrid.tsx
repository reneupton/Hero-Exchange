'use client';

import { useState, useEffect } from 'react';
import { FaCoins, FaStar, FaEye, FaHeart, FaClock } from 'react-icons/fa';
import RarityBorder from '../gamification/RarityBadge';
import toast from 'react-hot-toast';
import { gamificationService } from '../services/gamificationService';

type MarketplaceItem = {
  id: string;
  name: string;
  description: string;
  price: number; // In FLOG
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  imageUrl?: string;
  emoji?: string;
  seller: {
    id: string;
    name: string;
    level: number;
    rating: number;
  };
  views: number;
  likes: number;
  timeLeft?: string;
  status: 'active' | 'sold' | 'ending-soon';
};

type Props = {
  userId: string;
  searchTerm: string;
  category: string;
  rarity: string;
  sortBy: string;
};

// Demo data - replace with actual API call
const demoItems: MarketplaceItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest model, mint condition',
    price: 1200,
    rarity: 'Legendary',
    category: 'electronics',
    emoji: '📱',
    seller: { id: 's1', name: 'TechGuru', level: 25, rating: 4.9 },
    views: 1234,
    likes: 89,
    timeLeft: '2h 30m',
    status: 'active',
  },
  {
    id: '2',
    name: 'PS5 Console',
    description: 'Barely used, includes 2 controllers',
    price: 550,
    rarity: 'Epic',
    category: 'gaming',
    emoji: '🎮',
    seller: { id: 's2', name: 'GameMaster', level: 18, rating: 4.7 },
    views: 892,
    likes: 64,
    timeLeft: '5h 15m',
    status: 'active',
  },
  {
    id: '3',
    name: 'Designer Sneakers',
    description: 'Limited edition, size 10',
    price: 350,
    rarity: 'Rare',
    category: 'fashion',
    emoji: '👟',
    seller: { id: 's3', name: 'StreetWearKing', level: 12, rating: 4.6 },
    views: 567,
    likes: 42,
    timeLeft: '1h 45m',
    status: 'ending-soon',
  },
  {
    id: '4',
    name: 'Vintage Watch',
    description: 'Classic timepiece from 1980s',
    price: 800,
    rarity: 'Epic',
    category: 'collectibles',
    emoji: '⌚',
    seller: { id: 's4', name: 'TimeKeeper', level: 20, rating: 4.8 },
    views: 445,
    likes: 38,
    timeLeft: '3h 20m',
    status: 'active',
  },
  {
    id: '5',
    name: 'Gaming Laptop',
    description: 'RTX 4080, 32GB RAM',
    price: 1800,
    rarity: 'Legendary',
    category: 'electronics',
    emoji: '💻',
    seller: { id: 's5', name: 'ProGamer', level: 28, rating: 4.9 },
    views: 1556,
    likes: 102,
    timeLeft: '6h 10m',
    status: 'active',
  },
  {
    id: '6',
    name: 'Headphones',
    description: 'Noise cancelling, wireless',
    price: 200,
    rarity: 'Uncommon',
    category: 'electronics',
    emoji: '🎧',
    seller: { id: 's6', name: 'AudioPhile', level: 16, rating: 4.5 },
    views: 334,
    likes: 25,
    timeLeft: '4h 00m',
    status: 'active',
  },
  {
    id: '7',
    name: 'Mechanical Keyboard',
    description: 'Cherry MX switches, RGB',
    price: 180,
    rarity: 'Rare',
    category: 'electronics',
    emoji: '⌨️',
    seller: { id: 's7', name: 'TypeMaster', level: 10, rating: 4.4 },
    views: 423,
    likes: 31,
    timeLeft: '2h 50m',
    status: 'active',
  },
  {
    id: '8',
    name: 'Designer Backpack',
    description: 'Genuine leather, black',
    price: 280,
    rarity: 'Rare',
    category: 'fashion',
    emoji: '🎒',
    seller: { id: 's8', name: 'FashionHub', level: 14, rating: 4.7 },
    views: 298,
    likes: 22,
    timeLeft: '7h 30m',
    status: 'active',
  },
];

export default function MarketplaceItemGrid({ userId, searchTerm, category, rarity, sortBy }: Props) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filtered = demoItems;

      // Filter by category
      if (category !== 'all') {
        filtered = filtered.filter((item) => item.category === category);
      }

      // Filter by rarity
      if (rarity !== 'all') {
        filtered = filtered.filter((item) => item.rarity.toLowerCase() === rarity);
      }

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => b.views - a.views);
      }

      setItems(filtered);
      setLoading(false);
    }, 300);
  }, [searchTerm, category, rarity, sortBy]);

  const handleBuyNow = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowBuyModal(true);
  };

  const handlePlaceBid = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowBidModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    try {
      // Deduct FLOG from wallet via backend
      await gamificationService.deductFlog(
        userId,
        selectedItem.price,
        'Purchase',
        `Purchased ${selectedItem.name}`
      );

      // Award XP for purchase
      await gamificationService.addExperience(userId, 50);

      toast.success(`Purchased ${selectedItem.name} for ${selectedItem.price} FLOG! (+50 XP)`, {
        icon: '🎉',
        duration: 4000,
      });

      setShowBuyModal(false);
      setSelectedItem(null);

      // Trigger wallet refresh
      window.dispatchEvent(new Event('walletUpdate'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete purchase');
    }
  };

  const submitBid = async () => {
    if (!selectedItem || !bidAmount) return;

    try {
      const amount = parseInt(bidAmount);

      // Deduct bid amount from wallet
      await gamificationService.deductFlog(
        userId,
        amount,
        'Bid',
        `Placed bid on ${selectedItem.name}`
      );

      // Award XP for bidding
      await gamificationService.addExperience(userId, 25);

      toast.success(`Bid of ${amount} FLOG placed on ${selectedItem.name}! (+25 XP)`, {
        icon: '🔨',
        duration: 4000,
      });

      setShowBidModal(false);
      setSelectedItem(null);
      setBidAmount('');

      // Trigger wallet refresh
      window.dispatchEvent(new Event('walletUpdate'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    }
  };

  const toggleLike = (itemId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
      toast('Removed from favorites', { icon: '💔' });
    } else {
      newLiked.add(itemId);
      toast.success('Added to favorites!', { icon: '❤️' });
    }
    setLikedItems(newLiked);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'from-gray-600 to-gray-700';
      case 'Uncommon':
        return 'from-green-600 to-green-700';
      case 'Rare':
        return 'from-blue-600 to-blue-700';
      case 'Epic':
        return 'from-purple-600 to-purple-700';
      case 'Legendary':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'shadow-yellow-500/50';
      case 'Epic':
        return 'shadow-purple-500/50';
      case 'Rare':
        return 'shadow-blue-500/50';
      case 'Uncommon':
        return 'shadow-green-500/50';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-900 text-xl">Loading marketplace...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ios-card p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-gray-900 text-2xl font-bold mb-2">No items found</h3>
        <p className="text-gray-600">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between ios-card p-4">
        <div className="text-gray-600">
          Showing <span className="text-gray-900 font-semibold">{items.length}</span> items
        </div>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl overflow-hidden border-2 hover:scale-105 transition-all cursor-pointer shadow-md ${
              item.rarity === 'Legendary'
                ? 'border-yellow-400 shadow-lg shadow-yellow-200 legendary'
                : item.rarity === 'Epic'
                ? 'border-purple-400 shadow-lg shadow-purple-200'
                : item.rarity === 'Rare'
                ? 'border-blue-300'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Item Image/Emoji */}
            <div className={`bg-gradient-to-br ${getRarityColor(item.rarity)} p-8 flex items-center justify-center relative`}>
              <div className="text-7xl">{item.emoji}</div>

              {/* Status Badge */}
              {item.status === 'ending-soon' && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  <FaClock />
                  ENDING SOON
                </div>
              )}

              {/* Rarity Badge */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {item.rarity}
              </div>
            </div>

            {/* Item Details */}
            <div className="p-4">
              {/* Name & Price */}
              <div className="mb-3">
                <h3 className="text-gray-900 font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-1">{item.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-3">
                <FaCoins className="text-yellow-600 text-xl" />
                <div>
                  <div className="text-yellow-600 font-bold text-2xl">{item.price.toLocaleString()}</div>
                  <div className="text-gray-600 text-xs">FLOG</div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {item.seller.name[0]}
                  </div>
                  <div>
                    <div className="text-gray-900 text-sm font-semibold">{item.seller.name}</div>
                    <div className="text-gray-500 text-xs">Level {item.seller.level}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 text-sm">
                  <FaStar />
                  <span>{item.seller.rating}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <FaEye />
                  <span>{item.views}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  className="flex items-center gap-1 hover:scale-110 transition-transform"
                >
                  <FaHeart className={likedItems.has(item.id) ? 'text-red-500' : 'text-gray-400'} />
                  <span>{item.likes + (likedItems.has(item.id) ? 1 : 0)}</span>
                </button>
                <div className="flex items-center gap-1">
                  <FaClock />
                  <span>{item.timeLeft}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyNow(item);
                  }}
                  className="ios-button-gaming py-2 rounded-lg font-semibold shadow-md transition-all text-sm"
                >
                  Buy Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaceBid(item);
                  }}
                  className="bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm"
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-6">
        <button className="ios-button bg-gray-200 text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all shadow-sm">
          Load More Items
        </button>
      </div>

      {/* Buy Now Modal */}
      {showBuyModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Purchase</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{selectedItem.emoji}</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">{selectedItem.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedItem.description}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Price:</span>
                  <div className="flex items-center gap-2">
                    <FaCoins className="text-yellow-600 text-xl" />
                    <span className="text-yellow-600 font-bold text-2xl">{selectedItem.price} FLOG</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="flex-1 ios-button-gaming py-3 rounded-xl font-semibold shadow-lg transition-all"
                >
                  Purchase Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place Bid Modal */}
      {showBidModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Place Bid</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">{selectedItem.emoji}</div>
                <div>
                  <h3 className="text-gray-900 font-bold text-lg">{selectedItem.name}</h3>
                  <p className="text-gray-600 text-sm">Current Price: {selectedItem.price} FLOG</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-900 font-semibold mb-2">Your Bid (FLOG)</label>
                <div className="relative">
                  <FaCoins className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-600" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min: ${selectedItem.price + 1}`}
                    min={selectedItem.price + 1}
                    className="w-full bg-gray-100 text-gray-900 pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBidModal(false);
                    setBidAmount('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBid}
                  disabled={!bidAmount || parseInt(bidAmount) <= selectedItem.price}
                  className="flex-1 ios-button-gaming py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
