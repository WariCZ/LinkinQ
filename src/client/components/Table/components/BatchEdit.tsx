import { Checkbox } from 'flowbite-react';
import { useState } from 'react';

interface BatchEditProps {
    selectedRows: string[];
    onClose?: () => void;
    onConfirm?: (fieldsToUpdate: string[]) => void;
}

const fields = [
    'Titulek',
];

export const BatchEdit = ({ selectedRows, onClose, onConfirm }: BatchEditProps) => {
    const [selectedFields, setSelectedFields] = useState<string[]>([]);

    const toggleField = (field: string) => {
        setSelectedFields((prev) =>
            prev.includes(field)
                ? prev.filter((f) => f !== field)
                : [...prev, field]
        );
    };

    const handleConfirm = () => {
        onConfirm?.(selectedFields);
        onClose?.();
    };

    return (
        <div className="p-6">
            <div className="space-y-2">
                {fields.map((field) => (
                    <div key={field} className="flex items-center gap-2">
                        <Checkbox
                            id={field}
                            checked={selectedFields.includes(field)}
                            onChange={() => toggleField(field)}
                        />
                        <label htmlFor={field} className="text-sm">
                            {field}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BatchEdit;