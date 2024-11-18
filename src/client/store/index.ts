import create from "zustand";
import axios from "axios";
import { User } from "@/lib/auth";
import { EntitySchema, FieldType } from "@/lib/entity/types";

type GuiEntitySchema = Record<string, FieldType>;
interface StoreState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  checkAuth: () => void;
  getSchema: () => void;
  firstLoad: () => void;
  schema: EntitySchema;
}

const useStore = create<StoreState>((set, get) => ({
  schema: {},
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
  firstLoad: async () => {
    set({ loading: true });
    try {
      await get().checkAuth();
      await get().getSchema();
    } catch (error) {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  checkAuth: async () => {
    // set({ loading: true });
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
      // set({ loading: false });
    }
  },
  getSchema: async () => {
    try {
      const response = await axios.get("/api/schema", {
        withCredentials: true,
      });
      if (response.data) {
        set({ schema: response.data });
      } else {
        set({ schema: {} });
      }
    } catch (error) {
      set({ schema: {} });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useStore;
