import { FieldType, EntitySchema } from "../types";

export const defaultExecute = () => {
  return ['CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'];
};

export const defaultFields = (entity: string): Record<string, FieldType> => ({
  caption: {
    type: "text",
    label: "Title",
    isRequired: true,
    description: "Title record",
    system: true,
  },
  guid: {
    type: "uuid",
    isRequired: true,
    label: "GUID",
    description: "GUID record",
    system: true,
  },
  id: {
    type: "bigint",
    isRequired: true,
    label: "ID",
    description: "ID record",
    system: true,
  },
  kind: {
    type: `lov(${entity}Kind)`,
    label: "Type",
    description: "Record type",
    system: true,
  },
  lockedby: {
    type: "link(users)",
    label: "Locked by",
    description: "Record locked by",
    system: true,
  },
  ordering: {
    type: "integer",
    label: "Order",
    description: "Order record",
    system: true,
  },
  parent: {
    type: `link(${entity})`,
    label: "Parent",
    description: "Parent id",
    system: true,
  },
  root: {
    type: `link(${entity})`,
    label: "Root",
    description: "Root id",
    system: true,
  },
  createtime: {
    type: "datetime",
    label: "Created",
    isRequired: true,
    description: "Created datetime",
    default: "now()",
    system: true,
  },
  createdby: {
    type: "link(users)",
    isRequired: true,
    label: "Created by",
    description: "Record created by",
    system: true,
  },
  updatedby: {
    type: "link(users)",
    isRequired: true,
    label: "Updated by",
    description: "Record updated by",
    system: true,
  },
  updatetime: {
    type: "datetime",
    isRequired: true,
    label: "Updated",
    description: "Updated datetime",
    system: true,
    default: "now()",
  },
});

export const workflowFields = (): Record<string, FieldType> => ({
  workflowInstance: {
    type: "link(wf_instances)",
    label: "Workflow instance",
    description: "Workflow instance",
    system: true,
  },
  status: {
    type: "text",
    label: "Status",
    description: "Status",
    system: true,
  },
});
