import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, TabsFromType } from "../../../types/DynamicForm/types";
import { EntityType } from "@/lib/entity/types";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { renderItem, translateFormField } from "../utils/FormUtils";
import * as Icons from "react-icons/fa";

export const FormTabs = ({
  tabs,
  control,
  schema,
}: {
  tabs: TabsFromType;
  control: Control<FieldValues, any>;
  schema?: EntityType;
}) => {
  return (
    <Tabs className={"cursor-pointer"}>
      <TabList className={"bg-gray-100 border-gray-200 pl-2"}>
        {tabs.tabs.map((tab) => {
          const IconComponent = Icons[tab.icon] || null;
          return <Tab key={tab.name}>
            <div className="flex gap-2 items-center">
              {IconComponent && <IconComponent className="text-lg" />}
              {tab.name}
            </div>
          </Tab>
        })}
      </TabList>

      {tabs.tabs.map((tab) => (
        <TabPanel key={tab.name}>
          {tab.fields && (
            <div className="cursor-pointer border-t-2 border-gray-300 px-2">
              {tab.fields.map((field, index) => {
                let formField: FormFieldType = translateFormField({
                  schema: schema,
                  field: field,
                });

                return renderItem({
                  formField,
                  key: index,
                  control: control,
                  schema: schema,
                });
              })}
            </div>
          )}
        </TabPanel>
      ))}
    </Tabs>
  );
};
