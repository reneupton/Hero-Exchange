'use client';

import { useState } from 'react';
import { FaCoins, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { gamificationService } from '../services/gamificationService';

type Props = {
  userId: string;
  onClose: () => void;
};

export default function ListItemForm({ userId, onClose }: Props) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('electronics');
  const [rarity, setRarity] = useState('Common');
  const [emoji, setEmoji] = useState('📦');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'fashion', name: 'Fashion', icon: '👟' },
    { id: 'collectibles', name: 'Collectibles', icon: '💎' },
  ];

  const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const emojiOptions = [
    '📱', '💻', '🎮', '👟', '⌚', '🎧', '⌨️', '🖱️',
    '📷', '🎥', '🎸', '🎹', '🎨', '📚', '💎', '👑',
    '🏆', '🎯', '🎪', '🎭', '🎬', '📦', '🎁', '✨',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName || !description || !price) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Award FLOG bonus for listing an item (10 FLOG)
      await gamificationService.addFlog(
        userId,
        10,
        'ItemListed',
        `Listed ${itemName}`
      );

      // Award XP for listing (25 XP)
      await gamificationService.addExperience(userId, 25);

      toast.success(`Listed ${itemName} for ${price} FLOG! (+10 FLOG, +25 XP)`, {
        icon: '✅',
        duration: 4000,
      });

      // Trigger wallet refresh
      window.dispatchEvent(new Event('walletUpdate'));

      onClose();

      // Reset form
      setItemName('');
      setDescription('');
      setPrice('');
      setCategory('electronics');
      setRarity('Common');
      setEmoji('📦');
    } catch (error: any) {
      toast.error(error.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div>
        <label className="block text-white font-semibold mb-2">Item Name</label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g., iPhone 15 Pro"
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-white font-semibold mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your item..."
          rows={4}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-white font-semibold mb-2">Price (FLOG)</label>
        <div className="relative">
          <FaCoins className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400" />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            min="1"
            className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-white font-semibold mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                category === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity */}
      <div>
        <label className="block text-white font-semibold mb-2">Rarity</label>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 outline-none cursor-pointer"
        >
          {rarities.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-white font-semibold mb-2">Item Icon</label>
        <div className="grid grid-cols-8 gap-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
          {emojiOptions.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-3xl p-2 rounded-lg transition-all ${
                emoji === e
                  ? 'bg-purple-600 scale-110'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-3">Preview</h3>
        <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-4">
          <div className="text-6xl">{emoji}</div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">{itemName || 'Your Item'}</h4>
            <p className="text-gray-400 text-sm">{description || 'Description will appear here'}</p>
            <div className="flex items-center gap-2 mt-2">
              <FaCoins className="text-yellow-400" />
              <span className="text-yellow-400 font-bold">{price || '0'} FLOG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Listing...' : 'List Item'}
        </button>
      </div>
    </form>
  );
}
