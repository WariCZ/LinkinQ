import { useState, forwardRef, useImperativeHandle } from "react";
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
import { EntitySchema } from "@/lib/entity/types";
import { getLabel } from "../utils";
import { FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

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
}

export const ColumnSelector = forwardRef<
  { getSelectedColumns: () => string[] },
  ColumnSelectorProps
>(({ initialColumns, columns, schema, entity }, ref) => {
  const { t } = useTranslation();
  const [localColumns, setLocalColumns] = useState<string[]>(initialColumns);
  const [searchTerm, setSearchTerm] = useState("");

  useImperativeHandle(ref, () => ({
    getSelectedColumns: () => localColumns,
  }));

  const allColumnKeys = columns.map((c: any) =>
    typeof c === "string" ? c : c.field
  );

  const handleColumnChange = (column: string) => {
    const updated = localColumns.includes(column)
      ? localColumns.filter((c) => c !== column)
      : [...localColumns, column];

    setLocalColumns(updated);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localColumns.indexOf(active.id);
      const newIndex = localColumns.indexOf(over.id);
      setLocalColumns(arrayMove(localColumns, oldIndex, newIndex));
    }
  };

  const handleSelectAll = () => setLocalColumns(allColumnKeys);
  const handleReset = () => setLocalColumns(initialColumns);

  const getColumnKeyAndLabel = (column: any) => {
    const key = typeof column === "string" ? column : column.field;
    const label =
      typeof column === "string"
        ? getLabel({ field: column, schema, entity })
        : column.label || getLabel({ field: column.field, schema, entity });

    return { key, label };
  };

  const filteredColumns = columns.filter((c: any) => {
    const { label } = getColumnKeyAndLabel(c);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRemoveColumn = (key: string) => {
    setLocalColumns((prev) => prev.filter((k) => k !== key));
  };

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
                  checked={localColumns.includes(key)}
                  onChange={() => handleColumnChange(key)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("table.selectedColumns")}</h4>
          <DndContext
            sensors={useSensors(useSensor(PointerSensor))}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localColumns.map((key) => {
                  const col = columns.find((c: any) =>
                    typeof c === "string" ? c === key : c.field === key
                  );
                  if (!col) return null;
                  const { label } = getColumnKeyAndLabel(col);
                  return (
                    <SortableItem
                      key={key}
                      id={key}
                      label={label}
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
