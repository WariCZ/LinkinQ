"use client";
import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import axios from "axios";
import { Button } from "flowbite-react";
import { ServerSideOutputType } from "@/lib/entity/routes";

const ServerScript = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [decorationId, setDecorationId] = useState(null);

  const [output, setOutput] = useState([
    // { msg: "...", type: "error", time: "dd.MM.yyyy HH:mm:ss.SSS" },
  ] as ServerSideOutputType[]);
  const [code, setCode] = useState<string>(() => {
    const savedCode = localStorage.getItem("editorCode");
    return savedCode || "// Začni psát svůj kód zde...";
  });

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCodeChange = (newValue?: string) => {
    if (newValue !== undefined) {
      setCode(newValue);
      localStorage.setItem("editorCode", newValue);
    }
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    if (decorationId) {
      editorRef.current.removeDecorations([decorationId]);
    }
    const code = editorRef.current.getValue();

    setCode(code);
    localStorage.setItem("editorCode", code);

    try {
      const ret = await axios.post("/api/run-code", { code });

      setOutput([...output, ...ret.data.output]);
    } catch (error: any) {
      const { line, column } = error.response.data;

      setOutput([...output, error.response.data.message as any]);

      const col = editorRef.current.createDecorationsCollection([
        {
          range: new monaco.Range(parseInt(line) - 2, 0, parseInt(line) - 2, 5),
          options: {
            className: "errorHighlight",
            inlineClassName: "errorHighlight",
          },
        },
      ]);

      setDecorationId((col as any)._decorationIds[0]);
    }
  };

  return (
    <div className="p-2">
      <h1 className="font-bold py-2">Server side scripts</h1>
      <Button className="absolute top-2 right-3" onClick={runCode}>
        Spustit kód
      </Button>
      <div className="border rounded-md">
        <MonacoEditor
          value={code}
          height="60vh"
          defaultLanguage="javascript"
          defaultValue="// Začni psát svůj kód zde..."
          theme="light"
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
        />
        <div className="border-t" style={{ height: "30vh" }}>
          <table className="w-full">
            {output.map((out, i) => (
              <tr
                key={i}
                className={`border-b ${
                  out.type == "error" ? "bg-red-200" : ""
                }`}
              >
                <td className="text-sm text-gray-400 w-48">{out.time}</td>
                <td className="pl-2">{out.msg}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServerScript;