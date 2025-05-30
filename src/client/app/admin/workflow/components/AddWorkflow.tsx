import Form from "../../../../../client/components/DynamicForm";
import { ModalPropsType } from "../../../../../client/types/common/ModalPropsType";
import useDataDetail from "../../../../../client/hooks/useDataDetail";

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="false">
    <bpmn2:startEvent id="StartEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="412" y="240" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
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
  return (
    <Form
      data={data}
      onSubmit={async ({ data }) => {
        setRecord({
          name: data.name,
          source: defaultXml,
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
      ]}
      {...props}
    />
  );
};
