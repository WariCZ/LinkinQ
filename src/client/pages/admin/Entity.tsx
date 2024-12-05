import React, { useEffect, useMemo, useState } from "react";
import useStore from "../../store";
import { HiRefresh } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import { Button, TextInput } from "flowbite-react";
import Table from "../../components/Table";
import { EntitySchema, EntityType, FieldType } from "@/lib/entity/types";
import Form from "@/client/components/Form/Form";
import { useModalStore } from "@/client/components/Modal/modalStore";
import { httpRequest } from "@/client/hooks/useDataDetail";
import { ModalPropsType } from "@/client/components/Modal/ModalContainer";
import { FaFileExport } from "react-icons/fa";
import { exportJsonFile } from "@/client/utils";

const Entity = () => {
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

  const exportEntity = () => {
    exportJsonFile({
      json: { [entity]: definition },
      filename: entity,
    });
  };

  if (!entity) return <div>Not selected</div>;

  return (
    <div className="p-2 w-full">
      <div className="flex w-full">
        <span className="pr-2">Entity:</span>
        <span className="font-bold pr-2">{entity}</span>
        <Button
          onClick={() => {
            openModal(<FieldDetail entity={entity} />);
          }}
          size="xs"
        >
          Add Field
        </Button>
        <span className="ml-auto"></span>
        <span className="ml-auto">
          <FaFileExport
            className="inline-block mx-2 cursor-pointer"
            onClick={exportEntity}
          />
          <Button
            className="inline-block"
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
          rowClick={(data) =>
            openModal(<FieldDetail data={data} entity={entity} />)
          }
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
      onSubmit={async ({ data, setError }) => {
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
            props.closeModal && props.closeModal();
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
          type: "text",
        },
      ]}
      {...props}
    />
  );
};

const AddEntity = (props: ModalPropsType) => {
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      onSubmit={async ({ data }) => {
        await httpRequest({
          url: "/api/entity",
          method: "POST",
          entity: "",
          data: {
            entity: data.entity,
          },
        });
        getSchema();
        props.closeModal && props.closeModal();
      }}
      formFields={[
        {
          label: "Entity",
          field: "entity",
          required: true,
          type: "text",
        },
      ]}
      {...props}
    />
  );
};

const FieldDetail = (
  props: { entity: string; data?: object } & ModalPropsType
) => {
  const getSchema = useStore((state) => state.getSchema);
  return (
    <Form
      disabled={!!props.data}
      onSubmit={async ({ data }) => {
        if (data.type.indexOf("link") > -1) {
          data.type = `${data.type}(${data.entity})`;
          delete data.entity;
        }

        await httpRequest({
          url: "/api/entityField",
          method: "POST",
          entity: "",
          data: {
            entity: props.entity,
            fields: [
              {
                type: data.type,
                name: data.name,
                label: data.label,
                description: data.description,
              },
            ],
          },
        });
        getSchema();
        props.closeModal && props.closeModal();
      }}
      data={props.data}
      formFields={[
        {
          label: "Name",
          field: "name",
          required: true,
          type: "text",
        },
        {
          label: "Label",
          field: "label",
          required: true,
          type: "text",
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          required: true,
          options: [
            { label: "text", value: "text" },
            { label: "link", value: "link" },
            { label: "nlink", value: "nlink" },
          ],
        },
        {
          field: "entity",
          label: "Entity",
          type: "select",
          required: true,
          options: [
            { label: "users", value: "users" },
            { label: "tasks", value: "tasks" },
          ],
          rules: [
            {
              type: "show",
              conditions: [
                {
                  type: "link",
                },
                {
                  type: "nlink",
                },
              ],
            },
          ],
        },
        {
          label: "Description",
          field: "description",
          type: "text",
        },
      ]}
      {...props}
    />
  );
};

export default Entity;
