import { FieldType, EntitySchema } from "./types";

export const defaultExecute = () => {
  return ['CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'];
};

export const defaultFields = (entity: string): Record<string, FieldType> => ({
  caption: {
    type: "text",
    label: "Title",
    isRequired: true,
    description: "Title record",
  },
  createtime: {
    type: "datetime",
    label: "Created",
    isRequired: true,
    description: "Created datetime",
    default: "now()",
  },
  guid: {
    type: "uuid",
    isRequired: true,
    label: "GUID",
    description: "GUID record",
  },
  id: {
    type: "bigIncrements",
    isRequired: true,
    label: "ID",
    description: "ID record",
  },
  kind: {
    type: "integer",
    label: "Type",
    description: "Record type",
  },
  lockedby: {
    type: "link(users)",
    label: "Locked by",
    description: "Record locked by",
  },
  ordering: {
    type: "integer",
    label: "Order",
    description: "Order record",
  },
  createdby: {
    type: "link(users)",
    isRequired: true,
    label: "Created by",
    description: "Record created by",
  },
  parent: {
    type: `link(${entity})`,
    label: "Parent",
    description: "Parent id",
  },
  root: {
    type: `link(${entity})`,
    label: "Root",
    description: "Root id",
  },
  updatedby: {
    type: "link(users)",
    isRequired: true,
    label: "Updated by",
    description: "Record updated by",
  },
  updatetime: {
    type: "datetime",
    isRequired: true,
    label: "Updated",
    description: "Updated datetime",
    default: "now()",
  },
  workflow: {
    type: "text",
    label: "Workflow",
    description: "Workflow name",
  },
  workflowInstance: {
    type: "text",
    label: "Workflow instance",
    description: "Workflow instance",
  },
});

export const defaultEntities = (): EntitySchema => ({
  users: {
    fields: {
      fullname: {
        type: "text",
        label: "Fullname",
        isRequired: true,
        description: "Fullname",
      },
      password: {
        type: "password",
        label: "Password",
        description: "Password",
      },
      email: {
        type: "text",
        label: "Email",
        description: "Email",
      },
    },
  },
});

export const defaultData = () => {
  return {
    users: [
      {
        guid: "9500b584-fa8a-4a3c-8f94-92f2221db78b",
        caption: "admin",
        fullname: "admin",
        email: "admin@admin.cz",
        password: "Vorvan5678x",
        createdby: 1,
        updatedby: 1,
      },
    ],
  };
};

export const isSystemEntity = (entityName: string) => {
  return ["users"].indexOf(entityName) > -1;
};
