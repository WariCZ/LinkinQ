import { Control, Controller, FieldValues } from "react-hook-form";
import { FormFieldType, SectionType } from "../../../types/DynamicForm/types";
import { Checkbox, Label, TextInput } from "flowbite-react";
import DateTimePicker from "./DateTimePicker";
import Select from "./Select";
import FileUpload from "./FileUpload";
import SlateEditor from "../../SlateEditor";
import TaskProgressInput from "./ProgressInput";
import TextInputWithIcon from "./TextInputWithIcon";
import { IconType } from "react-icons";
import { CollapsibleSection } from "../../CollapsibleSection";
import { FormSection } from "../elements/FormSection";
import DateRangePicker from "../../globalComponents/DateRangePicker";

export const FormField = ({
  formField,
  control,
  readOnly,
}: {
  formField: FormFieldType;
  control: Control<FieldValues, any>;
  readOnly?: boolean;
}) => {
  const isDisabled = formField?.disabled || formField?.readOnly || readOnly;

  if (!formField?.type) {
    formField.type = "text";
  }

  switch (formField.type) {
    case "text":
    case "number":
    case "password":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>
            {formField.label}
            {formField.required && <span className="text-red-600 px-1">*</span>}
          </Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <div className="relative w-full">
                <TextInput
                  {...field}
                  {...formField}
                  type={formField.type}
                  disabled={isDisabled}
                  readOnly={readOnly}
                  required={formField.required}
                  className="w-full"
                  value={formField.default || formField.value}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1 absolute right-0">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      );
    case "checkbox":
      return (
        <div
          key={formField.field}
          className={`flex gap-2 flex-row-reverse justify-end items-center ${
            formField.className || ""
          }${
            formField.colSpan
              ? `col-span-${formField.colSpan}`
              : "flex gap-2 flex-row-reverse justify-end items-center"
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          {formField.required && <span className="text-red-600 px-1">*</span>}
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <Checkbox
                  className="block"
                  {...field}
                  checked={field.value}
                  id={formField.field}
                  disabled={isDisabled}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );
    case "select":
      return (
        <div
          key={formField.field}
          className={`select ${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          {formField.required && <span className="text-red-600 px-1">*</span>}
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  {...formField}
                  readOnly={isDisabled}
                  value={formField.default ? formField.default : field.value}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );
    case "datetime":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  disabled={isDisabled}
                  isReadonly={isDisabled}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );
    case "attachment":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field }) => (
              <FileUpload
                {...field}
                {...formField}
                disabled={isDisabled}
                onChange={(guids) => {
                  field.onChange(guids);
                }}
              />
            )}
          />
        </div>
      );
    case "richtext":
      return (
        <div
          key={formField.field}
          className={`flex flex-col gap-2 ${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          {formField.required && <span className="text-red-600 px-1">*</span>}
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <SlateEditor
                  field={field}
                  value={formField.default || field.value}
                  onChange={field.onChange}
                  placeholder="Enter text..."
                  readOnly={readOnly}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );
    case "switch":
      return (
        <div className="my-2 flex items-center gap-2 bg-white p-2 rounded-md">
          {formField.required && <span className="text-red-600 px-1">*</span>}
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="hidden"
                    disabled={isDisabled}
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      field.value ? "bg-cyan-700" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transform ${
                        field.value ? "translate-x-6" : ""
                      } transition-transform`}
                    ></div>
                  </div>
                </label>
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
          <Label htmlFor={formField.field}>{formField.label}</Label>
        </div>
      );
    case "progress":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""} ${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field }) => (
              <TaskProgressInput
                value={field.value}
                onChange={field.onChange}
                disabled={isDisabled}
              />
            )}
          />
        </div>
      );
    case "textWithIcon":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required ? "Required" : false,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <TextInputWithIcon
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={formField.placeholder}
                  disabled={isDisabled}
                  icon={formField.icon as IconType}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );
    case "CollapsibleSection":
      return (
        <CollapsibleSection
          key={formField.label}
          title={formField.label}
          icon={formField.icon}
        >
          {formField.children?.map((childField, index) =>
            childField.type === "Section" ? (
              <FormSection
                key={index}
                section={childField as SectionType}
                control={control}
                readOnly={readOnly}
              />
            ) : (
              <FormField
                key={index}
                formField={childField}
                control={control}
                readOnly={readOnly}
              />
            )
          )}
        </CollapsibleSection>
      );
    case "dateRangePicker":
      return (
        <div
          key={formField.field}
          className={`${formField.className || ""}${
            formField.colSpan ? `col-span-${formField.colSpan}` : ""
          }`}
        >
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={{ from: "", to: "" }}
            render={({ field, fieldState }) => (
              <>
                <DateRangePicker
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  disabled={isDisabled}
                />
                {fieldState.error && (
                  <p className="text-red-600 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>
      );

    default:
      return null;
  }
};
