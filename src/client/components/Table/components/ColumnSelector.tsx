import {
  useState,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RxDragHandleDots2 } from "react-icons/rx";
import { Button, Checkbox, TextInput } from "flowbite-react";
import { TableFieldType } from "../types";
import { EntitySchema, FieldType } from "../../../../lib/entity/types";
import { getLabel } from "../utils";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useModalStore } from "../../Modal/modalStore";
import { FieldSelector } from "../../FieldSelector";

interface SortableItemProps {
  id: string;
  label: string;
  onRemove: (id: string) => void;
}

function SortableItem({ id, label, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="flex items-center justify-between gap-2 bg-white border rounded-md shadow-sm px-2 py-1 hover:shadow-sm transition"
      style={style}
    >
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 cursor-grab select-none"
      >
        <RxDragHandleDots2
          className="text-gray-400 hover:text-gray-600"
          size={18}
        />
        <span className="truncate max-w-[160px]">{label}</span>
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          title="Remove"
          className="text-gray-400 hover:text-red-500 transition p-1"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
interface ColumnSelectorProps {
  initialColumns: string[];
  columns: TableFieldType[];
  schema: EntitySchema;
  entity: string;
  setSelectedColumns: Dispatch<SetStateAction<string[]>>;
}

export const ColumnSelector = forwardRef<
  { getSelectedColumns: () => string[] },
  ColumnSelectorProps
>(({ initialColumns, columns, schema, entity }, ref) => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalStore();
  const [localColumns, setLocalColumns] = useState<string[]>(initialColumns);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    return new Set(initialColumns); 
  });
  const [searchTerm, setSearchTerm] = useState("");

  useImperativeHandle(ref, () => ({
    getSelectedColumns: () =>
      localColumns.filter((key) => visibleColumns.has(key)),
  }));

  const allKeys = Array.from(
    new Set([
      ...columns.map((c) => (typeof c === "string" ? c : c.field)),
      ...localColumns,
    ])
  );

  const combinedColumns = allKeys.map((key) => {
    const existing = columns.find(
      (c) => (typeof c === "string" ? c : c.field) === key
    );
    return existing || { field: key };
  });

  const getColumnKeyAndLabel = (column: any) => {
    const key = typeof column === "string" ? column : column.field;
    const label =
      typeof column === "string"
        ? getLabel({ field: column, schema, entity })
        : column.label || getLabel({ field: column.field, schema, entity });

    return { key, label };
  };

  const filteredColumns = combinedColumns.filter((c: any) => {
    const { label } = getColumnKeyAndLabel(c);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCheckboxChange = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        setLocalColumns((cols) => (cols.includes(key) ? cols : [...cols, key]));
      }
      return next;
    });
  };

  const handleRemoveColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localColumns.indexOf(active.id);
      const newIndex = localColumns.indexOf(over.id);
      setLocalColumns(arrayMove(localColumns, oldIndex, newIndex));
    }
  };

  const handleSelectAll = () => {
    setVisibleColumns(new Set(localColumns));
  };

  const handleReset = () => {
    setLocalColumns(initialColumns);
    setVisibleColumns(new Set(initialColumns));
  };

  const usedKeys = allKeys;
  const availableFields: FieldType[] = Object.entries(
    schema?.[entity]?.fields ?? {}
  )
    .filter(([name]) => !usedKeys.includes(name))
    .map(([name, meta]) => ({ ...meta, name }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2 items-center">
        <TextInput
          type="text"
          placeholder="Search columns..."
          value={searchTerm}
          className="flex-1"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSelectAll}>{t("table.selectAll")}</Button>
        <Button onClick={handleReset} color="gray">
          {t("table.reset")}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
        <div className="space-y-3 mt-2">
          {filteredColumns.map((c: any) => {
            const { key, label } = getColumnKeyAndLabel(c);
            return (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer pl-1"
              >
                <Checkbox
                  checked={visibleColumns.has(key)}
                  onChange={() => handleCheckboxChange(key)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>{label || key}</span>
              </label>
            );
          })}

          <Button
            size="xs"
            className="mt-4"
            onClick={() => {
              openModal(
                <FieldSelector
                  fields={availableFields}
                  allowNested={false}
                  usedFields={new Set(allKeys)}
                  onAdd={(field) => {
                    const name = field.name ?? "";
                    setLocalColumns((prev) => [...prev, name]);
                    closeModal();
                  }}
                />,

                {
                  title: "Add column",
                  hideSuccessButton: true,
                }
              );
            }}
          >
            + Add column
          </Button>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("table.selectedColumns")}</h4>
          <DndContext
            sensors={useSensors(useSensor(PointerSensor))}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns.filter((key) => visibleColumns.has(key))}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localColumns
                  .filter((key) => visibleColumns.has(key))
                  .map((key) => {
                    const col = columns.find(
                      (c: any) => (typeof c === "string" ? c : c.field) === key
                    );
                    const { label } = getColumnKeyAndLabel(
                      col || { field: key }
                    );
                    return (
                      <SortableItem
                        key={key}
                        id={key}
                        label={label || key}
                        onRemove={handleRemoveColumn}
                      />
                    );
                  })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
});
