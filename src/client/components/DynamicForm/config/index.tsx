import { SectionType } from "../../../../client/types/DynamicForm/types";
import { FieldType } from "../../../../lib/entity/types";
import { Button } from "flowbite-react";
import { useModalStore } from "../../Modal/modalStore";
import { useFormConfigStore } from "../_store";
import { AddFieldModal } from "../modals/AddFieldModal";
import { FieldEdit } from "./components/FieldEdit";
import { FieldList } from "./components/FieldList";
import { KindSelector } from "./components/KindSelector";
import { SectionEdit } from "./components/SectionEdit";

interface FormConfiguratorProps {
  fields: FieldType[];
}

export const FormConfigurator = ({ fields }: FormConfiguratorProps) => {
  const { openModal, closeModal } = useModalStore();
  const { editingFields, setEditingFields } = useFormConfigStore();

  const handleAddSection = () => {
    const newSection: SectionType = {
      type: "Section",
      label: "",
      fields: [],
      id: `section-${Date.now()}`,
    };

    setEditingFields([...editingFields, newSection]);
  };

  const handleEditSection = (sectionIndex: number) => {
    const section = editingFields[sectionIndex] as SectionType;
    const labelRef = { current: section.label || "" };
    const columnsRef = { current: section.columns ?? 1 };

    const handleSave = () => {
      const updated = [...editingFields];
      (updated[sectionIndex] as SectionType) = {
        ...section,
        label: labelRef.current,
        columns: columnsRef.current,
      };
      setEditingFields(updated);
    };

    openModal(
      <SectionEdit
        label={labelRef.current}
        columns={columnsRef.current}
        onChangeLabel={(val) => (labelRef.current = val)}
        onChangeColumns={(val) => (columnsRef.current = val)}
      />,
      {
        title: "Change section",
        hideSuccessButton: true,
        additionalButtons: [
          {
            label: "Apply",
            onClick: () => {
              handleSave();
              closeModal();
            },
          },
        ],
      }
    );
  };

  const handleEditField = (sectionIndex: number | null, fieldIndex: number) => {
    let field: any;
    const updated = [...editingFields];

    if (sectionIndex === null) {
      field = editingFields[fieldIndex];
    } else {
      const section = updated[sectionIndex];
      if (section.type !== "Section" || !Array.isArray(section.fields)) return;
      field = section.fields[fieldIndex];
    }

    const fieldDataRef = { current: field };

    const handleSave = () => {
      if (sectionIndex === null) {
        updated[fieldIndex] = {
          ...updated[fieldIndex],
          ...fieldDataRef.current,
        };
      } else {
        const section = updated[sectionIndex];
        if (section.type !== "Section" || !Array.isArray(section.fields))
          return;
        section.fields[fieldIndex] = {
          ...section.fields[fieldIndex],
          ...fieldDataRef.current,
        };
      }

      setEditingFields(updated);
    };

    openModal(
      <FieldEdit
        field={field}
        onChange={(updated) => {
          fieldDataRef.current = { ...fieldDataRef.current, ...updated };
        }}
      />,
      {
        title: "Change field",
        hideSuccessButton: true,
        additionalButtons: [
          {
            label: "Apply",
            onClick: () => {
              handleSave();
              closeModal();
            },
          },
        ],
      }
    );
  };

  return (
    <div>
      <div className="space-y-4 p-4">
        <KindSelector />
        <div className="flex gap-2">
          <AddFieldModal fields={fields} />
          <Button onClick={handleAddSection}>Add section +</Button>
        </div>
      </div>
      <FieldList
        onEditSection={handleEditSection}
        onEditField={handleEditField}
        onDelete={(sectionIndex, fieldIndex) => {
          const updated = [...editingFields];

          if (sectionIndex === null) {
            updated.splice(fieldIndex, 1);
          } else {
            const section = updated[sectionIndex];
            if (section.type === "Section" && Array.isArray(section.fields)) {
              const newFields = [...section.fields];
              newFields.splice(fieldIndex, 1);
              updated[sectionIndex] = { ...section, fields: newFields };
            }
          }

          setEditingFields(updated);
        }}
        onReorder={(sectionIndex, newFields) => {
          const updated = [...editingFields];
          const section = updated[sectionIndex];
          if (section.type === "Section") {
            updated[sectionIndex] = { ...section, fields: [...newFields] };
            setEditingFields(updated);
          }
        }}
        onDeleteSection={(sectionIndex) => {
          const updated = [...editingFields];
          updated.splice(sectionIndex, 1);
          setEditingFields([...updated]);
        }}
        onReorderSections={(newSections) => {
          setEditingFields(newSections);
        }}
      />
    </div>
  );
};
