import Form from "../../../../../client/components/DynamicForm";
import { ModalPropsType } from "../../../../../client/types/common/ModalPropsType";
import useDataDetail from "../../../../../client/hooks/useDataDetail";
import useStore from "../../../../store";

const getDefaultXml = (entity: string) => `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:linkinq="http://linkinq.physter.com"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false" linkinq:entity="${entity}" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

export const AddWorkflow = (
  props: ModalPropsType & { refresh: () => void }
) => {
  const [data, setData, { setRecord }] = useDataDetail(
    {
      entity: "wf_models",
    },
    {}
  );
  const schema = useStore((s) => s.schema);
  const entityOptions = Object.keys(schema).map((key) => ({
    label: key,
    value: key,
  }));

  return (
    <Form
      data={data}
      onSubmit={async ({ data }) => {
        setRecord({
          name: data.name,
          entity: data.entity,
          source: getDefaultXml(data.entity),
        });
        props.closeModal && props.closeModal();
      }}
      formFields={[
        {
          label: "Workflow name",
          field: "name",
          required: true,
          type: "text",
        },
        {
          label: "Entity",
          field: "entity",
          required: true,
          type: "select",
          options: entityOptions,
        },
      ]}
      {...props}
    />
  );
};
