import React from "react";
import { Button } from "flowbite-react";
import Table from "../../../../client/components/Table";
import useDataTable from "../../../hooks/useDataTable";
import { IoReload } from "react-icons/io5";
import { AppButton } from "../../../../client/components/common/AppButton";

export const Journal: React.FC = () => {
  const [data, setData, { refresh, fields, highlightedRow, fetchNextPage }] =
    useDataTable(
      {
        entity: "journal",
        fields: [
          "id",
          "user",
          "fields_old",
          "fields_diff",
          "fields_new",
          "entity",
          "operation",
        ],
        ordering: [{ id: "createtime", desc: true }],
      },
      [] as {
        fields_old: string;
        fields_diff: string;
        fields_new: string;
        guid: string;
      }[]
    );

  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <div className="flex justify-between items-center">
          <span className="font-bold">Journal</span>
          <AppButton icon={<IoReload />} onClick={() => refresh()}>
            Reload
          </AppButton>
        </div>
      </div>
      <div className="p-2">
        <Table
          tableConfigKey="journal"
          data={data}
          columns={fields}
          highlightedRow={highlightedRow}
          entity="journal"
          fetchNextPage={fetchNextPage}
          fullTextSearchEnabled={false}
          settingColumnsEnabled={false}
        />
      </div>
    </div>
  );
};
