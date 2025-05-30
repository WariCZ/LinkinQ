import React, { useEffect, useState } from "react";
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
import ButtonExecuteBpmn from "../../../../src/client/components/ButtonExecuteBpmn";

const entity = "tasks";

export const Tasks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { openModal } = useModalStore();
  const filters = location?.state?.filter;
  const header = location?.state?.header;
  const [guidDetail, setGuidDetail] = useState(null);
  const [modalRequestedGuid, setModalRequestedGuid] = useState<string | null>(
    null
  );
  const schema = useStore((state) => state.schema);

  const fieldKeys = [
    "caption",
    "createtime",
    "updatetime",
    "createdby.fullname",
    "updatedby.fullname",
    "workflowInstance.name",
    "workflowInstance.source",
    "workflowInstance.items",
    ...(schema[entity]
      ? Object.keys(schema[entity].fields)
          .filter((f) => !schema[entity].fields[f].system)
          .map((f) => {
            const link = schema[entity].fields[f].link;
            return link
              ? link === "users"
                ? f + ".fullname"
                : f + ".caption"
              : f;
          })
      : []),
    "status",
  ];

  const fields = Object.keys(schema[entity].fields).filter((f) => {
    return (
      !schema[entity].fields[f].system || f === "caption" || f === "description"
    );
  });

  const [
    dataDetail,
    setDataDataDetail,
    {
      loading: loadingDetail,
      setRecord,
      refreshDetail,
      multiUpdate,
      getSingleRecord,
    },
  ] = useDataDetail(
    {
      entity: entity,
      guid: guidDetail,
      fields: [
        ...fields,
        "workflowInstance.name",
        "workflowInstance.source",
        "workflowInstance.items",
        "status",
        "createtime",
        "createdby",
        "updatetime",
        "updatedby",
        "attachments.caption",
      ],
    },
    {} as any
  );

  const columns = [
    ...fieldKeys,
    {
      field: "actions",
      label: "Actions",
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
  ];

  const [
    data,
    setData,
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
      entity: entity,
      fields: fieldKeys,
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
          title: t("Detail task"),
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
                  title: t("Create task"),
                  size: "xl",
                  modalSingle: true,
                }
              )
            }
          >
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("add")}
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
