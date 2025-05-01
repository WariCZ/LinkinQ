import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTrashAlt, FaCog } from "react-icons/fa";
import {
  FormFieldType,
  SectionType,
} from "../../../../../client/types/DynamicForm/types";
import { useFormConfigStore } from "../../_store";

type FieldListProps = {
  onEditSection: (sectionIndex: number) => void;
  onEditField: (sectionIndex: number, fieldIndex: number) => void;
  onDelete: (sectionIndex: number, fieldIndex: number) => void;
  onReorder: (sectionIndex: number, newFields: FormFieldType[]) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onReorderSections: (newSections: FormFieldType[]) => void;
};

export const FieldList = ({
  onDelete,
  onReorder,
  onDeleteSection,
  onReorderSections,
  onEditSection,
  onEditField,
}: FieldListProps) => {
  const { editingFields } = useFormConfigStore();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const [activeType, ...activeIndexes] = (active.id as string).split("-");
    const [overType, ...overIndexes] = (over.id as string).split("-");

    const updated = [...editingFields];

    // 1. Drag section (e.g., section-0)
    if (activeType === "section" && overType === "section") {
      const fromIndex = Number(activeIndexes[0]);
      const toIndex = Number(overIndexes[0]);
      const newFields = arrayMove(updated, fromIndex, toIndex);
      onReorderSections(newFields);
      return;
    }

    // 2. Drag standalone field (e.g., field-1) between other standalone fields
    if (
      activeType === "field" &&
      overType === "field" &&
      activeIndexes.length === 1 &&
      overIndexes.length === 1
    ) {
      const fromIndex = Number(activeIndexes[0]);
      const toIndex = Number(overIndexes[0]);
      const newFields = arrayMove(updated, fromIndex, toIndex);
      onReorderSections(newFields);
      return;
    }

    // 3. Drag field from one section to another
    if (
      activeType === "field" &&
      overType === "field" &&
      activeIndexes.length === 2 &&
      overIndexes.length === 2
    ) {
      const [fromSectionIdx, fromFieldIdx] = activeIndexes.map(Number);
      const [toSectionIdx, toFieldIdx] = overIndexes.map(Number);

      const fromSection = updated[fromSectionIdx] as SectionType;
      const toSection = updated[toSectionIdx] as SectionType;

      if (
        !Array.isArray(fromSection.fields) ||
        !Array.isArray(toSection.fields)
      )
        return;

      const [movedField] = fromSection.fields.splice(fromFieldIdx, 1);
      toSection.fields.splice(toFieldIdx, 0, movedField);

      onReorder(fromSectionIdx, [...fromSection.fields]);
      if (fromSectionIdx !== toSectionIdx) {
        onReorder(toSectionIdx, [...toSection.fields]);
      }
      return;
    }
  };

  return (
    <div className="mb-6">
      <table className="w-full text-sm border-t">
        <thead className="text-left text-xs text-gray-500 uppercase border-b">
          <tr>
            <th className="py-2 px-3"></th>
            <th className="py-2 px-3">Path</th>
            <th className="py-2 px-3">Label</th>
            <th className="py-2 px-3">Description</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={editingFields.map((f, i) =>
                f.type === "Section" ? `section-${i}` : `field-${i}`
              )}
              strategy={verticalListSortingStrategy}
            >
              {editingFields.map((field, index) => {
                if (field.type === "Section" && Array.isArray(field.fields)) {
                  return (
                    <SortableSection
                      key={`section-${index}`}
                      id={`section-${index}`}
                      section={field}
                      sectionIndex={index}
                      onEditSection={onEditSection}
                      onEditField={onEditField}
                      onDelete={onDelete}
                      onReorder={onReorder}
                      onDeleteSection={onDeleteSection}
                    />
                  );
                }

                return (
                  <SortableRow
                    key={`field-${index}`}
                    id={`field-${index}`}
                    field={field}
                    onEdit={() => onEditField?.(null, index)}
                    onDelete={() => onDelete?.(null, index)}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  );
};

const SortableSection = ({
  id,
  section,
  sectionIndex,
  onEditSection,
  onEditField,
  onDelete,
  onDeleteSection,
}: {
  id: string;
  section: SectionType;
  sectionIndex: number;
  onEditSection?: (sectionIndex: number) => void;
  onEditField?: (sectionIndex: number, fieldIndex: number) => void;
  onDelete?: (sectionIndex: number, fieldIndex: number) => void;
  onReorder: (sectionIndex: number, newFields: FormFieldType[]) => void;
  onDeleteSection?: (sectionIndex: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemIds = section.fields.map((_, i) => `field-${sectionIndex}-${i}`);

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 font-semibold border-b"
      >
        <td className="py-2 px-3" colSpan={4}>
          <div
            className="flex items-center gap-2"
            {...attributes}
            {...listeners}
          >
            <span className="text-gray-400">⠿</span>
            <span
              className="cursor-pointer underline"
              onClick={() => onEditSection?.(sectionIndex)}
            >
              {section.label ? `Section: ${section.label}` : "Section"}
            </span>
          </div>
        </td>
        <td className="py-2 px-3 flex gap-2 items-center">
          <FaCog
            onClick={() => onEditSection?.(sectionIndex)}
            className="text-gray-600 hover:text-blue-600 cursor-pointer"
          />
          <button onClick={() => onDeleteSection?.(sectionIndex)}>
            <FaTrashAlt className="text-gray-600 hover:text-red-600" />
          </button>
        </td>
      </tr>

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {section.fields.map((field, fieldIndex) => (
          <SortableRow
            key={`field-${sectionIndex}-${fieldIndex}`}
            id={`field-${sectionIndex}-${fieldIndex}`}
            field={field}
            onEdit={() => onEditField?.(sectionIndex, fieldIndex)}
            onDelete={() => onDelete?.(sectionIndex, fieldIndex)}
          />
        ))}
      </SortableContext>
    </>
  );
};

const SortableRow = ({
  id,
  field,
  onEdit,
  onDelete,
}: {
  id: string;
  field: FormFieldType;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b cursor-pointer">
      <td className="py-2 px-3" {...attributes} {...listeners}>
        <span className="text-gray-400">⠿</span>
      </td>
      <td className="py-2 px-3">
        <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
          {field?.field}
        </span>
      </td>
      <td className="py-2 px-3">{field?.label || "-"}</td>
      <td className="py-2 px-3">-</td>
      <td className="py-2 px-3 flex gap-2">
        <button onClick={onEdit}>
          <FaCog className="text-gray-600 hover:text-blue-600" />
        </button>
        <button onClick={onDelete}>
          <FaTrashAlt className="text-gray-600 hover:text-red-600" />
        </button>
      </td>
    </tr>
  );
};
