import Form from "@/client/components/Form/Form";
import { ModalPropsType } from "@/client/components/Modal/ModalContainer";
import { useModalStore } from "@/client/components/Modal/modalStore";
import useDataDetail from "@/client/hooks/useDataDetail";
import useDataTable from "@/client/hooks/useDataTable";
import { BpmnJsReact, useBpmnJsReact } from "bpmn-js-react";
import { Button, TextInput } from "flowbite-react";
import { useMemo, useState } from "react";

import { FaPlus } from "react-icons/fa";

type WorkflowType = { name: string; source: string; guid: string };
const Workflow = (props: any) => {
  // const workflows: string[] = useMemo(() => [], []);
  const [searchValue, setSearchValue] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState({} as WorkflowType);
  const [tableWorkflows, setTableWorkflows] = useState([] as string[]);
  const { openModal } = useModalStore();

  const [workflows, setWorkflows, { refresh, setRecord }] = useDataTable(
    {
      entity: "wf_models",
      fields: ["guid", "name", "source"],
    },
    [] as WorkflowType[]
  );
  const searchWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    // setTableWorkflows(workflows.filter((m) => m.indexOf(e.target.value) > -1));
  };

  const bpmnReactJs = useBpmnJsReact();

  const handleShown = (viewer: any) => {
    // bpmnReactJs.addMarker("Activity_03i6maz", "moje");
  };
  const saveXml = async () => {
    const result = await bpmnReactJs.saveXml();

    console.log(result?.xml);
    console.log(selectedWorkflow);
    await setRecord({ guid: selectedWorkflow.guid, source: result?.xml });
    alert("Saved");
  };

  // const test = (a, b, c) => {
  //   debugger;
  // };
  console.log(workflows);
  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <span className="font-bold">Workflow models</span>
      </div>
      <div className="flex items-start h-full">
        <div className="px-3 w-48 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="py-1"></div>
          <div className="pt-1">
            <Button
              className="h-full"
              onClick={() => {
                openModal(<AddWorkflow refresh={refresh} />);
              }}
            >
              <span className="top-0 flex items-center left-4">
                <FaPlus className="h-3 w-3 mr-2" />
                <span>Add</span>
              </span>
            </Button>
          </div>

          <div className="pt-1">
            <span className="font-bold">Workflows</span>
            <span className="float-end">{workflows?.length}</span>
          </div>
          {/* <div className="pt-1">
            <TextInput
              style={{ maxHeight: 18 }}
              value={searchValue}
              onChange={searchWorkflow}
              className="w-full"
              placeholder="Hledat..."
            />
          </div> */}
          <div>
            <ul>
              {workflows.map((m, i) => (
                <li
                  key={m.name + i}
                  onClick={() => setSelectedWorkflow(m)}
                  className={`${
                    selectedWorkflow.name === m.name ? "font-bold" : ""
                  } cursor-pointer`}
                >
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-2 w-full">
          <div className="w-full">
            {selectedWorkflow ? (
              <>
                <Button
                  className="h-full"
                  onClick={() => {
                    saveXml();
                  }}
                >
                  Save
                </Button>
                <BpmnJsReact
                  useBpmnJsReact={bpmnReactJs}
                  mode="edit"
                  xml={selectedWorkflow.source || ""}
                  onShown={handleShown}
                  // click={test}
                />
              </>
            ) : (
              <span>Vyberte worflow</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

const AddWorkflow = (props: ModalPropsType & { refresh: () => void }) => {
  const [data, setData, { setRecord }] = useDataDetail(
    {
      entity: "wf_models",
    },
    {}
  );
  return (
    <Form
      data={data}
      onSubmit={async ({ closeModal, data }) => {
        await setRecord({
          name: data.name,
          source: defaultXml,
        });
        closeModal && closeModal();
      }}
      formFields={[
        {
          label: "Workflow name",
          field: "name",
          required: true,
        },
      ]}
      {...props}
    />
  );
};

export default Workflow;