import { create } from 'zustand';

type Transaction = {
  id: string;
  buyerId: string;
  sellerId: string;
  itemId?: string;
  amount: number;
  fee: number;
  type: string;
  description: string;
  createdAt: string;
};

type Wallet = {
  userId: string;
  flogBalance: number;
  flogStaked: number;
  totalEarned: number;
  totalSpent: number;
  flogToGBP: number;
  flogToUSD: number;
  flogToEUR: number;
};

type State = {
  wallet: Wallet | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
};

type Actions = {
  setWallet: (wallet: Wallet) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (amount: number) => void;
  reset: () => void;
};

const initialState: State = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

export const useWalletStore = create<State & Actions>((set) => ({
  ...initialState,

  setWallet: (wallet) => set({ wallet }),

  setTransactions: (transactions) => set({ transactions }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  updateBalance: (amount) =>
    set((state) => ({
      wallet: state.wallet
        ? { ...state.wallet, flogBalance: state.wallet.flogBalance + amount }
        : null,
    })),

  reset: () => set(initialState),
}));
