import React, { useEffect, useState, useMemo, useRef } from "react";
import useStore from "../../store";
import { Button } from "flowbite-react";
import useDataTable from "../../hooks/useDataTable";
import { useModalStore } from "../../components/Modal/modalStore";
import { FaPlus } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { TaskDetail } from "./components/TaskDetail";
import Table from "../../components/Table";
import useDataDetail from "../../hooks/useDataDetail";
import ButtonExecuteBpmn from "../../components/ButtonExecuteBpmn";
import { useColumnStorage } from "../../components/Table/hooks/useColumnStorage";

const entity = "tasks";

const Tasks = () => {
  const { t } = useTranslation();
  const { t: tTasks } = useTranslation("task");
  const location = useLocation();
  const { openModal } = useModalStore();
  const filters = location?.state?.filter;
  const header = location?.state?.header;
  const [guidDetail, setGuidDetail] = useState(null);
  const [modalRequestedGuid, setModalRequestedGuid] = useState<string | null>(
    null
  );
  const schema = useStore((state) => state.schema);
  const ready = !!schema[entity];

  if (!ready) return null;

  const allFields = useMemo(() => {
    if (!schema[entity]) return [];
    return Object.entries(schema[entity].fields)
      .filter(
        ([_, meta]) =>
          !meta.system || ["caption", "description"].includes(meta.name)
      )
      .map(([name, meta]) => {
        const link = meta.link;
        return link
          ? `${name}.${link === "users" ? "fullname" : "caption"}`
          : name;
      });
  }, [schema]);

  const defaultFieldKeys = useMemo(
    () => [
      "caption",
      "createtime",
      "updatetime",
      "createdby.fullname",
      "updatedby.fullname",
      "workflowInstance.name",
      "workflowInstance.source",
      "workflowInstance.items",
      "status",
    ],
    []
  );

  const validDefaultFieldKeys = defaultFieldKeys.filter((key) => {
    const fieldName = key.split(".")[0];
    return schema[entity]?.fields?.[fieldName];
  });

  const { selectedColumns, setSelectedColumns } = useColumnStorage("tasks", validDefaultFieldKeys);

  const tableColumns = useMemo(() => {
    return selectedColumns.map((key) => {
      const base = schema[entity]?.fields?.[key?.split(".")[0]];
      return {
        field: key,
        label: base?.label ?? key,
      };
    });
  }, [selectedColumns, schema]);

  const columns = useMemo(
    () => [
      ...tableColumns,
      {
        field: "actions",
        label: t("labels.actions"),
        cell: ({ row }) => (
          <td onClick={(e) => e.stopPropagation()}>
            <ButtonExecuteBpmn
              showBtnSchema={false}
              status={row.original.status}
              wf={row.original.workflowInstance}
              refresh={refreshDetail}
            />
          </td>
        ),
      },
    ],
    [tableColumns]
  );

  const [
    dataDetail,
    _setDataDetail,
    { loading: loadingDetail, setRecord, refreshDetail, multiUpdate },
  ] = useDataDetail(
    {
      entity,
      guid: guidDetail,
      fields: [
        ...new Set([
          ...selectedColumns.map((k) => k.split(".")[0]),
          "workflowInstance.name",
          "workflowInstance.source",
          "workflowInstance.items",
          "status",
          "createtime",
          "createdby",
          "updatetime",
          "updatedby",
          "attachments.caption",
        ]),
      ],
    },
    {} as any
  );

  const [
    data,
    _setData,
    {
      loading,
      refresh,
      filter,
      highlightedRow,
      setOrdering,
      ordering,
      deleteRecord,
      hasMore,
      fetchNextPage,
    },
  ] = useDataTable(
    {
      entity,
      fields: selectedColumns,
      ordering: [{ id: "createtime", desc: true }],
      filter: filters,
    },
    []
  );

  useEffect(() => {
    if (!_.isEqual(filter, filters)) {
      refresh({ filter: filters || {} });
    }
  }, [filters]);

  useEffect(() => {
    if (
      modalRequestedGuid &&
      !loadingDetail &&
      dataDetail?.guid === modalRequestedGuid
    ) {
      openModal(
        <TaskDetail
          data={dataDetail}
          entity={entity}
          refresh={refreshDetail}
          setRecord={setRecord}
        />,
        {
          title: tTasks("detailTitle"),
          size: "xl",
          modalSingle: true,
        }
      );
      setModalRequestedGuid(null);
    }
  }, [modalRequestedGuid, loadingDetail, dataDetail]);

  return (
    <div className="mx-3">
      <div className="flex items-center justify-between my-3">
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              openModal(
                <TaskDetail
                  entity={entity}
                  refresh={refreshDetail}
                  setRecord={setRecord}
                />,
                {
                  title: tTasks("createTitle"),
                  size: "xl",
                  modalSingle: true,
                }
              )
            }
          >
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("labels.add")}
          </Button>
          <h1 className="text-2xl font-bold">{header || t("page.tasks")}</h1>
        </div>
      </div>
      <Table
        selectable
        tableConfigKey="tasks"
        entity={entity}
        data={data}
        rowClick={(row: any) => {
          setGuidDetail(row.guid);
          setModalRequestedGuid(row.guid);
        }}
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        deleteRecord={deleteRecord}
        setOrdering={setOrdering}
        fetchNextPage={fetchNextPage}
        hasMore={hasMore}
        multiUpdate={multiUpdate}
      />
    </div>
  );
};

export default Tasks;
