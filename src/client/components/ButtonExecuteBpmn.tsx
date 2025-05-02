import { BpmnJsReact, useBpmnJsReact } from "bpmn-js-react";
import { useTranslation } from "react-i18next";
import { useModalStore } from "./Modal/modalStore";
import { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "flowbite-react";
import { MdOutlineSchema } from "react-icons/md";

const ButtonExecuteBpmn = ({
  status,
  wf,
  refresh,
  showBtnSchema = true,
}: {
  status?: string;
  wf: any;
  refresh: any;
  showBtnSchema?: boolean
}) => {
  const { t } = useTranslation();
  const executeItems = wf.items.filter((item) => item.status !== "end");

  const { openModal } = useModalStore();

  const [flows, setFlows] = useState([]);

  const getFlows = async () => {
    if (executeItems[0] && executeItems[0].id) {
      const { data } = await axios.post("/bpmnapi/invokeHaveFields", {
        id: executeItems[0].id,
      });
      setFlows(data.flows || []);
    } else {
      setFlows([]);
    }
  };
  useEffect(() => {
    getFlows();
  }, [status]);

  const invokeMove = async (d: any) => {
    await axios.post("/bpmnapi/invoke", {
      id: executeItems[0].id,
      itemFields: {
        move: d.value,
      },
    });
    refresh();
  };

  return (
    <span className="flex items-center justify-end">
      {showBtnSchema && <MdOutlineSchema
        className="mx-1 cursor-pointer"
        onClick={() =>
          openModal(
            <BPMNInstance name={wf.name} source={wf.source} items={wf.items} />
          )
        }
      />
      }
      <Dropdown
        className="w-40"
        label={
          <span
            // onClick={executeProcess}
            title="Execute"
            className="bg-green-500 text-white px-4 py-0 rounded hover:bg-green-600 cursor-pointer"
          >
            {status}
          </span>
        }
        arrowIcon={false}
        inline
      >
        <Dropdown.Header>
          <span className="block text-sm font-bold">Select next step</span>
        </Dropdown.Header>

        {flows.map((d) => {
          return (
            <Dropdown.Item
              onClick={() => {
                invokeMove(d);
              }}
            >
              {d.name}
            </Dropdown.Item>
          );
        })}
        {flows.length == 0 ? (
          <Dropdown.Item>{t("nomove")}</Dropdown.Item>
        ) : null}
      </Dropdown>
    </span>
  );
};

const BPMNInstance = ({
  name,
  source,
  items,
}: {
  name: string;
  source: string;
  items: [];
}) => {
  const bpmnReactJs = useBpmnJsReact();

  const handleShown = (viewer: any) => {
    items?.map((item: any) => {
      if (item.status === "end") {
        bpmnReactJs.addMarker(item.elementId, "Completed");
      }
      if (item.status === "wait") {
        bpmnReactJs.addMarker(item.elementId, "Pending");
      }
    });
  };

  return (
    <div className="bpmnView">
      <div className="font-bold">{name}</div>
      <BpmnJsReact
        useBpmnJsReact={bpmnReactJs}
        mode="edit"
        xml={source}
        onShown={handleShown}
      />
    </div>
  );
};

export default ButtonExecuteBpmn;
