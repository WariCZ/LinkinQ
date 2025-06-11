import React, { useEffect, useRef, useState } from "react";
import BpmnViewer from "bpmn-js";
import BpmnModeler from "bpmn-js/lib/Modeler";
import CustomCamundaModdle from "camunda-bpmn-moddle/resources/camunda";
import { useModalStore } from "../Modal/modalStore";
import { SettingsWorkflow } from "./components/SettingsWorkflow";
import { IoSettingsOutline } from "react-icons/io5";
import { Button } from "flowbite-react";
import ContextPadProvider from "./customContextPadProvider";
import { AttributesSettings } from "./components/AttributesSettings";
import Modeler from "bpmn-js/lib/Modeler";
import Viewer from "bpmn-js";
import { defaultDiagram } from "./defaultDiagram";
import { ModdleElement, Shape } from "bpmn-js/lib/model/Types";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import { AppButton } from "../common/AppButton";
import { FaDownload, FaPlus, FaSave } from "react-icons/fa";
import { EntitySchema } from "../../../lib/entity/types";
import { FormFieldType } from "../../types/DynamicForm/types";
import useStore from "../../store";

type BpmnCanvas = ReturnType<Modeler["get"]>;
type BpmnDiagram = Modeler | Viewer;
interface BpmnDiagramProps {
  xml: string;
  onSave?: (xml: string) => void;
  handleShown?: (canvas: BpmnCanvas, diagram?: Modeler | Viewer) => void;
  editor?: boolean;
}

export function transformAttributesToFormFields(
  attributes: Record<string, string>,
  schema: EntitySchema,
  entity: string
): FormFieldType[] {
  return Object.entries(attributes).map(([key, value]) => {
    const meta = schema?.[entity]?.fields?.[key];
    console.log("meta", meta)
    const base: FormFieldType = {
      type: meta?.type?.startsWith("nlink(") ? "select" : "text",
      field: key,
      label: meta?.label ?? key,
      default: value,
    };
    return base;
  });
}

