export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let quoteClosed = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
        quoteClosed = true;
      } else {
        cell += char;
      }
      continue;
    }

    if (quoteClosed && char !== "," && char !== "\n" && char !== "\r" && char !== " " && char !== "\t") {
      throw new Error("Unexpected text after a quoted field.");
    }
    if (char === '"' && cell.length === 0 && !quoteClosed) {
      quoted = true;
    } else if (char === ",") {
      row.push(cell.trim());
      cell = "";
      quoteClosed = false;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      quoteClosed = false;
    } else if (!quoteClosed) {
      cell += char;
    }
  }

  if (quoted) throw new Error("A quoted field was not closed.");
  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("Add a header row and at least one record.");

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  if (headers.some((header) => !header)) throw new Error("Every column needs a header.");
  if (new Set(headers).size !== headers.length) throw new Error("Column headers must be unique.");

  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) throw new Error(`Row ${index + 2} has a different number of columns.`);
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
}
