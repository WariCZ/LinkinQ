import axios from "axios";
import React, { useState, useCallback, forwardRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { debug } from "winston";

interface UploadedFile {
  id: string;
  file: File;
  guid?: string;
}

const FileUpload = forwardRef(
  (props: {
    onChange?: (guids: string[]) => void;
    name?: string;
    value: any;
    disabled?: boolean;
  }) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
      if (props.value)
        setFiles(
          props.value.map((v) => ({
            id: v.guid,
            guid: v.guid,
            file: { name: v.caption },
          }))
        );
    }, [props.value]);

    const uploadFileToServer = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("/api/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Nastavení správného typu obsahu
          },
        });

        return response?.data?.guid; // Úspěšné nahrání
      } catch (error) {
        console.error("Upload failed:", error);
        return false; // Selhání
      }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending",
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      // Nahrajeme soubory na server
      newFiles.forEach(async (fileEntry) => {
        const guid = await uploadFileToServer(fileEntry.file);

        setFiles((prevFiles) => {
          const files = prevFiles.map((f) =>
            f.id === fileEntry.id
              ? { ...f, status: guid ? "uploaded" : "error", guid }
              : f
          );
          if (props.onChange) {
            props.onChange(files.filter((f) => f.guid).map((f) => f.guid));
          }
          return files;
        });
      });
    }, []);

    const removeFile = (id: string) => {
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== id));
    };

    const handleFileClick = (file: File) => {
      alert(
        `Detail souboru:\n\nNázev: ${file.name}\nVelikost: ${file.size} bajtů`
      );
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: true,
    });

    return (
      <div className=" mx-auto">
        <div
          {...getRootProps()}
          className={`h-8 relative border rounded-lg p-1 cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 bg-white"
          }`}
        >
          <input {...getInputProps()} disabled={props.disabled} />
          <div className="flex flex-wrap items-center gap-2" style={{}}>
            {files.length === 0 && (
              <p className="text-gray-500 text-sm">
                Přetáhněte soubory sem nebo klikněte pro výběr
              </p>
            )}
            {files.map(({ id, file }) => (
              <div
                key={id}
                className="justify-center top-2 flex items-center gap-2 bg-gray-100 rounded-md px-3 py-0.5 text-xs"
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handleFileClick(file)}
                >
                  {file.name}
                </span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeFile(id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default FileUpload;
