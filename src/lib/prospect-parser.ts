import Papa from "papaparse";
import { read, utils } from "xlsx";
import { requiredProspectColumns } from "@/lib/env.server";

type ParsedRow = Record<string, string> & { row_index: number };

export type ProspectParseResult = {
  rowCount: number;
  invalidRowCount: number;
  missingColumns: string[];
  preview: ParsedRow[];
  rows: ParsedRow[];
};

function normalizeRows(rows: Record<string, unknown>[]): ParsedRow[] {
  return rows.map((row, index) => {
    const normalized: ParsedRow = { row_index: index + 1 } as ParsedRow;
    Object.entries(row).forEach(([key, value]) => {
      if (!key) return;
      normalized[key.trim().toLowerCase()] = String(value ?? "").trim();
    });
    return normalized;
  });
}

function ensureColumns(columns: string[]): string[] {
  const lower = columns.map((column) => column.trim().toLowerCase());
  return requiredProspectColumns.filter((required) => !lower.includes(required));
}

export function parseProspectBuffer(buffer: Buffer, filename: string): ProspectParseResult {
  const extension = filename.split(".").pop()?.toLowerCase();
  let rows: ParsedRow[] = [];

  if (extension === "csv" || extension === "txt") {
    const { data, errors, meta } = Papa.parse<Record<string, unknown>>(buffer.toString("utf-8"), {
      header: true,
      skipEmptyLines: true,
      transformHeader(header: string) {
        return header.trim().toLowerCase();
      },
    });

    if (errors.length) {
      throw new Error(`CSV parsing failed: ${errors[0]?.message ?? "unknown error"}`);
    }

    const missingColumns = ensureColumns(meta.fields?.map((field: string) => field ?? "") ?? []);
    if (missingColumns.length) {
      throw new Error(
        `CSV file missing required columns: ${missingColumns.join(", ")}. Expected: ${requiredProspectColumns.join(", ")}`,
      );
    }

    rows = normalizeRows(data);
  } else if (extension === "xlsx" || extension === "xlsm" || extension === "xls") {
    const workbook = read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("Excel file does not contain any sheets");
    }
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    if (!jsonRows.length) {
      throw new Error("Excel sheet is empty");
    }
    rows = normalizeRows(jsonRows);
    const missingColumns = ensureColumns(Object.keys(rows[0] ?? {}));
    if (missingColumns.length) {
      throw new Error(
        `Excel file missing required columns: ${missingColumns.join(", ")}. Expected: ${requiredProspectColumns.join(", ")}`,
      );
    }
  } else {
    throw new Error("Only CSV or Excel files are supported for prospect uploads");
  }

  const validRows = rows.filter((row) =>
    requiredProspectColumns.every((column) => (row[column] ?? "").length > 0),
  );
  const invalidRowCount = rows.length - validRows.length;

  return {
    rowCount: validRows.length,
    invalidRowCount,
    missingColumns: [],
    preview: validRows.slice(0, 5),
    rows: validRows,
  };
}
