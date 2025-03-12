import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../../store";
import { FaPlus } from "react-icons/fa";
import { Button, TextInput } from "flowbite-react";
import { useModalStore } from "@/client/components/Modal/modalStore";
import { EntityDetail } from "./components/EntityDetail";
import { AddEntity } from "./components/AddEntity";

export const Entity = () => {
  const schema = useStore((state) => state.schema);
  const entities: string[] = useMemo(() => Object.keys(schema), [schema]);
  const [selectedEntity, setSelectedEntity] = useState("" as string);
  const [searchValue, setSearchValue] = useState("");
  const [tableEntities, setTableEntities] = useState([] as string[]);
  const { openModal } = useModalStore();

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
        <span className="font-bold">Entity editor</span>
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
                openModal(<AddEntity />);
              }}
            >
              <span className="top-0 flex items-center left-4">
                <FaPlus className="h-3 w-3 mr-2" />
                <span>Add</span>
              </span>
            </Button>
          </div>

          <div className="pt-1">
            <span className="font-bold">Entities</span>
            <span className="float-end">{entities.length}</span>
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
              {tableEntities.map((m) => (
                <li
                  key={m}
                  onClick={() => setSelectedEntity(m)}
                  className={`${
                    selectedEntity === m ? "font-bold" : ""
                  } cursor-pointer`}
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <EntityDetail
          entity={selectedEntity}
          definition={schema && schema[selectedEntity]}
        />
      </div>
    </div>
  );
};
