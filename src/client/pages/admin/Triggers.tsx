import React, { useEffect, useMemo, useRef, useState } from "react";
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
import useDataTable from "@/client/hooks/useDataTable";
import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const Triggers = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState({} as any);
  const [triggers, setTriggers] = useDataTable(
    {
      entity: "triggers",
    },
    [] as any[]
  );

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <span className="font-bold">Triggers editor</span>
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
                // openModal(<AddEntity />);
              }}
            >
              <span className="top-0 flex items-center left-4">
                <FaPlus className="h-3 w-3 mr-2" />
                <span>Add</span>
              </span>
            </Button>
          </div>

          <div className="pt-1">
            <span className="font-bold">Triggers</span>
            <span className="float-end">{triggers.length}</span>
          </div>
          <div className="pt-1"></div>
          <div>
            <ul>
              {triggers.map((m) => (
                <li
                  key={m}
                  onClick={() => setSelectedTriggers(m)}
                  className={`${
                    selectedTriggers.guid === m.guid ? "font-bold" : ""
                  } cursor-pointer`}
                >
                  {m.caption}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <MonacoEditor
          value={selectedTriggers.code}
          height="60vh"
          defaultLanguage="javascript"
          defaultValue="// Začni psát svůj kód zde..."
          theme="light"
          onMount={handleEditorDidMount}
          // onChange={handleCodeChange}
        />
      </div>
    </div>
  );
};

const EntityDetail = ({
  entity,
  definition,
}: {
  entity?: string;
  definition?: EntityType;
}) => {
  const { openModal } = useModalStore();
  const fieldsArray = definition?.fields
    ? Object.entries(definition?.fields).map(([key, value]) => ({
        name: key,
        ...value,
      }))
    : [];

  if (!entity) return <div>Not selected</div>;

  return (
    <div className="p-2 w-full">
      <div className="flex w-full">
        <span className="pr-2">Entity:</span>
        <span className="font-bold pr-2">{entity}</span>
        <Button
          onClick={() => {
            // openModal(<FieldDetail entity={entity} />);
          }}
          size="xs"
        >
          Add Field
        </Button>
        <span className="ml-auto">
          <Button
            disabled={definition?.system}
            color="failure"
            onClick={() => {
              openModal(<DeleteEntity entity={entity} />);
            }}
            size="xs"
          >
            Delete Entity
          </Button>
        </span>
      </div>
      <div className="pt-1">
        <Table
          data={fieldsArray}
          // rowClick={(data) =>
          //   openModal(<FieldDetail data={data} entity={entity} />)
          // }
          columns={[
            { field: "name", className: "font-bold" },
            "type",
            "label",
            "description",
            "default",
          ]}
          // loading={loading}
          // ordering={[{ id: "name" }]}
        />
      </div>
    </div>
  );
};

const DeleteEntity = (props: { entity: string } & ModalPropsType) => {
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      onSubmit={async ({ closeModal, data, setError }) => {
        if (data.entity) {
          if (data.entity === props.entity) {
            await httpRequest({
              url: "/api/entity",
              method: "DELETE",
              entity: "",
              data: {
                entity: data.entity,
              },
            });
            getSchema();
            closeModal && closeModal();
          } else {
            setError("entity", { message: "Názvy nejsou stejné" });
          }
        }
      }}
      formFields={[
        {
          label: "Write entity name",
          field: "entity",
          required: true,
        },
      ]}
      {...props}
    />
  );
};

export default Triggers;