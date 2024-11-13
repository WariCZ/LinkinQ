import React, { useEffect, useRef } from "react";
import { Form as FormJS, Schema } from "@bpmn-io/form-js";
import { error } from "winston";

const Form = (props: {
  schema: Schema;
  data?: Record<string, any>;
  onSubmit?: (formData: Record<string, any>) => void;
  formRef?: any;
  closeModal?: () => void;
}) => {
  const { schema, formRef, data } = props;

  const formInstance = useRef<any | null>(null);

  useEffect(() => {
    const initializeForm = async () => {
      formInstance.current = new FormJS({
        container: formRef.current,
      });

      formInstance.current.on(
        "submit",
        (event: { data: any; errors: any; files: any; type: string }) => {
          console.log(event.data, event.errors);
          const isValid = Object.keys(event.errors).length === 0;
          if (props.onSubmit)
            props.onSubmit({
              ...event,
              closeModal: props.closeModal,
              isValid,
            });
        }
      );

      // Načtení schématu a počátečních dat
      formInstance.current.importSchema(schema).then(() => {
        if (data) {
          formInstance.current.importData(data);
        }
      });
    };

    initializeForm();

    return () => {
      // Uvolnění instance při odmountování komponenty
      formInstance.current?.destroy();
    };
  }, [schema, data]);

  return (
    <div>
      <div ref={formRef} />
    </div>
  );
};

export default Form;
