import React, { useEffect, useRef, useState } from "react";
import BpmnViewer from "bpmn-js";
import BpmnModeler from "bpmn-js/lib/Modeler";
import ContextPadProvider from "./customContextPadProvider";
import CustomCamundaModdle from "camunda-bpmn-moddle/resources/camunda";
import { useModalStore } from "../Modal/modalStore";
import { SettingsWorkflow } from "./components/SettingsWorkflow";
import { IoSettingsOutline } from "react-icons/io5";
import { Button } from "flowbite-react";

const defaultDiagram = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                  xmlns:linkinq="http://linkinq.physter.com"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

const BpmnDiagram = ({
  xml,
  onSave,
  handleShown,
  editor,
}: {
  xml: string;
  onSave?: (xml: string) => void;
  handleShown?: (canvas: any, diagram: any) => void;
  editor?: boolean;
}) => {
  const containerRef = useRef(null);
  const diagramRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [attributes, setAttributes] = useState({
    status: "",
    assignee: "",
    formKey: "",
  });

  const [settings, setSettings] = useState({
    filter: "",
    default: false,
  });

  const { openModal } = useModalStore();

  useEffect(() => {
    if (editor) {
      diagramRef.current = new BpmnModeler({
        container: containerRef.current,
        moddleExtensions: {
          camunda: CustomCamundaModdle,
          linkinq: {},
        },
        additionalModules: [
          // Odstraníme paletu
          {
            __init__: ["contextPadProvider"], // ✅ musí existovat v další řádce
            contextPadProvider: ["type", ContextPadProvider], // ✅ přetížení defaultního
            // customContextPadProvider: ["type", ],
            paletteProvider: ["value", null],
          },
        ],
      });

      const diagramToImport = xml || defaultDiagram;

      diagramRef.current
        .importXML(diagramToImport)
        .then(() => {
          const canvas = diagramRef.current.get("canvas");
          canvas.zoom("fit-viewport");
          handleShown?.(canvas, diagramRef.current);

          const elementRegistry = diagramRef.current.get("elementRegistry");
          const processElement = elementRegistry.get("Process_1");

          if (processElement) {
            const attrs = processElement.businessObject.$attrs || {};

            console.log("attrs", attrs);
            setSettings({
              filter: attrs["linkinq:filter"] || "",
              default: attrs["linkinq:default"] === "true",
            });
          }
        })
        .catch((err) => {
          console.error("Chyba při importu diagramu:", err);
        });

      // Kliknutí na element (Task)
      diagramRef.current.on("element.click", (event) => {
        const element = event.element;
        if (element.type === "bpmn:Task" || element.type === "bpmn:UserTask") {
          setSelectedTask(element);
          setAttributes({
            status: element.businessObject.$attrs["linkinq:status"] || "",
            assignee: element.businessObject.$attrs["linkinq:assignee"] || "",
            formKey: element.businessObject.$attrs["camunda:formKey"] || "",
          });
        } else {
          setSelectedTask(null);
          // setAttributes({});
        }
      });

      return () => {
        diagramRef.current?.destroy();
        diagramRef.current = null;
      };
    } else {
      // Inicializace vieweru
      diagramRef.current = new BpmnViewer({
        container: containerRef.current,
      });

      // Načtení diagramu
      if (xml) {
        diagramRef.current
          .importXML(xml)
          .then(() => {
            const canvas = diagramRef.current.get("canvas");
            canvas.zoom("fit-viewport");
            handleShown?.(canvas, diagramRef.current);
          })
          .catch((err) => {
            console.error("Chyba při načítání diagramu:", err);
          });
      }

      // Úklid při unmountu
      return () => {
        if (diagramRef.current) {
          diagramRef.current.destroy();
          diagramRef.current = null;
        }
      };
    }
  }, [xml]);

  const handleAddTask = () => {
    const elementFactory = diagramRef.current.get("elementFactory");
    const modeling = diagramRef.current.get("modeling");
    const canvas = diagramRef.current.get("canvas");

    const taskShape = elementFactory.createShape({ type: "bpmn:UserTask" });
    const position = { x: 200, y: 200 };
    modeling.createShape(taskShape, position, canvas.getRootElement());
  };

  const handleSave = async () => {
    try {
      const modeling = diagramRef.current.get("modeling");
      const elementRegistry = diagramRef.current.get("elementRegistry");

      const processElement = elementRegistry.get("Process_1");

      if (processElement) {
        modeling.updateProperties(processElement, {
          "linkinq:filter": settings.filter || "",
          "linkinq:default": settings.default ? "true" : "false",
        });
      }

      const { xml } = await diagramRef.current.saveXML({ format: true });
      onSave?.(xml);
    } catch (err) {
      console.error("Chyba při ukládání:", err);
    }
  };

  const handleAttributeChange = (e) => {
    setAttributes({
      ...attributes,
      [e.target.name]: e.target.value,
    });
  };

  console.log("settings", settings);
  return (
    <div>
      {editor ? (
        <div style={{ marginBottom: "1rem" }}>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button onClick={handleAddTask}>➕ Přidat Task</button>
              <button onClick={handleSave} style={{ marginLeft: "1rem" }}>
                💾 Uložit XML
              </button>
              <button
                onClick={async () => {
                  try {
                    const { xml } = await diagramRef.current.saveXML({
                      format: true,
                    });
                    const blob = new Blob([xml], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "diagram.bpmn";
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error("Export error:", err);
                  }
                }}
              >
                ⬇️ Export BPMN
              </button>
            </div>
            <Button
              color={"light"}
              onClick={() => {
                openModal(
                  <SettingsWorkflow
                    setSettings={setSettings}
                    defaultValues={settings}
                  />,
                  { title: "Settings workflow" }
                );
              }}
            >
              <IoSettingsOutline />
            </Button>
          </div>
        </div>
      ) : null}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
      />
      {/* Formulář pro editaci atributů */}
      {selectedTask && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Editace atributů pro Task: {selectedTask.id}</h3>
          <label>
            Status:
            <input
              type="text"
              name="status"
              value={attributes.status}
              onChange={handleAttributeChange}
            />
          </label>
          <br />
          <label>
            Assignee:
            <input
              type="text"
              name="assignee"
              value={attributes.assignee}
              onChange={handleAttributeChange}
            />
          </label>
          <br />
          <label>
            Form Key:
            <input
              type="text"
              name="formKey"
              value={attributes.formKey}
              onChange={handleAttributeChange}
            />
          </label>
          <br />
          {/* <button onClick={handleSaveAttributes} style={{ marginTop: "1rem" }}>
            Uložit atributy
          </button> */}
        </div>
      )}
    </div>
  );
};

export default BpmnDiagram;
