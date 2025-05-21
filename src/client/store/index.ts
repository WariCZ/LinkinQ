import create from "zustand";
import axios from "axios";
import { User } from "../../lib/auth";
import { EntitySchema, FieldType } from "../../lib/entity/types";
import { AppToastType } from "../components/Toast";

type GuiEntitySchema = Record<string, FieldType>;
interface StoreState {
  logout: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  checkAuth: () => void;
  firstLoad: () => void;

  user: User | null;
  setUser: (user: User) => void;

  schema: EntitySchema;
  getSchema: () => void;

  sidebar: boolean;
  setSidebar: (sidebar: boolean) => void;

  toasts: AppToastType[];
  setToast: (toast: AppToastType) => void;
  removeToast: (item: number) => void;

  userConfigurations: Record<string, any>;
  getUserConfigurations: () => Promise<void>;

  appConfigurations: Record<string, any>;
  getAppConfigurations: () => Promise<void>;
}

const useStore = create<StoreState>((set, get) => ({
  schema: {},
  user: null,
  roles: [],
  loading: true,
  sidebar: false,
  userConfigurations: {},
  appConfigurations: {},
  setUser: (user) => set({ user }),
  logout: async () => {
    await axios.post("/logout");
    set({ user: null });
  },
  setSidebar: (sidebar) => {
    set({ sidebar });
  },
  setLoading: (loading) => {
    set({ loading });
  },
  firstLoad: async () => {
    set({ loading: true });
    try {
      await get().checkAuth();
      await get().getSchema();
      await get().getUserConfigurations();
      await get().getAppConfigurations();
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
  getUserConfigurations: async () => {
    try {
      const response = await axios.get("/api/entity/userConfigurations", {
        withCredentials: true,
      });
      const configs = response.data || [];
      const configMap = configs.reduce(
        (acc: Record<string, any>, item: any) => {
          acc[item.key] = item;
          return acc;
        },
        {}
      );
      set({ userConfigurations: configMap });
    } catch (error) {
      console.error("Failed to fetch user configurations", error);
      set({ userConfigurations: {} });
    }
  },
  getAppConfigurations: async () => {
    try {
      const response = await axios.get("/api/entity/appConfigurations", {
        withCredentials: true,
      });
      const configs = response.data || [];
      const configMap = configs.reduce(
        (acc: Record<string, any>, item: any) => {
          acc[item.key] = item;
          return acc;
        },
        {}
      );
      set({ appConfigurations: configMap });
    } catch (error) {
      console.error("Failed to fetch app configurations", error);
      set({ appConfigurations: {} });
    }
  },
  toasts: [
    // { msg: "test 1", type: "error" },
    // { msg: "test 2", type: "info" },
  ],
  setToast: (toast) => {
    const toasts = [...get().toasts, toast];
    set({ toasts });
  },
  removeToast: (item) => {
    get().toasts.splice(item, 1);
    const toasts = [...get().toasts];
    set({ toasts });
  },
}));

export default useStore;
