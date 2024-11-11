import create from "zustand";
import axios from "axios";
import { User } from "@/lib/auth";

interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  checkAuth: () => void;
}

const useStore = create<StoreState>((set) => ({
  user: null,
  roles: [],
  loading: true,
  setUser: (user) => set({ user }),
  logout: async () => {
    await axios.post("/logout");
    set({ user: null });
    window.location.reload();
  },
  setLoading: (loading) => {
    set({ loading });
  },
  checkAuth: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/checkAuth", {
        withCredentials: true,
      });
      if (response.data.user) {
        set({ user: response.data.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStore;