const BpmnDiagram = ({
  xml,
  onSave,
  handleShown,
  editor,
}: BpmnDiagramProps) => {
  const { openModal } = useModalStore();
  const containerRef = useRef(null);
  const diagramRef = useRef(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  const schema = useStore((state) => state.schema);

  const [settings, setSettings] = useState({
    filter: "",
    entity: "",
    default: false,
  });

  useEffect(() => {
    setSelectedTask(null);
    setSettings({
      filter: "",
      entity: "",
      default: false,
    });

    if (editor) {
      diagramRef.current = new BpmnModeler({
        container: containerRef.current,
        moddleExtensions: {
          camunda: CustomCamundaModdle,
          linkinq: {},
          linkinq: {},
        },
        additionalModules: [
          // deleted palets
          {
            __init__: ["contextPadProvider"],
            contextPadProvider: ["type", ContextPadProvider],
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

            setSettings({
              filter: attrs["linkinq:filter"] || "",
              default: attrs["linkinq:default"] === "true",
              entity: attrs["linkinq:entity"] || "",
            });
          }
        })
        .catch(() => {
          console.error("Chyba při importu diagramu");
        });

      // Click on an element (Task)
      diagramRef.current.on(
        "element.click",
        (event: { element: Shape & { businessObject: ModdleElement } }) => {
          const element = event.element;

          if (
            element.type === "bpmn:Task" ||
            element.type === "bpmn:UserTask"
          ) {
            setSelectedTask(element);

            const attrs = element.businessObject.$attrs || {};
            const newAttributes: Record<string, string> = {};

            Object.entries(attrs as Record<string, string>).forEach(
              ([key, value]) => {
                if (key.startsWith("linkinq:") || key === "camunda:formKey") {
                  const shortKey = key
                    .replace("linkinq:", "")
                    .replace("camunda:", "");
                  newAttributes[shortKey] = value;
                }
              }
            );
            setAttributes(newAttributes);
          } else if (element.type === "bpmn:StartEvent") {
            setSelectedTask(element);

            const attrs = element.businessObject.$attrs || {};
            const newAttributes: Record<string, string> = {};

            Object.entries(attrs as Record<string, string>).forEach(
              ([key, value]) => {
                if (key.startsWith("linkinq:") || key === "camunda:formKey") {
                  const shortKey = key
                    .replace("linkinq:", "")
                    .replace("camunda:", "");
                  newAttributes[shortKey] = value;
                }
              }
            );
            setAttributes(newAttributes);
          } else {
            setSelectedTask(null);
          }
        }
      );

      return () => {
        diagramRef.current?.destroy();
        diagramRef.current = null;
      };
    } else {
      // Viewer initialization
      diagramRef.current = new BpmnViewer({
        container: containerRef.current,
      });

      // Diagram loading
      if (xml) {
        diagramRef.current
          .importXML(xml)
          .then(() => {
            const canvas = diagramRef.current.get("canvas");
            canvas.zoom("fit-viewport");
            handleShown?.(canvas, diagramRef.current);
          })
          .catch(() => {
            console.error("Chyba při načítání diagramu:");
          });
      }

      // Cleanup on unmount
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
        const newAttributes = {
          "linkinq:filter": settings.filter || "",
          "linkinq:default": settings.default ? "true" : "false",
        };

        modeling.updateProperties(processElement, newAttributes);
      }

      const { xml } = await diagramRef.current.saveXML({ format: true });

      onSave?.(xml);
    } catch (err) {
      console.error("Chyba při ukládání:", err);
    }
  };

  const handleAttributeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updated = {
      ...attributes,
      [name]: value,
    };

    setAttributes(updated);

    if (selectedTask && diagramRef.current) {
      const modeling = diagramRef.current.get("modeling");
      const element = selectedTask;

      const currentAttrs = element.businessObject.$attrs || {};

      const newAttrs = { ...currentAttrs };

      if (name === "formKey") {
        if (value) {
          newAttrs["camunda:formKey"] = value;
        } else {
          delete newAttrs["camunda:formKey"];
        }
      } else {
        const fullKey = `linkinq:${name}`;
        if (value) {
          newAttrs[fullKey] = value;
        } else {
          delete newAttrs[fullKey];
        }
      }

      modeling.updateProperties(element, { ...newAttrs });
    }
  };

  // const handleAttributeChange = ({ data }: { data: Record<string, any> }) => {
  //   setAttributes(data);

  //   console.log("data", data)
  //   if (selectedTask && diagramRef.current) {
  //     const modeling = diagramRef.current.get("modeling");
  //     const element = selectedTask;

  //     const currentAttrs = element.businessObject.$attrs || {};
  //     const newAttrs = { ...currentAttrs };

  //     Object.entries(data).forEach(([key, value]) => {
  //       if (key === "formKey") {
  //         if (value) {
  //           newAttrs["camunda:formKey"] = value;
  //         } else {
  //           delete newAttrs["camunda:formKey"];
  //         }
  //       } else {
  //         const fullKey = `linkinq:${key}`;
  //         if (value) {
  //           newAttrs[fullKey] = value;
  //         } else {
  //           delete newAttrs[fullKey];
  //         }
  //       }
  //     });

  //     modeling.updateProperties(element, newAttrs);
  //   }
  // };

  const handleExport = async () => {
    try {
      if (!diagramRef.current) return;

      const { xml } = await diagramRef.current.saveXML({ format: true });
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
  };

  return (
    <div>
      {editor ? (
        <div style={{ marginBottom: "1rem" }}>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <AppButton
                icon={<FaPlus />}
                iconPosition="left"
                color="light"
                outline
                onClick={handleAddTask}
              >
                Add Task
              </AppButton>
              <AppButton
                icon={<FaSave />}
                iconPosition="left"
                color="light"
                outline
                onClick={handleSave}
              >
                Save XML
              </AppButton>
              <AppButton
                icon={<FaDownload />}
                iconPosition="left"
                color="light"
                outline
                onClick={handleExport}
              >
                Export BPMN
              </AppButton>
            </div>
            <Button
              color="light"
              onClick={() => {
                openModal(
                  <SettingsWorkflow
                    setSettings={setSettings}
                    defaultValues={settings}
                  />,
                  { title: "Settings workflow" }
                );
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
        className="relative w-full border border-gray-300 cursor-pointer"
        style={{
          height: "65vh",
          backgroundImage: "radial-gradient(#ccc 1px, transparent 0)",
          backgroundSize: "20px 20px",
          backgroundPosition: "center",
        }}
      />

      {selectedTask && (
        <AttributesSettings
          entity={settings.entity}
          // attributes={attributes}
          // setAttributes={setAttributes}
          fields={transformAttributesToFormFields(
            attributes,
            schema as unknown as EntitySchema,
            settings.entity
          )}
          onChange={handleAttributeChange}
          selectedTask={selectedTask}
        />
      )}

      {/* 
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
          </button> 
        </div>
      )} */}
    </div>
  );
};

export default BpmnDiagram;
