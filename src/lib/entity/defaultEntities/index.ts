import { FieldType, EntitySchema } from "../types";

import users from "./users";
import userroles from "./userroles";
import wf_events from "./wf_events";
import wf_instances from "./wf_instances";
import wf_locks from "./wf_locks";
import wf_model from "./wf_models";
import lov from "./lov";
import journal from "./journal";
import triggers from "./triggers";
import tasks from "./tasks";
import adapters from "./adapters";
import notifications from "./notifications";
import attachments from "./attachments";
import attachments_history from "./attachments_history";

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
    type: "integer",
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

export const defaultEntities = (): EntitySchema => {
  return {
    ...users.entityFields,
    ...userroles.entityFields,
    ...lov.entityFields,
    ...wf_events,
    ...wf_instances,
    ...wf_locks,
    ...wf_model,
    ...journal,
    ...attachments_history.entityFields,
    ...attachments.entityFields,
    ...triggers.entityFields,
    ...adapters.entityFields,
    ...notifications.entityFields,
    ...tasks.entityFields,
  };
};

export const defaultData = () => {
  return {
    // ...lov.defaultData,
    // ...users.defaultData,
    ...users.defaultData({ password: process.env.DEFAULT_PASSWORD }),
    ...userroles.defaultData,
    ...notifications.defaultData,
  };
};
