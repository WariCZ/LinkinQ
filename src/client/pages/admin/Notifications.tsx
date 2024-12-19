import React from "react";
import { Button } from "flowbite-react";
import useDataApi from "../../hooks/useDataDetail";
import Table, { TableFieldType } from "../../components/Table";
import { ColumnDef } from "@tanstack/react-table";
import useDataTable from "../../hooks/useDataTable";
import useDataDetail from "../../hooks/useDataDetail";
import { useModalStore } from "@/client/components/Modal/modalStore";
import Form from "@/client/components/Form/Form";

const Notifications: React.FC = () => {
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

const NotificationDetail = (props: any) => {
  const entity = "notifications";

  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props?.data?.guid,
      fields: [
        "caption",
        "active",
        "entity",
        "method",
        "filter",
        // "adapters",
        "subject",
        "text",
      ],
    },
    {} as any
  );

  //if (loading) return "loading";
  return (
    <Form
      onSubmit={({ data }) => {
        setRecord(data);
        props.closeModal && props.closeModal();
      }}
      {...props}
      data={data}
      entity={entity}
      formFields={[
        "caption",
        "active",
        "entity",
        "method",
        "filter",
        // "adapters",
        "subject",
        "text",
      ]}
    />
  );
};

export default Notifications;
