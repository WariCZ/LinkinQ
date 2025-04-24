import React, { useRef, useState } from "react";
import useStore from "../../../store";
import { FaPlus } from "react-icons/fa";
import { Button } from "flowbite-react";
import Form from "../../../../client/components/DynamicForm";
import { useModalStore } from "../../../../client/components/Modal/modalStore";
import useDataTable from "../../../../client/hooks/useDataTable";
import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import Tree, { TreeNode } from "../../../../client/components/Tree";
import axios from "axios";
import _ from "lodash";
import { AddTrigger } from "./components/AddTrigger";
import { fieldFormTriggers } from "./utils/fieldFormTriggers";
import { AppButton } from "../../../../client/components/common/AppButton";

export const Triggers = () => {
  const schema = useStore((state) => state.schema);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState({} as any);
  const { openModal } = useModalStore();

  const [triggers, setTriggers, { refresh }] = useDataTable(
    {
      entity: "triggers",
    },
    [] as any[]
  );

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  function transformToTree(input: any[]): TreeNode[] {
    const tree: {
      [key: string]: { [key: string]: { [key: string]: TreeNode } };
    } = {};

    input.forEach((item) => {
      // Vytvoření struktur pro typ, metodu a entitu
      if (!tree[item.type]) {
        tree[item.type] = {};
      }
      if (!tree[item.type][item.method]) {
        tree[item.type][item.method] = {};
      }
      if (!tree[item.type][item.method][item.entity]) {
        tree[item.type][item.method][item.entity] = {
          name: item.entity,
          children: [],
        };
      }

      // Přidání listového uzlu
      tree[item.type][item.method][item.entity].children.push({
        name: item.caption,
        ...item,
        children: [], // Leaf nodes nemají žádné další děti
      });
    });

    // Rekonstrukce stromu
    return Object.entries(tree).map(([type, methods]) => ({
      name: type,
      children: Object.entries(methods).map(([method, entities]) => ({
        name: method,
        children: Object.values(entities),
      })),
    }));
  }

  return (
    <div className="h-full">
      <div className="p-2 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ">
        <span className="font-bold">Triggers editor</span>
      </div>
      <div className="flex items-start h-full gap-2">
        <div className="px-3 w-4/12 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700 overflow-x-hidden bg-gray-50 dark:bg-gray-800">
          <div className="pt-1 flex justify-between items-center my-1">
            <div>
              <span className="font-bold">Triggers</span>
              <span className="float-end pl-1">({triggers.length})</span>
            </div>
            <AppButton
              icon={<FaPlus />}
              onClick={() => {
                openModal(
                  <AddTrigger modalLabel="Add trigger" modalSingle={true} />, {
                    title: "Add new trigger",
                  }
                );
              }}
            >
              Add
            </AppButton>
          </div>
          <div>
            <Tree
              data={transformToTree(triggers)}
              onClick={(node) => {
                setSelectedTriggers(node);
              }}
            />
          </div>
        </div>
        {_.keys(selectedTriggers).length > 0 ? (
          <>
            <div className="w-4/12 px-3">
              <Form
                data={selectedTriggers}
                onSubmit={async ({ data }) => {
                  await axios.post("/api/triggers", {
                    ...selectedTriggers,
                    ...data,
                  });
                  refresh();
                }}
                formFields={[
                  {
                    label: "Active",
                    field: "active",
                    type: "checkbox",
                  },
                  ...fieldFormTriggers(schema),
                ]}
              >
                <div className="my-2">
                  <Button type="submit" className="inline-block">
                    Ulozit
                  </Button>
                  <Button
                    color="failure"
                    className="inline-block float-right"
                    onClick={async () => {
                      await axios.delete("/api/triggers", {
                        data: {
                          guid: selectedTriggers.guid as any,
                        },
                      });
                      setSelectedTriggers({});
                      refresh();
                    }}
                  >
                    Smazat
                  </Button>
                </div>
              </Form>
            </div>
            <MonacoEditor
              className="w-4/12"
              value={selectedTriggers.code}
              height="60vh"
              defaultLanguage="javascript"
              defaultValue="// Začni psát svůj kód zde..."
              theme="light"
              onMount={handleEditorDidMount}
              onChange={(code) => {
                setSelectedTriggers({ ...selectedTriggers, code });
              }}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
