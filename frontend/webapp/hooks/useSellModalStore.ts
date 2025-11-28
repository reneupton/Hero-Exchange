import { create } from 'zustand';

type SellModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useSellModalStore = create<SellModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
