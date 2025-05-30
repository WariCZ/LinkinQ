import { FormFieldType } from "../../types/DynamicForm/types";
import { create } from "zustand";

type FormConfigState = {
  defaultFields: FormFieldType[];
  localFields: FormFieldType[];
  kind: number | null;
  setDefaultFields: (fields: FormFieldType[]) => void;
  setKind: (kind: number) => void;
  setLocalFields: (fields: FormFieldType[]) => void;
  editingFields: FormFieldType[];
  setEditingFields: (fields: FormFieldType[]) => void;
  applyEditingFields: () => void;
};

export const useFormConfigStore = create<FormConfigState>((set, get) => ({
  defaultFields: [],
  localFields: [],
  editingFields: [],
  kind: 2,
  setKind: (kind) => {
    set({ kind });
  },
  setDefaultFields: (fields) => set({ defaultFields: fields }),
  setLocalFields: (fields) => set({ localFields: fields }),
  setEditingFields: (fields) => set({ editingFields: fields }),
  applyEditingFields: () =>
    set((state) => ({ localFields: state.editingFields })),
}));
