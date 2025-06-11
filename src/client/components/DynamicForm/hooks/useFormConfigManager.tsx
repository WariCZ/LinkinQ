import { useAppConfigurations } from "../../../hooks/useAppConfigurations";
import { useFormConfigStore } from "../_store";
import useStore from "../../../store";
import { FormFieldType } from "../../../types/DynamicForm/types";
import { useEffect, useMemo } from "react";
import _ from "lodash";

export function useFormConfigManager(
  configKey: string,
  defaultFields?: (FormFieldType | string)[],
  isConfigurable?: boolean
) {
  const onlyFields = useMemo(
    () =>
      defaultFields?.filter((f): f is FormFieldType => typeof f === "object"),
    [defaultFields]
  );

  const {
    localFields,
    setLocalFields,
    setDefaultFields,
    setEditingFields,
    applyEditingFields,
  } = useFormConfigStore();

  const appConfigurations = useStore((s) => s.appConfigurations);
  const { saveAppConfiguration } = useAppConfigurations();

  useEffect(() => {
    setDefaultFields(onlyFields ?? []);

    const saved = appConfigurations[configKey]?.definition;

    if (saved) {
      setLocalFields(saved);
      setEditingFields(_.cloneDeep(saved)); // ключевой момент
    } else {
      setLocalFields(onlyFields ?? []);
      setEditingFields(_.cloneDeep(onlyFields ?? [])); // тоже клонируем
    }
  }, [configKey]);

  const saveFormLayout = async () => {
    const currentEditingFields = useFormConfigStore.getState().editingFields;

    await saveAppConfiguration(configKey, currentEditingFields);
    applyEditingFields(); // применить только после успешного сохранения
  };

  const resetFormLayout = () => {
    setEditingFields(onlyFields ?? []);
  };

  return {
    activeFields: isConfigurable ? localFields : defaultFields,
    saveFormLayout,
    resetFormLayout,
  };
}
