import create from "zustand";

interface ModalData {
  content: React.ReactNode | ((props: any) => React.ReactNode);
  options?: {
    title?: string;
    size?: "sm" | "md" | "lg" | "xl";
    modalSingle?: boolean;
    modalOnSuccess?: (data?: any) => void;
  };
}
interface StoreState {
  modals: ModalData[];
  openModal: (content: React.ReactNode | ((props: any) => React.ReactNode), options?: ModalData["options"]) => void;
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
