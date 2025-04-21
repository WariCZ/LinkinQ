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
import Table from "@/client/components/Table";
import useDataDetail from "@/client/hooks/useDataDetail";

const entity = "tasks";

export const Tasks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { openModal } = useModalStore();
  const filters = location?.state?.filter;
  const header = location?.state?.header;
  const [guidDetail, setGuidDetail] = useState(null);
  const schema = useStore((state) => state.schema);

  const columns = [
    ...[
      /*"guid",*/ "caption",
      "createtime",
      "updatetime",
      "createdby.fullname",
      "updatedby.fullname",
    ],
    ...(schema[entity]
      ? Object.keys(schema[entity].fields)
          .filter((f) => {
            return !schema[entity].fields[f].system;
          })
          .map((f) => {
            if (schema[entity].fields[f].link) {
              if (schema[entity].fields[f].link === "users") {
                return f + ".fullname";
              } else {
                return f + ".caption";
              }
            } else {
              return f;
            }
          })
      : []),
    ...["status"],
  ];

  const fields = Object.keys(schema[entity].fields).filter((f) => {
    return (
      !schema[entity].fields[f].system || f === "caption" || f === "description"
    );
  });

  const [
    dataDetail,
    setDataDataDetail,
    { setRecord, refreshDetail, multiUpdate },
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
      fields: columns,
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
        rowClick={(data: any) => {
          setGuidDetail(data?.guid as string);
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
