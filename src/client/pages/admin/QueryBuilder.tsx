import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../store";
import { Button, Dropdown, TextInput } from "flowbite-react";
import Table from "../../components/Table";

import useDataTable from "../../hooks/useDataTable";
import Form, { FormFieldType } from "../../components/Form";
import { useModalStore } from "../../components/Modal/modalStore";
import useDataDetail from "../../hooks/useDataDetail";
import { BpmnJsReact, useBpmnJsReact } from "bpmn-js-react";
import axios from "axios";
import { ModalPropsType } from "../../components/Modal/ModalContainer";
import { FaPlus } from "react-icons/fa";
import { MdOutlineSchema } from "react-icons/md";
import { useLocation } from "react-router-dom";
import _, { assign } from "lodash";
import { useTranslation } from "react-i18next";
import ReactSelect, { Props as ReactSelectProps } from "react-select";
import ButtonExecuteBpmn from "@/client/components/ButtonExecuteBpmn";

const QueryBuilder = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const filters = location?.state?.filter;
  const header = location?.state?.header;

  const schema = useStore((state) => state.schema);
  const initColumns = ["guid", "caption", "createdby.fullname"];
  const [columns, setColumns] = useState(initColumns);
  const [columnsInput, setColumnsInput] = useState(initColumns.join());

  const [entity, setEntity] = useState("tasks" as string);

  console.log("call ProtectedPage", columns);

  const [
    data,
    setData,
    { loading, refresh, fields, filter, highlightedRow, setOrdering, ordering },
  ] = useDataTable(
    {
      entity: entity,
      fields: columns,
      ordering: [{ id: "createtime", desc: true }],
      filter: filters,
    },
    []
  );

  const handleKeyPressEnter = (e: any) => {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  };

  useEffect(() => {
    if (!_.isEqual(filter, filters)) {
      refresh({ filter: filters || {} });
    }
  }, [filters]);

  const { openModal } = useModalStore();

  console.log("fields", fields);
  return (
    <div className="h-full">
      <div className="flex items-center p-2 justify-between border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <div className="font-bold">
          {header || t("page.admin.querybuilder")}
        </div>
        <div>
          <Button
            className="inline-block mr-2"
            onClick={() =>
              openModal(
                <QueryBuilderDetail entity={entity} refresh={refresh} />
              )
            }
          >
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("add")}
          </Button>
          <Button className="inline-block" onClick={() => refresh()}>
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("refresh")}
          </Button>
        </div>
      </div>
      <div className="p-2">
        <ReactSelect
          className="inline-block min-w-64"
          classNamePrefix="flowbite-select"
          options={_.keys(schema).map((o) => ({ value: o, label: o }))}
          value={{ value: entity, label: entity }}
          styles={{
            option: (base, props) => ({
              ...base,
              padding: "3px 10px",
            }),
          }}
          onChange={(selectedOptions, b) => {
            setEntity(selectedOptions.value);
          }}
        />

        <TextInput
          className="inline-block w-[calc(100%-16rem)] pl-3"
          onChange={(e) => {
            setColumnsInput(e.target.value);
          }}
          onBlur={(e) => {
            setColumns(e.target.value.split(","));
            refresh({ fields: e.target.value.split(",") });
          }}
          onKeyDown={(e) => handleKeyPressEnter(e)}
          value={columnsInput}
        />
      </div>
      <div className="p-2 pt-0">
        <Table
          entity={entity}
          data={data}
          rowClick={(data) =>
            openModal(
              <QueryBuilderDetail
                refresh={refresh}
                modalLabel={"Detail " + entity}
                data={data}
                entity={entity}
              />
            )
          }
          columns={fields}
          loading={loading}
          highlightedRow={highlightedRow}
          ordering={ordering}
          setOrdering={setOrdering}
        />
      </div>
    </div>
  );
};

//
const QueryBuilderDetail = (
  props: { entity: string; data?: any; refresh: any } & ModalPropsType
) => {
  const entity = props.entity;
  const schema = useStore((state) => state.schema);
  console.log("ss", schema[entity]);
  const fields = Object.keys(schema[entity].fields);

  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props?.data?.guid,
      fields: fields,
    },
    {} as any
  );

  return (
    <>
      <Form
        onSubmit={async ({ data }) => {
          await setRecord(data);
          props.refresh();
          props.closeModal && props.closeModal();
        }}
        {...props}
        data={data}
        entity={entity}
        formFields={fields.map((f): FormFieldType => {
          const field = schema[entity].fields[f];
          const fieldObj: any = {
            field: f,
            label: field.label,
            entity: field.link,
            isMulti: field.nlinkTable ? true : false,
            required: field.isRequired,
            default: field.default,
            visible: ["id"].indexOf(f) == -1,
            type: field.link ? "select" : "text",
          };

          if (
            [
              "guid",
              "id",
              "lockedby",
              "createtime",
              "createdby",
              "updatedby",
              "updatetime",
              "status",
              "workflowInstance",
            ].indexOf(f) > -1
          ) {
            fieldObj.readOnly = true;
            fieldObj.required = false;
          }
          if (f == "workflowInstance") {
            fieldObj.labelFields = "name";
          }

          return fieldObj;
        })}
      />
    </>
  );
};

export default QueryBuilder;
