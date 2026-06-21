import { readFileSync } from "fs";
import { join } from "path";

const SQL_PATH = join(process.cwd(), "docs/v3/walls.sql");

export function readWallsSql(): string {
  return readFileSync(SQL_PATH, "utf-8");
}

/** Parse INSERT INTO `table` (...) VALUES (...),(...); rows */
export function parseInsertRows(
  sql: string,
  tableName: string
): Record<string, string | number | null>[] {
  const regex = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\s*([\\s\\S]*?);`,
    "i"
  );
  const match = sql.match(regex);
  if (!match) return [];

  const columns = match[1].split(",").map((c) => c.trim().replace(/`/g, ""));
  const valuesBlock = match[2];

  const rowRegex = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
  const rows: Record<string, string | number | null>[] = [];
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
    const rawValues = splitSqlValues(rowMatch[1]);
    const row: Record<string, string | number | null> = {};
    columns.forEach((col, i) => {
      row[col] = parseSqlValue(rawValues[i] ?? "NULL");
    });
    rows.push(row);
  }

  return rows;
}

function splitSqlValues(valueStr: string): string[] {
  const values: string[] = [];
  let current = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < valueStr.length; i++) {
    const ch = valueStr[i];
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      current += ch;
      continue;
    }
    if (ch === "'") {
      inString = !inString;
      current += ch;
      continue;
    }
    if (ch === "," && !inString) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) values.push(current.trim());
  return values;
}

function parseSqlValue(raw: string): string | number | null {
  const v = raw.trim();
  if (v === "NULL") return null;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  }
  return v;
}
