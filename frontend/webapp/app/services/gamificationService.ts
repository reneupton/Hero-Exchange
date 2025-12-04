const BASE_URL = process.env.NEXT_PUBLIC_GAMIFICATION_API_URL || 'http://localhost:7004';

export const gamificationService = {
  // Wallet endpoints
  async getWallet(userId: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return res.json();
  },

  async getBalance(userId: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/balance`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },

  async getTransactionHistory(userId: string, limit = 50) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/transactions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async stakeFlog(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/stake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to stake Gold');
    return res.json();
  },

  async unstakeFlog(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/unstake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to unstake Gold');
    return res.json();
  },

  // Gamification endpoints
  async getUserGamification(userId: string) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user gamification');
    return res.json();
  },

  async addExperience(userId: string, amount: number) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}/xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to add experience');
    return res.json();
  },

  async updateLoginStreak(userId: string) {
    const res = await fetch(`${BASE_URL}/api/gamification/${userId}/login`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to update login streak');
    return res.json();
  },

  async getLeaderboard(limit = 100) {
    const res = await fetch(`${BASE_URL}/api/gamification/leaderboard?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  },

  // Quest endpoints
  async getDailyQuests() {
    const res = await fetch(`${BASE_URL}/api/quests/daily`);
    if (!res.ok) throw new Error('Failed to fetch daily quests');
    return res.json();
  },

  async getUserQuestProgress(userId: string) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/progress`);
    if (!res.ok) throw new Error('Failed to fetch quest progress');
    return res.json();
  },

  async updateQuestProgress(userId: string, questType: string, incrementAmount = 1) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questType, incrementAmount }),
    });
    if (!res.ok) throw new Error('Failed to update quest progress');
    return res.json();
  },

  async claimQuestReward(userId: string, questProgressId: string) {
    const res = await fetch(`${BASE_URL}/api/quests/${userId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questProgressId }),
    });
    if (!res.ok) throw new Error('Failed to claim quest reward');
    return res.json();
  },

  // Achievement endpoints
  async getAllAchievements() {
    const res = await fetch(`${BASE_URL}/api/achievements`);
    if (!res.ok) throw new Error('Failed to fetch achievements');
    return res.json();
  },

  async getUserAchievements(userId: string) {
    const res = await fetch(`${BASE_URL}/api/achievements/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch user achievements');
    return res.json();
  },

  async unlockAchievement(userId: string, achievementId: string) {
    const res = await fetch(`${BASE_URL}/api/achievements/${userId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId }),
    });
    if (!res.ok) throw new Error('Failed to unlock achievement');
    return res.json();
  },

  // Activity feed endpoints
  async getRecentActivity(limit = 50) {
    const res = await fetch(`${BASE_URL}/api/activityfeed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch activity feed');
    return res.json();
  },

  async getUserActivity(userId: string, limit = 50) {
    const res = await fetch(`${BASE_URL}/api/activityfeed/${userId}?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch user activity');
    return res.json();
  },

  // Mystery box endpoints
  async getAllMysteryBoxes() {
    const res = await fetch(`${BASE_URL}/api/mysteryboxes`);
    if (!res.ok) throw new Error('Failed to fetch mystery boxes');
    return res.json();
  },

  async openBox(userId: string, boxId: string) {
    const res = await fetch(`${BASE_URL}/api/mysteryboxes/${userId}/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boxId }),
    });
    if (!res.ok) throw new Error('Failed to open mystery box');
    return res.json();
  },

  // Marketplace/Transaction endpoints
  async purchaseItem(userId: string, itemId: string, price: number) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: price,
        transactionType: 'Purchase',
        description: `Purchased item ${itemId}`
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to purchase item');
    }
    return res.json();
  },

  async addFlog(userId: string, amount: number, transactionType: string, description: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, transactionType, description }),
    });
    if (!res.ok) throw new Error('Failed to add FLOG');
    return res.json();
  },

  async deductFlog(userId: string, amount: number, transactionType: string, description: string) {
    const res = await fetch(`${BASE_URL}/api/wallet/${userId}/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, transactionType, description }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Insufficient FLOG balance');
    }
    return res.json();
  },

  // Marketplace endpoints
  async getMarketplaceItems(category?: string, rarity?: string, minPrice?: number, maxPrice?: number, sortBy?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (rarity) params.append('rarity', rarity);
    if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
    if (sortBy) params.append('sortBy', sortBy);

    const res = await fetch(`${BASE_URL}/api/marketplace?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch marketplace items');
    return res.json();
  },

  async getMarketplaceItem(itemId: string) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${itemId}`);
    if (!res.ok) throw new Error('Failed to fetch item');
    return res.json();
  },

  async purchaseMarketplaceItem(userId: string, itemId: string) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${userId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to purchase item');
    }
    return res.json();
  },

  async placeBid(userId: string, itemId: string, bidAmount: number) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${userId}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, bidAmount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to place bid');
    }
    return res.json();
  },

  async getUserInventory(userId: string) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${userId}/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async listInventoryItem(userId: string, inventoryItemId: string, buyNowPrice: number, startingBidPrice?: number, durationDays = 7) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${userId}/list-inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryItemId, buyNowPrice, startingBidPrice, durationDays }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to list item');
    }
    return res.json();
  },

  async createMarketplaceListing(userId: string, listing: {
    name: string;
    description: string;
    buyNowPrice: number;
    startingBidPrice?: number;
    emoji: string;
    category: string;
    rarity: string;
    condition: string;
    durationDays?: number;
  }) {
    const res = await fetch(`${BASE_URL}/api/marketplace/${userId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create listing');
    }
    return res.json();
  },
};
