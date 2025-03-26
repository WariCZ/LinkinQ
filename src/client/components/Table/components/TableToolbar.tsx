
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AppColumnDef } from "../types";
import { useModalStore } from "../../Modal/modalStore";
import DynamicForm from "../../DynamicForm";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { Button, TextInput } from "flowbite-react";
import { useFilterFields } from "../hooks/useFilterFields";
import { MdCancel } from "react-icons/md";

interface TableToolbarProps {
    filters: Record<string, any>;
    applyFilters: (filters: Record<string, any>) => void;
    clearFilters: () => void
    columns: AppColumnDef<any, any>[];
    applyFullTextSeacrh: (textSearch: string) => void
    fullTextSearch: string;
}

export const TableToolbar = ({ filters, columns, applyFilters, clearFilters, applyFullTextSeacrh, fullTextSearch }: TableToolbarProps) => {
    const { t } = useTranslation();
    const { openModal, closeModal } = useModalStore();
    const fields = useFilterFields(columns);

    const handleOpenFilter = () => {
        openModal(
            <DynamicForm
                data={filters}
                formFields={[{
                    type: "Section",
                    fields: fields,
                    className: "flex flex-col p-4"
                }]}
                onSubmit={({ data }) => {
                    applyFilters(data)
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
                            clearFilters()
                            closeModal()
                        },
                        color: hasActiveFilters ? "cyan" : "gray",
                        icon: FaFilterCircleXmark,
                    },
                    {
                        label: t("labels.apply"),
                        onClick: () => {
                            const form = document.querySelector("form");
                            if (form) {
                                form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
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
        Object.values(filters).some((v) => v !== undefined && v !== "" && v !== null);

    const handleClearFilters = () => {
        clearFilters()
    }

    return (
        <div className="flex justify-between mb-2 items-center">
            <TextInput
                id="base"
                type="text"
                className="w-full max-w-[300px]"
                placeholder={t("labels.fullTextSearch")}
                sizing="md" value={fullTextSearch}
                onChange={(e) => {
                    const value = e.target.value
                    applyFullTextSeacrh(value)
                }}
            />

            {hasActiveFilters ? (
                <div className="flex rounded-md overflow-hidden shadow-sm border border-red-700 bg-red-700 text-white">
                    <Button
                        onClick={handleOpenFilter}
                        color="red"
                    >
                        <FaFilter size={12} />
                    </Button>
                    <Button
                        onClick={handleClearFilters}
                        color="red"
                    >
                        <MdCancel />
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={handleOpenFilter}
                    outline
                    color="light"
                >
                    <FaFilter size={12} />
                </Button>
            )}
        </div>
    );
};
