import { Control, Controller, FieldValues } from "react-hook-form";
import { FormFieldType } from "../../../types/DynamicForm/types";
import { Checkbox, Label, TextInput } from "flowbite-react";
import DateTimePicker from "./DateTimePicker";
import Select from "./Select";
import FileUpload from "./FileUpload";
import SlateEditor from "../../SlateEditor";

export const FormField = ({
  formField,
  control,
}: {
  formField: FormFieldType;
  control: Control<FieldValues, any>;
}) => {
  if (!formField.type) {
    debugger;
    formField.type = "text";
  }

  if (formField.customComponent) {
    const CustomComponent = formField.customComponent;
    return (
      <div key={formField.field} className="my-2">
        <Label htmlFor={formField.field}>{formField.label}</Label>
        <Controller
          name={formField.field}
          control={control}
          rules={{ required: formField.required, validate: formField.validate }}
          render={({ field }) => (
            <CustomComponent
              {...field}
              readOnly={formField.readOnly}
              unit={formField.unit}
            />
          )}
        />
      </div>
    );
  }

  switch (formField.type) {
    case "text":
    case "number":
    case "password":
      return (
        <div
          key={formField.field}
          className={formField.colSpan && `col-span-${formField.colSpan}`}
        >
          <Label htmlFor={formField.field}>
            {formField.label}
            {formField.required ? (
              <span className="text-red-600 px-1">*</span>
            ) : null}
          </Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={formField.default || ""}
            rules={{
              required: formField.required,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <TextInput
                  {...field}
                  {...formField}
                  type={formField.type}
                  disabled={formField.disabled}
                  readOnly={formField.readOnly}
                  required={formField.required}
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
    case "checkbox":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{
              required: formField.required,
              validate: formField.validate,
            }}
            render={({ field, fieldState }) => (
              <>
                <Checkbox
                  className="block"
                  {...field}
                  checked={field.value}
                  id={formField.field}
                  disabled={formField.disabled}
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
        <div key={formField.field} className="test select">
          <Label htmlFor={formField.field}>{formField.label}</Label>
          {formField.required ? (
            <span className="text-red-600 px-1">*</span>
          ) : null}
          <Controller
            name={formField.field}
            control={control}
            // defaultValue={formField.default || 1}
            rules={{
              required: formField.required,
              validate: formField.validate,
            }}
            render={({ field }) => <Select {...field} {...formField} />}
          />
        </div>
      );
    case "datetime":
      return (
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            defaultValue={false}
            rules={{
              required: formField.required,
              validate: formField.validate,
            }}
            render={({ fieldState }) => (
              <>
                <DateTimePicker />
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
        <div key={formField.field}>
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            rules={{
              required: formField.required,
              validate: formField.validate,
            }}
            render={({ field }) => (
              <FileUpload
                {...field}
                {...formField}
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
        <div key={formField.field} className="col-span-full my-2">
          <Label htmlFor={formField.field}>{formField.label}</Label>
          <Controller
            name={formField.field}
            control={control}
            render={({ field }) => (
              <SlateEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter rich text..."
              />
            )}
          />
        </div>
      );
    case "switch":
      return (
        <div
          key={formField.field}
          className="my-2 flex items-center gap-2 bg-white p-2 rounded-md"
        >
          <Controller
            name={formField.field}
            control={control}
            render={({ field }) => (
              <>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="hidden"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${field.value ? "bg-cyan-700" : "bg-gray-300"}`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full transform ${field.value ? "translate-x-6" : ""} transition-transform`}
                    ></div>
                  </div>
                </label>
              </>
            )}
          />
          <Label htmlFor={formField.field}>{formField.label}</Label>
        </div>
      );

    // Add other cases (datetime, Filepicker, etc.) as needed.

    default:
      return null;
  }
};
