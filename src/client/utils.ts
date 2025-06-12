import { FieldType } from "../lib/entity/types";

export const exportFile = ({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}) => {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url); // Uvolnění paměti
};

export const exportJsonFile = ({
  json,
  filename,
}: {
  json: any;
  filename: string;
}) => {
  const jsonString = JSON.stringify(json, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  exportFile({ blob, filename: filename + ".json" });
};

export const getFieldName = (field: FieldType): string =>
  field.name ?? field.type;
