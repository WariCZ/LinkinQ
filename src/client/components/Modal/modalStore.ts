import { LazyExoticComponent } from "react";
import create from "zustand";

interface ModalData {
  content:
    | React.ReactNode
    | ((props: any) => React.ReactNode)
    | LazyExoticComponent<any>;
  options?: {
    title?: string;
    size?:
      | "sm"
      | "md"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl"
      | "7xl";
    modalSingle?: boolean;
    modalOnSuccess?: (data?: any) => void;
    additionalButtons?: any;
    hideSuccessButton?: boolean;
  };
}
interface StoreState {
  modals: ModalData[];
  openModal: (
    content:
      | React.ReactNode
      | ((props: any) => React.ReactNode)
      | LazyExoticComponent<any>,
    options?: ModalData["options"]
  ) => void;
  closeModal: () => void;
}

export const useModalStore = create<StoreState>((set) => ({
  modals: [],
  openModal: (content, options = {}) => {
    set((state) => ({
      modals: options.modalSingle
        ? [{ content, options }]
        : [...state.modals, { content, options }],
    }));
  },
  closeModal: () => set((state) => ({ modals: state.modals.slice(0, -1) })),
}));
