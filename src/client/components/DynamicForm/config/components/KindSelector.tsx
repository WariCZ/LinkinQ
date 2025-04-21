import ReactSelect from "react-select";
import { useFormConfigStore } from "../../_store";

export enum TaskKind {
  One = 1,
  Two = 2,
  Three = 3,
}

const kindOptions = [
  { value: TaskKind.One, label: "One" },
  { value: TaskKind.Two, label: "Two" },
  { value: TaskKind.Three, label: "Three" },
];

export const KindSelector = () => {
  const kind = useFormConfigStore((s) => s.kind);
  const setKind = useFormConfigStore((s) => s.setKind);

  const selectedOption = kindOptions.find((opt) => opt.value === kind) ?? null;

  return (
    <div className="w-64">
      <ReactSelect
        classNamePrefix="flowbite-select"
        value={selectedOption}
        options={kindOptions}
        onChange={(option) => {
          if (option) setKind(option.value);
        }}
        placeholder="Vyber kind"
        styles={{
          option: (base) => ({
            ...base,
            padding: "4px 10px",
          }),
        }}
      />
    </div>
  );
};
