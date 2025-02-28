import React from "react";
import Table, { TableFieldType } from "../../../components/Table";
import useDataTable from "../../../hooks/useDataTable";
import { useModalStore } from "@/client/components/Modal/modalStore";
import { NotificationDetail } from "./components/NotificationDetail";

export const Notifications: React.FC = () => {
  const { openModal } = useModalStore();
  const [
    data,
    setData,
    { loading: loadingData, refresh, fields, filter, highlightedRow },
  ] = useDataTable(
    {
      entity: "notifications",
      fields: [
        "caption",
        "active",
        "entity",
        "method",
        "filter",
        "adapters",
        "subject",
      ],
      ordering: [{ id: "createtime", desc: true }],
    },
    [] as any
  );

  //   if (loadingData) return "Loading";

  const columns: TableFieldType[] = [
    "caption",
    "active",
    "entity",
    "method",
    {
      field: "filter",
      cell: ({ getValue }) => JSON.stringify(getValue()),
    },
    // "adapters",
    "subject",
  ];

  return (
    <div className="h-full">
      <h1></h1>
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <span className="font-bold">Notifications</span>
      </div>
      <div className="p-2">
        <Table
          data={data}
          columns={columns}
          highlightedRow={highlightedRow}
          entity="notifications"
          rowClick={(data) => openModal(<NotificationDetail data={data} />)}
        />
      </div>
    </div>
  );
};
