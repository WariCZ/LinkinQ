import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../../store";
import { FaPlus } from "react-icons/fa";
import { TextInput } from "flowbite-react";
import { useModalStore } from "../../../components/Modal/modalStore";
import { EntityDetail } from "./components/EntityDetail";
import { AddEntity } from "./components/AddEntity";
import { AppButton } from "../../../components/common/AppButton";

const Entity = () => {
  const schema = useStore((state) => state.schema);
  const entities: string[] = useMemo(() => Object.keys(schema), [schema]);
  const [searchValue, setSearchValue] = useState("");
  const [tableEntity, setTableEntity] = useState([] as string[]);
  const [selectedEntity, setSelectedEntity] = useState(entities[0] || "");
  const { openModal } = useModalStore();

  useEffect(() => {
    setTableEntity(entities);
  }, [entities]);

  const searchEntity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setTableEntity(entities.filter((m) => m.indexOf(e.target.value) > -1));
  };

  return (
    <div className="h-full w-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 w-full">
        <span className="font-bold">Entity editor</span>
      </div>
      <div className="flex items-start h-full justify-between">
        <div className="w-1/3 max-w-sm min-w-[240px] px-3 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="pt-1 flex justify-between items-center my-1">
            <div>
              <span className="font-bold pr-1">Entity</span>
              <span className="float-end">({entities.length})</span>
            </div>
            <AppButton
              icon={<FaPlus />}
              onClick={() => {
                openModal(<AddEntity />, {
                  title: "Add new entity",
                  modalSingle: true,
                });
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
              placeholder="Search..."
            />
          </div>
          <div>
            <ul>
              {tableEntity.map((m) => (
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

export default Entity;
