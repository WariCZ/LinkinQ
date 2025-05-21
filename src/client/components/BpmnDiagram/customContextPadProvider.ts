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
    // if (element.type !== "bpmn:Task" && element.type !== "bpmn:UserTask") {
    //   return {};
    // }

    return {
      "append.sequence-flow": {
        group: "connect",
        className: "bpmn-icon-connection",
        title: translate("Přidat šipku"),
        action: {
          click: (event, element) => {
            connect.start(event, element, {
              businessObject: { manuallyCreated: true }, // Přidáme flag
            });
          },
          dragstart: (event, element) => {
            connect.start(event, element, {
              businessObject: { manuallyCreated: true },
            });
          },
          //   dragstart: (event, element) => connect.start(event, element),
        },
      },
    };
  };

  //   eventBus.on("shape.added", (e) => {
  //     debugger;
  //     const element = e.element;

  //     // Pokud byl vytvořen EndEvent a máme zdroj
  //     if (element.type === "bpmn:EndEvent" && e.context.source) {
  //       console.log("Tvar přidán:", element);
  //     }
  //   });

  eventBus.on("commandStack.connection.create.postExecute", function (event) {
    const connection = event.context.connection;
    console.log("🆕 Uživatel vytvořil novou šipku:", connection);
    if (connection.type === "bpmn:SequenceFlow") {
      const source = connection.source;
      //   debugger;
      //   modeling.updateProperties(connection, {
      //     name: "Close",
      //   });
      debugger;
      // 1. Získáme existující extensionElements, pokud už nějaké existují
      let extensionElements = source.businessObject.extensionElements || [];

      // 2. Pokud extensionElements neexistují, vytvoříme je
      if (extensionElements.length === 0) {
        extensionElements = [];
      }

      // 3. Vytvoříme nové formField a hodnoty pro enum
      // const enumValues = [
      //   moddle.create("camunda:value", {
      //     id: `to_${connection.target.id}`,
      //     name: connection.target.id,
      //   }),
      // ];

      const formField = moddle.create("camunda:FormField", {
        id: "move",
        type: "enum",
        values: [
          ...extensionElements,
          {
            id: `to_${connection.target.id}`,
            name: connection.target.id,
          },
        ],
      });

      const formData = moddle.create("camunda:FormData", {
        fields: [formField],
      });

      // 4. Přidáme formData do extensionElements, pokud ještě není
      let formDataExists = false;
      extensionElements.forEach((elem) => {
        if (elem.$type === "camunda:FormData") {
          formDataExists = true;
          // Pokud už máme formData, přidáme novou hodnotu do pole formField
          const existingFormField = elem.fields.find(
            (field) => field.id === "move"
          );
          if (existingFormField) {
            // Přidání nových hodnot
            existingFormField.values.push(...enumValues);
          } else {
            elem.fields.push(formField); // Nový formField
          }
        }
      });

      // Pokud tam není žádné formData, přidáme ho
      if (!formDataExists) {
        extensionElements.push(formData);
      }
      // 5. Update properties na source
      modeling.updateProperties(source, {
        extensionElements,
      });

      const conditionExpression = moddle.create("bpmn:FormalExpression", {
        language: "JavaScript",
        body: `$(item.data.move=="to_${connection.target.id}")`,
      });

      modeling.updateProperties(connection, {
        conditionExpression,
      });
    }
  });

  eventBus.on("shape.remove", function (event) {
    const element = event.element;

    // Pokud je to source (task), chceme zkontrolovat extensionElements
    if (element.type === "bpmn:UserTask") {
      const extensionElements = element.businessObject.extensionElements || [];

      // Pokud máme nějaké extensionElements, odstraníme je
      const newExtensionElements = extensionElements.filter((elem) => {
        // Podmínka, že nechceme odstranit všechny extensionElements, ale jen konkrétní
        return elem.$type !== "camunda:FormData"; // Například odstraníme formData
      });

      // Aktualizujeme element, pokud jsme odstranili formData
      if (newExtensionElements.length !== extensionElements.length) {
        modeling.updateProperties(element, {
          extensionElements: newExtensionElements,
        });

        console.log("❌ Odstraněno extensionElements z elementu:", element.id);
      }
    }
  });

  //   eventBus.on("connection.added", function (event) {
  //     const connection = event.element;
  //     const isUserAction =
  //       event.context &&
  //       event.context.hints &&
  //       event.context.hints.createElementsBehavior !== false;
  //     console.log("isUserAction", isUserAction);
  //     if (connection.type === "bpmn:SequenceFlow") {
  //       console.log("🔥 Šipka vytvořena:", connection);
  //       return;
  //       setTimeout(() => {
  //         modeling.updateProperties(connection, {
  //           name: "Close",
  //         });

  //         const conditionExpression = moddle.create("bpmn:FormalExpression", {
  //           language: "JavaScript",
  //           body: '$(item.data.move=="toClose")',
  //         });

  //         modeling.updateProperties(connection, {
  //           conditionExpression,
  //         });
  //       }, 0);
  //     }
  //   });
}

ContextPadProvider.$inject = [
  "contextPad",
  "connect",
  "translate",
  "eventBus",
  "modeling",
  "moddle",
];

// export default function ContextPadProvider(
//   contextPad,
//   create,
//   elementFactory,
//   modeling,
//   connect,
//   translate,
//   eventBus
// ) {
//   contextPad.registerProvider(this);

//   this.getContextPadEntries = function (element) {
//     const actions = {};

//     // if (element.type === "bpmn:UserTask") {
//     actions["append.conditional-flow"] = {
//       group: "connect",
//       className: "bpmn-icon-connection",
//       title: translate("Přidat podmíněnou šipku"),
//       action: {
//         click: (event, sourceElement) => {
//           // 🧱 1. Vytvoření cílového elementu
//           const targetShape = elementFactory.createShape({
//             type: "bpmn:EndEvent",
//           });

//           // Umístění někam blízko (x,y)
//           const position = {
//             x: sourceElement.x + 200,
//             y: sourceElement.y,
//           };

//           create.start(event, targetShape, {
//             source: sourceElement,
//             position,
//           });

//           // 💬 Bude pokračovat drag-drop vytvořením end eventu
//         },
//       },
//     };
//     // }

//     return actions;
//   };

//   eventBus.on("shape.added", (e) => {
//     debugger;
//     const element = e.element;

//     // Pokud byl vytvořen EndEvent a máme zdroj
//     if (element.type === "bpmn:EndEvent" && e.context.source) {
//       console.log("Tvar přidán:", element);
//     }
//   });
// }

// ContextPadProvider.$inject = [
//   "contextPad",
//   "create",
//   "elementFactory",
//   "modeling",
//   "connect",
//   "translate",
//   "eventBus",
// ];
