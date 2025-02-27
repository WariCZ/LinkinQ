import { ModalSizes } from "flowbite-react";
import create from "zustand";

export interface ModalData {
  content: React.ReactNode;
  options?: {
    title?: string;
    size?: keyof ModalSizes;
    modalSingle?: boolean;
    [key: string]: any;
  };
}

interface StoreState {
  modals: ModalData[];
  openModal: (content: React.ReactNode, options?: ModalData["options"]) => void;
  closeModal: () => void;
}

export const useModalStore = create<StoreState>((set) => ({
  modals: [],
  openModal: (content, options = {}) => {
    set((state) => ({
      modals: options.modalSingle ? [{ content, options }] : [...state.modals, { content, options }],
    }));
  },
  closeModal: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
}));
