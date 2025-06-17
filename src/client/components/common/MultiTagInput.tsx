import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";

interface MultiTagInputProps {
  values: string[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onChange: (newValues: string[]) => void;
  suggestions?: { label: string; value: string }[];
}

export const MultiTagInput = ({
  values,
  onChange,
  suggestions = [],
  inputValue,
  setInputValue,
}: MultiTagInputProps) => {
  const { t: tComponents } = useTranslation("components");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const input = inputValue.trim();
    const isValid = suggestions.some((s) => s.value === input);

    if (input && isValid && !values.includes(input)) {
      onChange([...values, input]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = inputValue.trim();
    const matchingSuggestions = suggestions.filter((s) => s.value === input);
    const filteredSuggestions = suggestions.filter(
      (s) =>
        !values.includes(s.value) &&
        (s.label.toLowerCase().includes(input.toLowerCase()) ||
          s.value.toLowerCase().includes(input.toLowerCase()))
    );

    if (["Enter", ",", ";", " "].includes(e.key)) {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        const first = filteredSuggestions[0];
        if (!values.includes(first.value)) {
          onChange([...values, first.value]);
          setInputValue("");
        }
      }
      return;
    }

    if (e.key === "Backspace" && input === "") {
      if (selected.size === 0 && values.length > 0) {
        const last = values[values.length - 1];
        setSelected(new Set([last]));
      } else {
        onChange(values.filter((v) => !selected.has(v)));
        setSelected(new Set());
      }
    }

    if (e.key === "Delete" && selected.size > 0) {
      onChange(values.filter((v) => !selected.has(v)));
      setSelected(new Set());
    }
  };

  const handleTagClick = (val: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  const handleRemove = (val: string) => {
    onChange(values.filter((v) => v !== val));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(val);
      return next;
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement !== inputRef.current &&
        (e.key === "Backspace" || e.key === "Delete")
      ) {
        if (selected.size > 0) {
          onChange(values.filter((v) => !selected.has(v)));
          setSelected(new Set());
        } else if (values.length > 0) {
          const last = values[values.length - 1];
          setSelected(new Set([last]));
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selected, values]);

  const filteredSuggestions = suggestions
    .filter((s) => {
      if (values.includes(s.value)) return false;

      const hasDotInInput = inputValue.includes(".");
      const isNestedField = s.value.includes(".");

      if (hasDotInInput) {
        return (
          isNestedField &&
          (s.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            s.value.toLowerCase().includes(inputValue.toLowerCase()))
        );
      } else {
        return (
          !isNestedField &&
          (s.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            s.value.toLowerCase().includes(inputValue.toLowerCase()))
        );
      }
    })
    .sort((a, b) => {
      const input = inputValue.toLowerCase();
      const aStarts = a.value.toLowerCase().startsWith(input) ? -1 : 0;
      const bStarts = b.value.toLowerCase().startsWith(input) ? -1 : 0;
      return aStarts - bStarts;
    });

  return (
    <div
      className="flex flex-wrap items-center gap-2 border px-2 py-1 rounded-md bg-white relative w-full"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((val) => (
        <div
          key={val}
          onClick={(e) => {
            e.stopPropagation();
            handleTagClick(val);
          }}
          className={`text-xs flex items-center gap-1 border rounded px-2 py-1 cursor-pointer ${
            selected.has(val)
              ? "bg-blue-100 border-blue-400"
              : "bg-gray-100 border-gray-300"
          }`}
        >
          <span>{val}</span>
          <FiX
            className="text-gray-400 hover:text-red-500"
            size={14}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(val);
            }}
          />
        </div>
      ))}

      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[120px] text-sm outline-none border-none bg-transparent"
        placeholder={tComponents("labels.placeholderAddColumn")}
      />

      {inputValue && (
        <div className="absolute top-full left-0 w-full border rounded shadow bg-white z-50 mt-1 max-h-60 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((s) => (
              <div
                key={s.value}
                onClick={() => {
                  onChange([...values, s.value]);
                  setInputValue("");
                }}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
              >
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-gray-500">{s.value}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400 italic">
              {tComponents("labels.noSuggestions")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
