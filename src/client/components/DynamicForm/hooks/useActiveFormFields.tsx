import { useEffect, useMemo, useRef } from "react";
import { useFormConfigStore } from "../_store";
import { FormFieldType } from "../../../types/DynamicForm/types";

// export const useActiveFormFields = (
//   formFields: (FormFieldType | string)[]
// ): FormFieldType[] => {
//   const defaultFields = useFormConfigStore((s) => s.defaultFields);
//   const setDefaultFields = useFormConfigStore((s) => s.setDefaultFields);
//   const getActiveFields = useFormConfigStore((s) => s.getActiveFields);

//   useEffect(() => {
//     if (!defaultFields.length && formFields.length) {
//       const onlyObjects = formFields.filter(
//         (f): f is FormFieldType => typeof f === "object" && f !== null
//       );
//       setDefaultFields(onlyObjects);
//     }
//   }, [formFields]);

//   return getActiveFields();
// };
