import { Control, FieldValues } from "react-hook-form";
import { FormFieldType, TabsFromType } from "../../../types/DynamicForm/types";
import { EntityType } from "@/lib/entity/types";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { renderItem, translateFormField } from "../utils/FormUtils";

export const FormTabs = ({
    tabs,
    control,
    schema,
}: {
    tabs: TabsFromType;
    control: Control<FieldValues, any>;
    schema?: EntityType;
}
) => {
    return (
        <Tabs className={"mt-2"}>
            <TabList>
                {tabs.tabs.map((tab) => (
                    <Tab key={tab.name}>{tab.name}</Tab>
                ))}
            </TabList>

            {tabs.tabs.map((tab) => (
                <TabPanel key={tab.name}>
                    {tab.fields && (
                        <div>
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