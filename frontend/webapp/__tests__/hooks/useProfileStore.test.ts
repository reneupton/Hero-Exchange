import { act, renderHook } from '@testing-library/react';
import { useProfileStore } from '@/hooks/useProfileStore';
import { PlayerProfile } from '@/types';

const mockProfile: PlayerProfile = {
  username: 'testUser',
  avatarUrl: 'https://example.com/avatar.png',
  level: 10,
  experience: 500,
  nextLevelAt: 1000,
  flogBalance: 5000,
  goldBalance: 5000,
  totalHeroPower: 1500,
  auctionsCreated: 5,
  auctionsSold: 3,
  auctionsWon: 2,
  bidsPlaced: 15,
  lastDailyReward: '2025-11-28T00:00:00Z',
  ownedHeroes: [
    {
      heroId: 'hero1',
      variantId: 'hero1-legendary',
      name: 'Test Hero',
      discipline: 'Warrior',
      rarity: 'Legendary',
      strength: 100,
      intellect: 50,
      vitality: 80,
      agility: 70,
    },
  ],
};

const mockLeaderboard: PlayerProfile[] = [
  mockProfile,
  {
    ...mockProfile,
    username: 'user2',
    level: 15,
    totalHeroPower: 2000,
  },
  {
    ...mockProfile,
    username: 'user3',
    level: 8,
    totalHeroPower: 1000,
  },
];

describe('useProfileStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useProfileStore.setState({ profile: undefined, leaderboard: [] });
    });
  });

  describe('initial state', () => {
    it('should have undefined profile initially', () => {
      const { result } = renderHook(() => useProfileStore());

      expect(result.current.profile).toBeUndefined();
    });

    it('should have empty leaderboard initially', () => {
      const { result } = renderHook(() => useProfileStore());

      expect(result.current.leaderboard).toEqual([]);
    });
  });

  describe('setProfile', () => {
    it('should set the user profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.profile?.username).toBe('testUser');
      expect(result.current.profile?.level).toBe(10);
    });

    it('should update existing profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      const updatedProfile = {
        ...mockProfile,
        level: 11,
        experience: 600,
        flogBalance: 5500,
      };

      act(() => {
        result.current.setProfile(updatedProfile);
      });

      expect(result.current.profile?.level).toBe(11);
      expect(result.current.profile?.experience).toBe(600);
      expect(result.current.profile?.flogBalance).toBe(5500);
    });

    it('should allow clearing the profile', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });
      expect(result.current.profile).toBeDefined();

      act(() => {
        result.current.setProfile(undefined);
      });
      expect(result.current.profile).toBeUndefined();
    });

    it('should handle profile with owned heroes', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      expect(result.current.profile?.ownedHeroes).toHaveLength(1);
      expect(result.current.profile?.ownedHeroes?.[0].name).toBe('Test Hero');
      expect(result.current.profile?.ownedHeroes?.[0].rarity).toBe('Legendary');
    });
  });

  describe('setLeaderboard', () => {
    it('should set the leaderboard', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLeaderboard(mockLeaderboard);
      });

      expect(result.current.leaderboard).toHaveLength(3);
      expect(result.current.leaderboard[0].username).toBe('testUser');
    });

    it('should replace existing leaderboard', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLeaderboard(mockLeaderboard);
      });
      expect(result.current.leaderboard).toHaveLength(3);

      const newLeaderboard = [mockProfile];
      act(() => {
        result.current.setLeaderboard(newLeaderboard);
      });

      expect(result.current.leaderboard).toHaveLength(1);
    });

    it('should allow setting empty leaderboard', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setLeaderboard(mockLeaderboard);
      });

      act(() => {
        result.current.setLeaderboard([]);
      });

      expect(result.current.leaderboard).toEqual([]);
    });
  });

  describe('store persistence', () => {
    it('should maintain profile and leaderboard independently', () => {
      const { result } = renderHook(() => useProfileStore());

      act(() => {
        result.current.setProfile(mockProfile);
      });

      act(() => {
        result.current.setLeaderboard(mockLeaderboard);
      });

      // Both should be set
      expect(result.current.profile?.username).toBe('testUser');
      expect(result.current.leaderboard).toHaveLength(3);

      // Updating one shouldn't affect the other
      act(() => {
        result.current.setProfile(undefined);
      });

      expect(result.current.profile).toBeUndefined();
      expect(result.current.leaderboard).toHaveLength(3);
    });
  });
});
