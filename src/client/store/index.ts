import create from "zustand";
import axios from "axios";
import { User } from "../../lib/auth";
import { EntitySchema, FieldType } from "../../lib/entity/types";
import { AppToastType } from "../components/Toast";
import _ from "lodash";

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

  pageflow: any;
  pageflowEntity: any;
  getPageflow: () => Promise<void>;
  getPublicPageflow: () => Promise<void>;

  pages: any;
  setPages: (pages: any) => void;
}

const useStore = create<StoreState>((set, get) => ({
  pages: {},
  schema: {},
  pageflow: {},
  pageflowEntity: {},
  user: null,
  roles: [],
  loading: true,
  sidebar: false,
  userConfigurations: {},
  appConfigurations: {},
  setPages(pages) {
    set({ pages });
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    await get().getPublicPageflow();
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
        await get().getPageflow();
        await get().getSchema();
        await get().getUserConfigurations();
        await get().getAppConfigurations();
      } else {
        set({ user: null });
        await get().getPublicPageflow();
      }
    } catch (error) {
      set({ user: null });
      await get().getPublicPageflow();
    }
  },
  getPublicPageflow: async () => {
    try {
      const response = await axios.get("/pageflow/public", {
        withCredentials: true,
      });
      if (response.data) {
        set({ pageflow: response.data });
      } else {
        set({ pageflow: {} });
      }
    } catch (error) {
      set({ pageflow: {} });
    } finally {
      set({ loading: false });
    }
  },
  getPageflow: async () => {
    try {
      const response = await axios.get("/pageflow/complete", {
        withCredentials: true,
      });
      if (response.data) {
        set({ pageflow: response.data });

        const pageflowEntity = _.filter(response.data, { kind: "2" }).map(
          (d) => {
            return {
              ...d,
              filterFields: _.keys(d.filter),
            };
          }
        );
        set({ pageflowEntity: pageflowEntity });
      } else {
        set({ pageflow: {} });
        set({ pageflowEntity: {} });
      }
    } catch (error) {
      set({ pageflow: {} });
      set({ pageflowEntity: {} });
    } finally {
      set({ loading: false });
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
