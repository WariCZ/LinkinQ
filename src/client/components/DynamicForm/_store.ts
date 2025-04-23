import { FormFieldType } from "@/client/types/DynamicForm/types";
import { create } from "zustand";

type FormConfigState = {
  entity: string | null;
  defaultFields: FormFieldType[];
  localFields: FormFieldType[];
  kind: number | null;
  setDefaultFields: (fields: FormFieldType[]) => void;
  setKind: (kind: number) => void;
  setEntity: (entity: string) => void;
  setLocalFields: (fields: FormFieldType[]) => void;
  resetLocalFields: () => void;
  saveConfig: () => void;
  getActiveFields: () => FormFieldType[] | [];
};

export const useFormConfigStore = create<FormConfigState>((set, get) => ({
  entity: "task",
  defaultFields: [],
  localFields: [],
  kind: 1,
  setEntity: (entity) => set({ entity }),
  setKind: (kind) => {
    const entity = "task";
    const key = `formLayout_${entity}_kind_${kind}`;
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : null;
    set({
      kind,
      localFields: parsed ?? get().defaultFields,
    });
  },
  setDefaultFields: (fields) => set({ defaultFields: fields }),
  saveConfig: () => {
    const { entity, kind, localFields } = get();
    if (!entity || kind === null) return;
    const key = `formLayout_${entity}_kind_${kind}`;
    localStorage.setItem(key, JSON.stringify(localFields));
  },
  getActiveFields: () => {
    const { entity, kind, defaultFields } = get();
    const key = `formLayout_${entity}_kind_${kind}`;
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ?? defaultFields;
  },
  setLocalFields: (fields) => set({ localFields: fields }),
  resetLocalFields: () => {
    const { entity, kind, defaultFields } = get();
    const key = `formLayout_${entity}_kind_${kind}`;
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : null;
    set({ localFields: parsed ?? defaultFields });
  },
}));
