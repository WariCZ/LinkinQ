export default function ContextPadProvider(
  contextPad,
  connect,
  translate,
  eventBus,
  modeling,
  moddle
) {
  contextPad.registerProvider(this);

  this.getContextPadEntries = function (element) {
    return {
      "append.sequence-flow": {
        group: "connect",
        className: "bpmn-icon-connection",
        title: translate("Přidat šipku"),
        action: {
          click: (event, element) => {
            connect.start(event, element, {
              businessObject: { manuallyCreated: true },
            });
          },
          dragstart: (event, element) => {
            connect.start(event, element, {
              businessObject: { manuallyCreated: true },
            });
          },
        },
      },
      delete: {
        group: "edit",
        className: "bpmn-icon-trash",
        title: translate("Smazat úkol testй"),
        action: {
          click: () => {
            const isStartEvent =
              element.businessObject.$type === "bpmn:StartEvent";
            if (isStartEvent) return;
            modeling.removeElements([element]);
          },
        },
        //TODO: remove icon trash if start
        visible: element.businessObject.$type !== "bpmn:StartEvent",
      },
    };
  };

  eventBus.on("commandStack.connection.create.postExecute", function (event) {
    const connection = event.context.connection;
    if (connection.type !== "bpmn:SequenceFlow") return;

    const source = connection.source;
    const target = connection.target;
    const valueId = `to_${target.id}`;

    const value = moddle.create("camunda:Value", {
      id: valueId,
      name: target.id,
    });

    const formField = moddle.create("camunda:FormField", {
      id: "move",
      type: "enum",
      values: [value],
    });

    const formData = moddle.create("camunda:FormData", {
      fields: [formField],
    });

    const extensionElements = moddle.create("bpmn:ExtensionElements", {
      values: [formData],
    });

    modeling.updateProperties(source, { extensionElements });

    const conditionExpression = moddle.create("bpmn:FormalExpression", {
      language: "JavaScript",
      body: `$(item.data.move=="${valueId}")`,
    });

    setTimeout(() => {
      modeling.updateProperties(connection, { conditionExpression });
    }, 0);
  });
}

ContextPadProvider.$inject = [
  "contextPad",
  "connect",
  "translate",
  "eventBus",
  "modeling",
  "moddle",
];
