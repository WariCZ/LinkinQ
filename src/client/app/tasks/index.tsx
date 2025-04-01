import React, { useEffect } from "react";
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

export const Tasks = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { openModal } = useModalStore();
  const filters = location?.state?.filter;
  const header = location?.state?.header;

  const schema = useStore((state) => state.schema);

  const entity = "tasks";
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

  const [
    data,
    setData,
    { loading, refresh, filter, highlightedRow, setOrdering, ordering, deleteRecord },
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
              openModal(<TaskDetail entity={entity} />, {
                title: t("Create task"),
                size: "xl",
                modalSingle: true,
              })
            }
          >
            <FaPlus className="ml-0 m-1 h-3 w-3" />
            {t("add")}
          </Button>
          <h1 className="text-2xl font-bold">{header || t("page.tasks")}</h1>
        </div>
      </div>
      <Table
        tableConfigKey="tasks"
        entity={entity}
        data={data}
        rowClick={(data) =>
          openModal(<TaskDetail data={data} entity={entity} />, {
            title: t("Detail task"),
            size: "xl",
            modalSingle: true,
          })
        }
        columns={columns}
        loading={loading}
        highlightedRow={highlightedRow}
        ordering={ordering}
        deleteRecord={deleteRecord}
        setOrdering={setOrdering}
      />
    </div>
  );
};
