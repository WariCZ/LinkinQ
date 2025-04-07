import { ModalPropsType } from "@/client/types/common/ModalPropsType";
import useStore from "@/client/store";
import useDataDetail from "@/client/hooks/useDataDetail";
import DynamicForm from "@/client/components/DynamicForm";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
interface ManualTaskProps extends ModalPropsType {
  data?: any;
  entity: "tasks";
}

export const ManualTask = (props: ManualTaskProps) => {
  const { t } = useTranslation();
  const entity = props.entity;

  const schema = useStore((state) => state.schema);
  const fields = Object.keys(schema[entity].fields).filter((f) => {
    return (
      !schema[entity].fields[f].system || f === "caption" || f === "description"
    );
  });

  const [data, setData, { setRecord, loading, refresh }] = useDataDetail(
    {
      entity: entity,
      guid: props.data?.guid,
      fields: [
        ...fields,
        "workflowInstance.name",
        "workflowInstance.source",
        "workflowInstance.items",
        "status",
        "createtime",
        "createdby",
        "updatetime",
        "updatedby",
        "attachments.caption",
      ],
    },
    {} as any
  );

  return (
    <>
      <DynamicForm
        readOnly={true}
        onSubmit={({ data }) => {
          console.log("data", data);
          // setRecord(data);
          // props.closeModal && props.closeModal();
        }}
        {...props}
        data={{
          ...data,
          createtime: data.createtime
            ? DateTime.fromISO(data.createtime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
          updatetime: data.updatetime
            ? DateTime.fromISO(data.updatetime).toFormat("dd.MM.yyyy HH:mm:ss")
            : "",
        }}
        entity={entity}
        formFields={[
          {
            type: "Сomponent",
            component: "Header",
          },
          {
            type: "Tabs",
            tabs: [
              {
                name: t("labels.information"),
                icon: "FaInfoCircle",
                fields: [{ type: "Сomponent", component: "GeneralTab" }],
              },
              {
                name: t("labels.file"),
                icon: "FaPaperclip",
                fields: [{ type: "Сomponent", component: "FilesManagment" }],
              },
              {
                name: t("labels.history"),
                icon: "FaBook",
                fields: [{ type: "Сomponent", component: "FilesManagment" }],
              },
              {
                name: t("labels.prices"),
                icon: "FaDollarSign",
                fields: [],
              },
              {
                name: t("labels.indication"),
                icon: "FaChevronRight",
                fields: [],
              },
            ],
          },
        ]}
      />
    </>
  );
};
