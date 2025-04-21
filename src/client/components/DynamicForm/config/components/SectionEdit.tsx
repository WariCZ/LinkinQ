import { Label, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";

type SectionEditProps = {
  label: string;
  columns: 1 | 2 | 3 | 4 | 6 | 12;
  onChangeLabel: (value: string) => void;
  onChangeColumns: (value: 1 | 2 | 3 | 4 | 6 | 12) => void;
};

export const SectionEdit = ({
  label,
  columns,
  onChangeLabel,
  onChangeColumns,
}: SectionEditProps) => {
  const [localLabel, setLocalLabel] = useState(label);
  const [localColumns, setLocalColumns] = useState(columns);

  useEffect(() => {
    onChangeLabel(localLabel);
  }, [localLabel]);

  useEffect(() => {
    onChangeColumns(localColumns);
  }, [localColumns]);

  return (
    <div className="space-y-4 p-2">
      <TextInput
        value={localLabel}
        onChange={(e) => setLocalLabel(e.target.value)}
        placeholder="Label"
      />
      <Label value="Columns" />
      <Select
        className="w-full border rounded px-2 py-1"
        value={localColumns}
        onChange={(e) =>
          setLocalColumns(Number(e.target.value) as 1 | 2 | 3 | 4 | 6 | 12)
        }
      >
        {[1, 2, 3, 4, 6, 12].map((val) => (
          <option key={val} value={val}>
            {val} column{val > 1 && "s"}
          </option>
        ))}
      </Select>
    </div>
  );
};
