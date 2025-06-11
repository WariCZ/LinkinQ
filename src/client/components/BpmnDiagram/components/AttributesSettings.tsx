import { useState, useMemo, useEffect } from "react";
import useStore from "../../../store";
import { Button, Label, TextInput } from "flowbite-react";
import DynamicForm from "../../DynamicForm";
import { Separator } from "@radix-ui/react-dropdown-menu";
import ReactSelect from "react-select";
import { FormFieldType } from "../../../types/DynamicForm/types";
import { useModalStore } from "../../Modal/modalStore";
import { AddField } from "../../DynamicForm/config/components/AddField";
import { FieldPrimitiveType, FieldType } from "../../../../lib/entity/types";

interface AttributesSettingsProps {
  entity: string;
  attributes: Record<string, string>;
  // onChange: (name: string, value: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAttributes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedTask: any;
  fields: FormFieldType[];
}

export function AttributesSettings({
  entity,
  attributes,
  onChange,
  setAttributes,
  selectedTask,
  fields,
}: AttributesSettingsProps) {
  const schema = useStore((state) => state.schema);
  const { openModal, closeModal } = useModalStore();

  const fieldsList = useMemo(
    () => Object.entries(schema?.[entity]?.fields || {}),
    [schema, entity]
  );

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    setSelectedFields(Object.keys(attributes || {}));
  }, [attributes]);

  const addField = (option: { label: string; value: string } | null) => {
    const fieldKey = option?.value;
    if (fieldKey && !selectedFields.includes(fieldKey)) {
      setSelectedFields((prev) => [...prev, fieldKey]);
      setAttributes((prev) => ({ ...prev, [fieldKey]: "" }));
    }
  };

  const removeField = (key: string) => {
    setSelectedFields((prev) => prev.filter((f) => f !== key));
    setAttributes((prev) => {
      const newAttrs = { ...prev };
      delete newAttrs[key];
      return newAttrs;
    });
  };

  const availableFields: FieldType[] = Object.entries(
    schema?.[entity]?.fields || {}
  ).map(([name, meta]) => ({
    ...meta,
    name,
  }));
  function mapFieldPrimitiveToFormType(
    type: FieldPrimitiveType
  ): FormFieldType["type"] {
    if (type.startsWith("link(")) return "select";
    if (type.startsWith("nlink(")) return "select";
    if (type === "boolean") return "checkbox";
    if (type === "integer" || type === "bigint") return "number";
    if (type === "datetime") return "datetime";
    if (type === "password") return "password";
    if (type === "richtext") return "richtext";
    return "text";
  }

  console.log("availableFields", availableFields);
  return (
    <div className="mt-4">
      <Label className="block mb-2 text-xl">
        Edit Task Attributes: {selectedTask.id}
      </Label>
      {/* <ReactSelect
        className="min-w-64 mb-4"
        classNamePrefix="flowbite-select"
        placeholder="Select attribute to add"
        onChange={addField}
        isClearable
        options={availableFields?.map(([key, meta]) => ({
          label: meta.label || key,
          value: key,
        }))}
      /> */}

      <Separator />

      {selectedFields.map((key) => (
        <div key={key} className="flex items-center gap-2 mb-2">
          <label className="w-32 font-medium">{key}:</label>
          <TextInput
            className="w-full"
            type="text"
            name={key}
            value={attributes[key] || ""}
            onChange={onChange}
          />
          <button
            type="button"
            onClick={() => removeField(key)}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Remove field"
          >
            ✕
          </button>
        </div>
      ))}
      {/* <DynamicForm
        data={attributes}
        formFields={selectedFields.map((key) => ({
          type: "text",
          field: key,
          label: (
            <div className="flex items-center justify-between">
              <span>{key}</span>
              <button
                type="button"
                onClick={() => removeField(key)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove field"
              >
                ✕
              </button>
            </div>
          ),
        }))}
        // onChange={({ data }) => {
        //   setAttributes(data);
        //   Object.entries(data).forEach(([name, value]) => {
        //     onChange(name, value ?? "");
        //   });
        // }}
      /> */}

      <Button
        color="alternative"
        onClick={() =>
          openModal(
            <AddField
              fields={availableFields}
              onAdd={(field) => {
                const key = field.name ?? "";
                if (!key) return;

                // добавляем новое поле в attributes
                setAttributes((prev) => ({
                  ...prev,
                  [key]: "", // значение по умолчанию
                }));

                closeModal();
              }}
            />,
            {
              title: "Přidat pole",
              size: "xl",
              hideSuccessButton: true,
            }
          )
        }
      >
        Add field +
      </Button>

      <DynamicForm formFields={fields} />
    </div>
  );
}

// import { useMemo } from "react";
// import useStore from "../../../store";
// import { Label } from "flowbite-react";
// import { Separator } from "@radix-ui/react-dropdown-menu";
// import DynamicForm from "../../DynamicForm";
// import {
//   FormFieldType,
//   SectionType,
// } from "../../../../client/types/DynamicForm/types";
// import { AddAttributesModal } from "./AddAtributes";

// interface AttributesSettingsProps {
//   entity: string;
//   attributes: FormFieldType[];
//   setAttributes: React.Dispatch<React.SetStateAction<FormFieldType[]>>;
//   onChange: (data: Record<string, any>) => void;
// }

// export function AttributesSettings({
//   entity,
//   attributes,
//   setAttributes,
//   onChange,
// }: AttributesSettingsProps) {
//   const schema = useStore((state) => state.schema);

//   const availableFields = useMemo(
//     () =>
//       Object.entries(schema?.[entity]?.fields || {}).map(([name, meta]) => ({
//         name,
//         label: meta.label || name,
//         type: meta.type,
//       })),
//     [schema, entity]
//   );

//   const formFields = useMemo<FormFieldType[]>(() => {
//     return attributes.length > 0
//       ? [
//           {
//             type: "Section",
//             label: "Atributy",
//             fields: attributes,
//           } as SectionType,
//         ]
//       : [];
//   }, [attributes]);

//   const handleAddField = (field: {
//     name: string;
//     label: string;
//     type: string;
//     isRequired?: boolean;
//   }) => {
//     if (!field.name) return;

//     const newField: FormFieldType = {
//       type: mapFieldPrimitiveToFormType(field.type),
//       name: field.name,
//       field: field.name,
//       label: field.label,
//       required: field.isRequired ?? false,
//       visible: true,
//     };

//     setAttributes((prev) => [...prev, newField]);
//   };

//   const handleChange = ({ data }: { data: Record<string, any> }) => {
//     const updatedFields = attributes.map((field) => ({
//       ...field,
//       default: data[field.field ?? ""] ?? "",
//     }));

//     setAttributes(updatedFields);
//     onChange(updatedFields);
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div>
//         <Label className="block mb-2">Add Attribute ({entity})</Label>
//         <AddAttributesModal fields={availableFields} onAdd={handleAddField} />
//       </div>

//       <Separator />

//       <DynamicForm data={{}} formFields={formFields} onChange={handleChange} />
//     </div>
//   );
// }

// function mapFieldPrimitiveToFormType(type: string): FormFieldType["type"] {
//   switch (type) {
//     case "string":
//     case "text":
//       return "text";
//     case "boolean":
//       return "checkbox";
//     case "number":
//       return "number";
//     case "date":
//     case "datetime":
//       return "datetime";
//     case "richtext":
//       return "richtext";
//     case "file":
//       return "attachment";
//     default:
//       return "text";
//   }
// }
