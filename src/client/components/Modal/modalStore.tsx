// modalStore.js
import create from "zustand";

interface StoreState {
  modals: any[];
  openModal: (
    content: React.ReactNode | ((props: any) => React.ReactNode)
  ) => void;
  closeModal: () => void;
}

export const useModalStore = create<StoreState>((set) => ({
  modals: [],
  openModal: (content: any) => {
    debugger;
    if (content.props.modalSingle) {
      set(() => ({
        modals: [content],
      }));
    } else {
      set((state) => ({
        modals: [...state.modals, content],
      }));
    }
  },
  closeModal: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
}));
