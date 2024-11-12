// modalStore.js
import create from "zustand";

interface StoreState {
  modals: any[];
  openModal: (modal: any, onSave?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<StoreState>((set) => ({
  modals: [],
  openModal: (content, onSave) =>
    set((state) => ({
      modals: [...state.modals, { content, onSave }],
    })),
  closeModal: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
}));
