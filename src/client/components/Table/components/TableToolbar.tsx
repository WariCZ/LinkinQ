import { FaFilter, FaTools, FaTrashAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AppColumnDef } from "../types";
import { useModalStore } from "../../Modal/modalStore";
import DynamicForm from "../../DynamicForm";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { Button, TextInput } from "flowbite-react";
import { useFilterFields } from "../hooks/useFilterFields";
import { MdCancel } from "react-icons/md";
import { Dispatch, SetStateAction } from "react";
import { useEditableTextFields } from "../hooks/useEditableTextFields";
import { ManualColumnInput } from "./ManualColumnInput";

interface TableToolbarProps {
  filters: Record<string, any>;
  applyFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  columns: AppColumnDef<any, any>[];
  applyFullTextSeacrh: (textSearch: string) => void;
  fullTextSearch: string;
  selectedRows?: string[];
  setSelectedRows?: Dispatch<SetStateAction<string[]>>;
  deleteSelected?: () => void;
  multiUpdate?: (guids: string[], data: Partial<any>) => Promise<void>;
  fullTextSearchEnabled?: boolean;
  selectedColumns: string[];
  setSelectedColumns: Dispatch<SetStateAction<string[]>>;
  entity: string;
  showAttributesSelector: boolean;
}

export const TableToolbar = ({
  filters,
  columns,
  applyFilters,
  clearFilters,
  applyFullTextSeacrh,
  fullTextSearch,
  selectedRows,
  deleteSelected,
  multiUpdate,
  fullTextSearchEnabled = true,
  selectedColumns,
  setSelectedColumns,
  entity,
  showAttributesSelector,
}: TableToolbarProps) => {
  const { t } = useTranslation();
  const { openModal, closeModal } = useModalStore();
  const fields = useFilterFields(columns);
  const fieldsBatchEditor = useEditableTextFields(columns);

  const handleOpenFilter = () => {
    openModal(
      <DynamicForm
        data={filters}
        formFields={[
          {
            type: "Section",
            fields: fields,
          },
        ]}
        onSubmit={({ data }) => {
          applyFilters(data);
          closeModal();
        }}
      />,
      {
        title: "Filter",
        size: "md",
        modalSingle: true,
        hideSuccessButton: true,
        additionalButtons: [
          {
            label: t("labels.reset"),
            onClick: () => {
              clearFilters();
              closeModal();
            },
            color: hasActiveFilters ? "cyan" : "gray",
            icon: FaFilterCircleXmark,
          },
          {
            label: t("labels.apply"),
            onClick: () => {
              const form = document.querySelector("form");
              if (form) {
                form.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
              }
            },
            color: hasActiveFilters ? "red" : "cyan",
            icon: FaFilter,
          },
        ],
      }
    );
  };

  const handleOpenBatchEditor = () => {
    openModal(
      <DynamicForm
        formFields={[
          {
            type: "Section",
            fields: fieldsBatchEditor,
            className: "flex flex-col p-4",
          },
        ]}
        onSubmit={({ data }) => {
          const filteredData = Object.fromEntries(
            Object.entries(data).filter(
              ([_, value]) =>
                value !== "" && value !== null && value !== undefined
            )
          );
          if (Object.keys(filteredData).length > 0) {
            multiUpdate(selectedRows, filteredData);
          }
          closeModal();
        }}
      />,
      {
        title: "Hromadne zmeny",
        size: "md",
        modalSingle: true,
        hideSuccessButton: true,
        additionalButtons: [
          {
            label: t("labels.apply"),
            onClick: () => {
              const form = document.querySelector("form");
              if (form) {
                form.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
              }
            },
            color: hasActiveFilters ? "red" : "cyan",
            icon: FaFilter,
          },
        ],
      }
    );
  };

  const hasActiveFilters =
    fullTextSearch.length > 0 ||
    Object.values(filters).some(
      (v) => v !== undefined && v !== "" && v !== null
    );

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <>
      {showAttributesSelector && (
        <ManualColumnInput
          selected={selectedColumns}
          onChange={setSelectedColumns}
          entity={entity}
        />
      )}

      <div className="flex justify-between mb-2">
        <div
          className={`flex items-center gap-3 transition-opacity duration-200 ${
            selectedRows.length > 0
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Button onClick={deleteSelected} color="light">
            <div className="flex gap-2 items-center">
              <FaTrashAlt className="text-sm" />
              <span>Odstranit vybrané</span>
            </div>
          </Button>
          <Button color="red" onClick={handleOpenBatchEditor}>
            <div className="flex gap-2 items-center">
              <FaTools className="text-sm" />
              <span>Hromadné změny...</span>
            </div>
          </Button>
        </div>
        {hasActiveFilters ? (
          <div className="flex rounded-md overflow-hidden shadow-sm border border-red-700 bg-red-700 text-white h-[30px]">
            <Button
              className="h-[30px] items-center"
              onClick={handleOpenFilter}
              color="red"
            >
              <FaFilter size={12} />
            </Button>
            <Button
              className="h-[30px] items-center"
              onClick={handleClearFilters}
              color="red"
            >
              <MdCancel size={12} />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleOpenFilter}
            outline
            color="light"
            className="h-[30px] items-center"
          >
            <FaFilter size={12} />
          </Button>
        )}
      </div>
      {fullTextSearchEnabled && (
        <div className="flex justify-between py-3 items-center border-t">
          <TextInput
            id="base"
            type="text"
            className="w-full max-w-[300px]"
            placeholder={t("labels.fullTextSearch")}
            sizing="md"
            value={fullTextSearch}
            onChange={(e) => {
              const value = e.target.value;
              applyFullTextSeacrh(value);
            }}
          />
        </div>
      )}
    </>
  );
};
