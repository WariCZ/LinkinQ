import { useModalStore } from "../../../../client/components/Modal/modalStore";
import useDataTable from "../../../../client/hooks/useDataTable";
import { TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { AddWorkflow } from "./components/AddWorkflow";
import BpmnDiagram from "../../../../client/components/BpmnDiagram/";
import { AppButton } from "../../../components/common/AppButton";
import { IoReload } from "react-icons/io5";
import { useTranslation } from "react-i18next";

type WorkflowType = { name: string; source: string; guid: string };

export const Workflow = () => {
  const { t: tWorkflows } = useTranslation("workflows");
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState({} as WorkflowType);
  const [tableWorkflows, setTableWorkflows] = useState<WorkflowType[] | []>([]);
  const { openModal } = useModalStore();

  const [workflows, setWorkflows, { refresh, setRecord }] = useDataTable(
    {
      entity: "wf_models",
      fields: ["guid", "name", "source"],
    },
    [] as WorkflowType[]
  );

  useEffect(() => {
    setTableWorkflows(workflows);
  }, [workflows]);

  const saveXml = async (xml: string) => {
    await setRecord({ guid: selectedWorkflow.guid, source: xml });
    await refresh();
  };

  const searchWorkflow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchValue(e.target.value);
    setTableWorkflows(
      workflows.filter((workflow: WorkflowType) =>
        workflow?.name?.toLowerCase().includes(searchTerm)
      )
    );
  };

  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 flex justify-between items-center">
        <span className="font-bold">{tWorkflows("title")}</span>
        <AppButton icon={<IoReload />} onClick={() => refresh()}>
          {t("labels.reload")}
        </AppButton>
      </div>
      <div className="flex items-start h-full justify-between">
        <div className="w-1/3 max-w-sm min-w-[240px] px-3 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="pt-1 flex justify-between items-center my-1">
            <div>
              <span className="font-bold pr-1">{tWorkflows("listTitle")}</span>
              <span className="float-end">({workflows?.length})</span>
            </div>
            <AppButton
              icon={<FaPlus />}
              onClick={() => {
                openModal(<AddWorkflow refresh={refresh} />, {
                  title: tWorkflows("addNew"),
                });
              }}
            >
              {t("labels.add")}
            </AppButton>
          </div>
          <TextInput
            value={searchValue}
            onChange={searchWorkflow}
            className="w-full"
            placeholder={t("labels.search")}
          />
          <ul className="mt-2">
            {tableWorkflows.map((workflows: WorkflowType, i: number) => (
              <li
                key={workflows.name + i}
                onClick={() => setSelectedWorkflow(workflows)}
                className={`${
                  selectedWorkflow.name === workflows.name ? "font-bold" : ""
                } cursor-pointer`}
              >
                {workflows.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-2 w-full">
          <div className="w-full">
            {selectedWorkflow.guid ? (
              <BpmnDiagram
                editor={true}
                xml={selectedWorkflow.source}
                onSave={saveXml}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-gray-500 text-lg">
                  {" "}
                  {tWorkflows("selectPrompt")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow;
