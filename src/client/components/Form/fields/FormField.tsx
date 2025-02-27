import { Control, Controller, FieldValues } from "react-hook-form";
import { FormFieldType } from "../types";
import {
    Checkbox,
    Label,
    TextInput,
} from "flowbite-react";
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
    console.log("form formField ", formField);
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
                        rules={{ required: formField.required }}
                        render={({ field }) => (
                            <TextInput
                                {...field}
                                {...formField}
                                type={formField.type}
                                disabled={formField.disabled}
                                readOnly={formField.readOnly}
                                required={formField.required}
                            />
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
                        rules={{ required: formField.required }}
                        render={({ field }) => (
                            <Checkbox
                                className="block"
                                {...field}
                                checked={field.value}
                                id={formField.field}
                                disabled={formField.disabled}
                            />
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
                        rules={{ required: formField.required }}
                        render={({ field }) => <Select {...field} {...formField} />}
                    ></Controller>
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
                        rules={{ required: formField.required }}
                        render={({ field }) => <DateTimePicker />}
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
                        rules={{ required: formField.required }}
                        render={({ field }) => (
                            <FileUpload
                                {...field}
                                {...formField}
                                onChange={(guids) => {
                                    console.log("FileUpload returned: ", guids);
                                    field.onChange(guids);
                                }}
                            />
                        )}
                    />
                </div>
            );
        case "richtext":
            return (
                <div key={formField.field} className="col-span-full">
                    <Label htmlFor={formField.field}>{formField.label}</Label>
                    <Controller
                        name={formField.field}
                        control={control}
                        defaultValue=""
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

        // Add other cases (datetime, Filepicker, etc.) as needed.

        default:
            console.warn(`Form formField type ${formField.type} is not defined`);
            return null;
    }
};