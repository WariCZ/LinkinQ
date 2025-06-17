import { useMemo, useState } from "react";
import { MultiTagInput } from "../../common/MultiTagInput";
import { useModalStore } from "../../Modal/modalStore";
import { FieldSelector } from "../../FieldSelector";
import useStore from "../../../store";
import { FieldType } from "../../../../lib/entity/types";
import { useTranslation } from "react-i18next";
import { AppButton } from "../../common/AppButton";
import { FaPlus } from "react-icons/fa";

export const ManualColumnInput = ({
  selected,
  onChange,
  entity,
}: {
  selected: string[];
  onChange: (cols: string[]) => void;
  entity: string;
}) => {
  const { t } = useTranslation();
  const { t: tComponents } = useTranslation("components");
  const schema = useStore((state) => state.schema);
  const { openModal, closeModal } = useModalStore();
  const [input, setInput] = useState("");

  const flattenFields = (
    entity: string,
    prefix = "",
    visited = new Set<string>()
  ): FieldType[] => {
    if (visited.has(entity)) return [];
    visited.add(entity);

    const fields = schema?.[entity]?.fields ?? {};

    return Object.entries(fields).flatMap(([name, meta]) => {
      const fullName = prefix ? `${prefix}.${name}` : name;

      if (meta.type?.startsWith("link(") || meta.type?.startsWith("nlink(")) {
        const linkedEntity = meta.type.match(/\(([^)]+)\)/)?.[1];
        return [
          { ...meta, name: fullName },
          ...flattenFields(linkedEntity, fullName, new Set(visited)),
        ];
      }

      return [{ ...meta, name: fullName }];
    });
  };

  const availableFields = useMemo(
    () => flattenFields(entity).filter((f) => !selected.includes(f.name)),
    [schema, entity, selected]
  );

  const suggestions = useMemo(() => {
    return availableFields.map((f) => ({
      label: f.label ?? f.name,
      value: f.name,
    }));
  }, [availableFields]);

  const getTopLevelFields = (entity: string): FieldType[] => {
    const fields = schema?.[entity]?.fields ?? {};
    return Object.entries(fields).map(([name, meta]) => ({
      ...meta,
      name,
    }));
  };

  const topLevelFields = useMemo(
    () => getTopLevelFields(entity).filter((f) => !selected.includes(f.name)),
    [schema, entity, selected]
  );

  return (
    <div className="w-full">
      <div className="text-sm font-semibold text-gray-700">
        {tComponents("labels.attributes")}:
      </div>

      <div className="pb-2 pt-1 flex justify-between w-full items-center gap-2">
        <MultiTagInput
          values={selected}
          onChange={onChange}
          suggestions={suggestions}
          inputValue={input}
          setInputValue={setInput}
        />
        <AppButton
          icon={<FaPlus />}
          iconPosition="left"
          color="light"
          outline
          onClick={() => {
            openModal(
              <FieldSelector
                fields={topLevelFields}
                onAdd={(field) => {
                  const name = field.name ?? "";
                  if (name && !selected.includes(name)) {
                    onChange([...selected, name]);
                  }
                  closeModal();
                }}
              />,
              {
                title: tComponents("labels.addColumn"),
                hideSuccessButton: true,
              }
            );
          }}
        >
          {t("labels.add")}
        </AppButton>
      </div>
    </div>
  );
};
