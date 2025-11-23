import { create } from 'zustand';

type UserGamification = {
  userId: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  title: string;
  streakDays: number;
  achievementCount: number;
  completedQuestsCount: number;
};

type Achievement = {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  flogReward: number;
  category: string;
  rarity: string;
};

type UserAchievement = {
  achievement: Achievement;
  unlockedAt: string;
};

type Quest = {
  id: string;
  name: string;
  description: string;
  type: string;
  target: number;
  flogReward: number;
  xpReward: number;
};

type QuestProgress = {
  id: string;
  quest: Quest;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: string;
};

type State = {
  userGamification: UserGamification | null;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  questProgress: QuestProgress[];
  showLevelUp: boolean;
  showAchievement: Achievement | null;
  loading: boolean;
};

type Actions = {
  setUserGamification: (data: UserGamification) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setUserAchievements: (userAchievements: UserAchievement[]) => void;
  setQuestProgress: (questProgress: QuestProgress[]) => void;
  addXP: (amount: number) => void;
  levelUp: (newLevel: number, newTitle: string) => void;
  unlockAchievement: (achievement: Achievement) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  setShowLevelUp: (show: boolean) => void;
  setShowAchievement: (achievement: Achievement | null) => void;
  reset: () => void;
};

const initialState: State = {
  userGamification: null,
  achievements: [],
  userAchievements: [],
  questProgress: [],
  showLevelUp: false,
  showAchievement: null,
  loading: false,
};

export const useGamificationStore = create<State & Actions>((set) => ({
  ...initialState,

  setUserGamification: (data) => set({ userGamification: data }),

  setAchievements: (achievements) => set({ achievements }),

  setUserAchievements: (userAchievements) => set({ userAchievements }),

  setQuestProgress: (questProgress) => set({ questProgress }),

  addXP: (amount) =>
    set((state) => ({
      userGamification: state.userGamification
        ? { ...state.userGamification, xp: state.userGamification.xp + amount }
        : null,
    })),

  levelUp: (newLevel, newTitle) =>
    set((state) => ({
      userGamification: state.userGamification
        ? { ...state.userGamification, level: newLevel, title: newTitle, xp: 0 }
        : null,
      showLevelUp: true,
    })),

  unlockAchievement: (achievement) =>
    set((state) => ({
      userAchievements: [
        ...state.userAchievements,
        { achievement, unlockedAt: new Date().toISOString() },
      ],
      showAchievement: achievement,
    })),

  updateQuestProgress: (questId, progress) =>
    set((state) => ({
      questProgress: state.questProgress.map((qp) =>
        qp.quest.id === questId
          ? { ...qp, progress, completed: progress >= qp.target }
          : qp
      ),
    })),

  setShowLevelUp: (show) => set({ showLevelUp: show }),

  setShowAchievement: (achievement) => set({ showAchievement: achievement }),

  reset: () => set(initialState),
}));
