import React, { useState } from "react";
import { TextInput, Button } from "flowbite-react";

const WordTagInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState([]);
  const [suggestions] = useState([
    "React",
    "JavaScript",
    "Node.js",
    "CSS",
    "HTML",
    "Flowbite",
  ]);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setInputValue(value);

    // Filtrace návrhů na základě zadávaného textu
    setFilteredSuggestions(
      suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleKeyDown = (e: any) => {
    if (
      e.key === "Enter" &&
      inputValue &&
      filteredSuggestions.includes(inputValue)
    ) {
      setTags((prevTags) => [...prevTags, inputValue] as any);
      setInputValue(""); // Reset inputu po přidání
    } else if (e.key === "Backspace" && inputValue === "") {
      // Mazání poslední buňky při backspace
      setTags((prevTags) => prevTags.slice(0, -1));
    }
  };

  const handleTagRemove = (index: number) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 bg-blue-200 text-blue-800 rounded-full"
            >
              {tag}
              <Button
                size="xs"
                className="ml-2"
                onClick={() => handleTagRemove(index)}
                // variant="link"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        <TextInput
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Zadejte slovo"
          className="w-60"
        />
      </div>

      <div className="mt-2">
        {inputValue && filteredSuggestions.length > 0 && (
          <ul className="border border-gray-300 rounded-md shadow-md bg-white max-h-48 overflow-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setTags((prevTags) => [...prevTags, suggestion] as any);
                  setInputValue(""); // Reset inputu po přidání
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WordTagInput;
