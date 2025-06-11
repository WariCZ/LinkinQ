import React, { useEffect, useRef, useState } from "react";
import BpmnViewer from "bpmn-js";
import BpmnModeler from "bpmn-js/lib/Modeler";
import ContextPadProvider from "./customContextPadProvider";
import CustomCamundaModdle from "camunda-bpmn-moddle/resources/camunda";

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

  useEffect(() => {
    if (editor) {
      diagramRef.current = new BpmnModeler({
        container: containerRef.current,
        moddleExtensions: {
          camunda: CustomCamundaModdle,
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

      debugger;
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
      debugger;
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

  return (
    <div>
      {editor ? (
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={handleAddTask}>➕ Přidat Task</button>
          <button onClick={handleSave} style={{ marginLeft: "1rem" }}>
            💾 Uložit XML
          </button>
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
