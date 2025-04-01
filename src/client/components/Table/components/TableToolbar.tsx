
import { FaFilter, FaTools, FaTrashAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { AppColumnDef } from "../types";
import { useModalStore } from "../../Modal/modalStore";
import DynamicForm from "../../DynamicForm";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { Button, TextInput } from "flowbite-react";
import { useFilterFields } from "../hooks/useFilterFields";
import { MdCancel } from "react-icons/md";
import { IoCreateOutline } from "react-icons/io5";
import { Dispatch, SetStateAction } from "react";
import BatchEdit from "./BatchEdit";

interface TableToolbarProps {
    filters: Record<string, any>;
    applyFilters: (filters: Record<string, any>) => void;
    clearFilters: () => void
    columns: AppColumnDef<any, any>[];
    applyFullTextSeacrh: (textSearch: string) => void
    fullTextSearch: string;
    selectedRows?: string[];
    setSelectedRows?: Dispatch<SetStateAction<string[]>>;
    deleteSelected?: () => void;
}

export const TableToolbar = ({
    filters,
    columns,
    applyFilters,
    clearFilters,
    applyFullTextSeacrh,
    fullTextSearch,
    selectedRows,
    setSelectedRows,
    deleteSelected
}: TableToolbarProps) => {
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
        <>
            <div className="flex justify-between mb-2">
                <div className={`flex items-center gap-3 transition-opacity duration-200 ${selectedRows.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                    <Button
                        onClick={deleteSelected}
                        color="light"
                    >
                        <div className="flex gap-2 items-center">
                            <FaTrashAlt className="text-sm" />
                            <span>Odstranit vybrané</span>
                        </div>
                    </Button>
                    <Button
                        color="red"
                        onClick={() => {
                            openModal(
                                <BatchEdit
                                    selectedRows={selectedRows}
                                    onConfirm={(fields) => {
                                        console.log(fields);
                                    }}
                                />,
                                {
                                    title: "Hromadné změny",
                                    size: "xl",
                                    modalSingle: true,
                                }
                            );
                        }}
                    >
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
            <div className="flex justify-between py-3 items-center border-t">
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
            </div>
        </>
    );
};
