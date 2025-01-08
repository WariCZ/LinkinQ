import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../store";
import { HiRefresh } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { Button, TextInput } from "flowbite-react";
import Table from "../../components/Table";
import { EntitySchema, EntityType, FieldType } from "@/lib/entity/types";
import Form from "@/client/components/Form/Form";
import { useModalStore } from "@/client/components/Modal/modalStore";
import useDataDetail, { httpRequest } from "@/client/hooks/useDataDetail";
import { ModalPropsType } from "@/client/components/Modal/ModalContainer";
import { FaFileExport } from "react-icons/fa";
import useDataTable from "@/client/hooks/useDataTable";
import axios from "axios";
import Select from "@/client/components/Form/Select";
import _ from "lodash";

const Adapters = () => {
  const schema = useStore((state) => state.schema);
  const entities: string[] = useMemo(() => Object.keys(schema), [schema]);
  const [selectedAdapter, setSelectedAdapter] = useState(
    undefined as { guid: string } | undefined
  );
  const [searchValue, setSearchValue] = useState("");
  const [tableEntities, setTableEntities] = useState([] as string[]);
  const { openModal } = useModalStore();

  const [
    data,
    setData,
    { loading: loadingData, refresh, fields, filter, highlightedRow },
  ] = useDataTable(
    {
      entity: "adapters",
      ordering: [{ id: "createtime", desc: true }],
    },
    [] as any
  );

  useEffect(() => {
    setTableEntities(entities);
  }, [entities]);

  const searchEntity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setTableEntities(entities.filter((m) => m.indexOf(e.target.value) > -1));
  };

  console.log("Adapters ", data);
  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <span className="font-bold">Adapters</span>
        {/* <HiRefresh
          className="inline-block mx-3 cursor-pointer"
          // onClick={() => getEntities(true)}
        /> */}
      </div>
      <div className="flex items-start h-full">
        <div className="px-3 w-48 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="py-1"></div>
          <div className="pt-1">
            <Button
              className="h-full"
              onClick={() => {
                openModal(<AddAdapters />);
              }}
            >
              <span className="top-0 flex items-center left-4">
                <FaPlus className="h-3 w-3 mr-2" />
                <span>Add</span>
              </span>
            </Button>
          </div>

          <div className="pt-1">
            <span className="font-bold">Adapters</span>
            <span className="float-end">{data.length}</span>
          </div>
          <div className="pt-1">
            <TextInput
              style={{ maxHeight: 18 }}
              value={searchValue}
              onChange={searchEntity}
              className="w-full"
              placeholder="Hledat..."
            />
          </div>
          <div>
            <ul>
              {data.map((m) => (
                <li
                  key={m}
                  onClick={() => setSelectedAdapter(m)}
                  className={`${selectedAdapter === m ? "font-bold" : ""} ${
                    m.active ? "" : "line-through"
                  } cursor-pointer`}
                >
                  {m.caption}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <EditAdapters guid={selectedAdapter?.guid} />
      </div>
    </div>
  );
};

const AddAdapters = (props: ModalPropsType) => {
  const [adapters, setAdapters] = useState([]);
  const [selectedAdapter, setSelectedAdapter] = useState(undefined as any);
  const getRoutes = async () => {
    const ret = await axios.get("/adapters/adaptersType");
    setAdapters(ret.data || []);
  };

  useEffect(() => {
    getRoutes();
  }, []);

  return (
    <div>
      AddAdapters
      <div>
        <Form
          onSubmit={async ({ data, setError }) => {
            debugger;
            await axios.post("/adapters/setAdapter", data);
          }}
          onChange={({ data }) => {
            if (data.type) setSelectedAdapter(adapters[data.type]);
          }}
          //   data={}
          formFields={[
            {
              type: "select",
              field: "type",
              label: "Type",
              required: true,
              options: _.keys(adapters)?.map((item) => ({
                value: item,
                label: item,
              })),
            },
            ...(selectedAdapter?.form || []),
          ]}
          formRef={props.formRef}
        />
      </div>
    </div>
  );
};

const EditAdapters = (props: ModalPropsType & { guid: string }) => {
  // const [adapters, setAdapters] = useState([]);

  const [adapter, setAdapter, { setRecord }] = useDataDetail({
    entity: "adapters",
    guid: props.guid,
  });

  // const [selectedAdapter, setSelectedAdapter] = useState(undefined as any);
  // const getRoutes = async () => {
  //   const ret = await axios.get("/adapters/adaptersType");
  //   setAdapters(ret.data || []);
  // };

  // useEffect(() => {
  //   getRoutes();
  // }, []);

  console.log("EditAdapters", props, adapter);
  if (!adapter) return null;
  return (
    <div>
      AddAdapters
      <div>
        <Form
          onSubmit={async ({ data, setError }) => {
            debugger;
            // setRecord(data);
            await axios.post("/adapters/setAdapter", {
              ...data,
              type: (adapter as any).type,
            });
          }}
          // onChange={({ data }) => {
          //   if (data.adapterType)
          //     setSelectedAdapter(adapters[data.adapterType]);
          // }}
          entity="adapters"
          data={adapter}
          formFields={[
            {
              type: "text",
              field: "type",
              label: "Type",
              readOnly: true,
            },
            {
              type: "text",
              field: "caption",
              readOnly: true,
            },
            {
              type: "checkbox",
              field: "active",
            },
            // ...(selectedAdapter?.form || []),
          ]}
          formRef={props.formRef}
        >
          <Button type="submit" className="inline-block">
            Ulozit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Adapters;
