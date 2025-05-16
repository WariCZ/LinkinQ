declare module "camunda-bpmn-moddle/resources/camunda" {
  const camundaBpmnModdle: any;
  export = camundaBpmnModdle;
}

declare global {
  var prodigi: {
    entityModel: EntitySchema;
  };
}
