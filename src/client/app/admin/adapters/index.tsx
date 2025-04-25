import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../../store";
import { FaPlus } from "react-icons/fa";
import { TextInput } from "flowbite-react";
import { useModalStore } from "../../../../client/components/Modal/modalStore";
import useDataTable from "../../../../client/hooks/useDataTable";
import _ from "lodash";
import { AddAdapters } from "./components/AddAdapters";
import { EditAdapters } from "./components/EditAdapters";
import { AppButton } from "../../../../client/components/common/AppButton";

export const Adapters = () => {
  const schema = useStore((state) => state.schema);
  const entities: string[] = useMemo(() => Object.keys(schema), [schema]);
  const [selectedAdapter, setSelectedAdapter] = useState(
    undefined as { guid: string } | undefined
  );
  const [searchValue, setSearchValue] = useState("");
  const [tableEntities, setTableEntities] = useState([] as string[]);
  const { openModal } = useModalStore();

  const [data, setData] = useDataTable(
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
        <div className="w-1/3 max-w-sm min-w-[240px] px-3 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="pt-1 flex justify-between items-center my-1 gap-2">
            <div>
              <span className="font-bold">Adapters</span>
              <span className="float-end">({data.length})</span>
            </div>
            <AppButton
              icon={<FaPlus />}
              onClick={() => {
                openModal(<AddAdapters />, { title: "Add new addapters" });
              }}
            >
              Add
            </AppButton>
          </div>
          <div className="pt-1">
            <TextInput
              value={searchValue}
              onChange={searchEntity}
              className="w-full"
              placeholder="Hledat..."
            />
          </div>
          <div>
            <ul>
              {data?.map((m) => (
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
