import { FormField } from "@/client/components/DynamicForm/fields/FormField";
import { Control, FieldValues } from "react-hook-form";
import { FaUser } from "react-icons/fa";

interface HeaderProps {
  control: Control<FieldValues, any>;
}

function Header({ control }: HeaderProps) {
  return (
    <div className="bg-gray-100 py-6 px-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 mb-4 items-center">
        <FormField
          formField={{
            type: "textWithIcon",
            placeholder: "Vlozte nazev ukolu",
            field: "caption",
            required: true,
            className: "w-full flex-grow",
            icon: FaUser,
          }}
          control={control}
        />
        <div className="flex items-center justify-end">
          <FormField
            formField={{
              type: "progress",
              label: "Progress:",
              field: "progress",
              className: "w-full max-w-sm flex items-center justify-end gap-2",
            }}
            control={control}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          formField={{
            type: "select",
            label: "Řešitel:",
            field: "assignee",
            className: "w-full",
            entity: "users",
          }}
          control={control}
        />
        <FormField
          formField={{
            type: "datetime",
            label: "Termín:",
            field: "deadline",
            className: "w-full",
          }}
          control={control}
        />
        <FormField
          formField={{
            type: "select",
            label: "Priorita:",
            field: "priority",
            className: "w-full",
            options: [
              { value: "none", label: "Bez priority" },
              { value: "low", label: "Nízká" },
              { value: "medium", label: "Střední" },
              { value: "high", label: "Vysoká" },
              { value: "very_high", label: "Velmi vysoká" },
              { value: "critical", label: "Kritická" },
            ],
          }}
          control={control}
        />
      </div>
    </div>
  );
}
export default Header;
