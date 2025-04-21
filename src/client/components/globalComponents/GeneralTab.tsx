import { CollapsibleSection } from "@/client/components/CollapsibleSection";
import { FormField } from "@/client/components/DynamicForm/fields/FormField";
import { Button } from "flowbite-react";
import { FaFolderOpen } from "react-icons/fa";

function GeneralTab(props) {
  return (
    <div className="p-4">
      <FormField
        formField={{
          type: "richtext",
          label: "Popis: ",
          field: "description",
          className: "mb-4",
        }}
        readOnly={props.readOnly}
        control={props.control}
      />
      <CollapsibleSection
        title="Soubor ze SŘ"
        className="mb-4"
        icon={FaFolderOpen}
      >
        <div>
          <h4 className="text-gray-700 font-semibold mb-1">Soubor ze SŘ:</h4>
          <p className="text-gray-500 italic mb-2">Nejsou žádné záznamy</p>
          <Button color="gray" size="sm" outline>
            + Zvolit...
          </Button>
        </div>
      </CollapsibleSection>

      <FormField
        readOnly={props.readOnly}
        formField={{
          type: "CollapsibleSection",
          field: "parentSR",
          label: "Nadrizene SR",
          icon: FaFolderOpen,
          children: [
            {
              type: "Section",
              className: "grid grid-cols-3 gap-4 items-center",
              fields: [
                {
                  type: "text",
                  field: "SPZN",
                  label: "SPZN:",
                  colSpan: 1,
                },
                {
                  type: "text",
                  field: "nazevSR",
                  label: "Název SŘ:",
                  colSpan: 1,
                },
                {
                  type: "datetime",
                  field: "datumZahajeni",
                  label: "Datum zahájení:",
                  colSpan: 1,
                },
              ],
            },
          ],
        }}
        control={props.control}
      />
      <div className="border-t border-gray-300 pt-3 mt-3">
        <h4 className="text-gray-700 font-semibold">Léčivé přípravky:</h4>
        <p className="text-gray-500 italic mt-1">Nejsou žádné záznamy</p>
      </div>
    </div>
  );
}
export default GeneralTab;
