import React, { useEffect, useState } from "react";
import useStore from "../../../store";
import { TextInput } from "flowbite-react";
import Table from "../../../components/Table";
import useDataTable from "../../../hooks/useDataTable";
import { useModalStore } from "../../../components/Modal/modalStore";
import { FaPlus } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import ReactSelect from "react-select";
import { QueryBuilderDetail } from "./components/QueryBuilderDetail";
import { IoReload } from "react-icons/io5";
import { AppButton } from "../../../components/common/AppButton";

const QueryBuilder = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const filters = location?.state?.filter;
  const header = location?.state?.header;
  const schema = useStore((state) => state.schema);
  const initColumns = ["guid", "caption", "createdby.fullname"];
  const { openModal } = useModalStore();

  const [columns, setColumns] = useState(initColumns);
  const [columnsInput, setColumnsInput] = useState(initColumns.join());
  const [entity, setEntity] = useState("tasks" as string);

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

  useEffect(() => {
    refresh();
  }, [entity]);

  return (
    <div className="h-full">
      <div className="flex items-center p-2 justify-between border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <div className="font-bold">
          {header || t("page.admin.querybuilder")}
        </div>
        <div className="flex gap-2">
          <AppButton
            icon={<FaPlus />}
            onClick={() =>
              openModal(
                <QueryBuilderDetail entity={entity} refresh={refresh} />,
                { title: "Query Create" }
              )
            }
          >
            {t("add")}
          </AppButton>
          <AppButton icon={<IoReload />} onClick={() => refresh()}>
            Reload
          </AppButton>
        </div>
      </div>
      <div className="p-2 flex items-center">
        <ReactSelect
          className="inline-block min-w-64"
          classNamePrefix="flowbite-select"
          options={_.keys(schema).map((o) => ({ value: o, label: o }))}
          value={{ value: entity, label: entity }}
          styles={{
            option: (base) => ({
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
          settingColumnsEnabled={false}
          tableConfigKey="queryBuilder"
          entity={entity}
          data={data}
          rowClick={(data) =>
            openModal(
              <QueryBuilderDetail
                refresh={refresh}
                modalLabel={"Detail " + entity}
                data={data}
                entity={entity}
              />,
              { title: "Query detail" }
            )
          }
          columns={fields}
          loading={loading}
          highlightedRow={highlightedRow}
          ordering={ordering}
          setOrdering={setOrdering}
          fullTextSearchEnabled={false}
        />
      </div>
    </div>
  );
};

export default QueryBuilder;
