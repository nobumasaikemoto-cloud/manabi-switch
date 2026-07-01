const SHEET_ID = "19sE7LgMVTShMnhoPB0OoovaMQOYvX8108Q_zqis638k";
const GID = "1742676764";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Robust CSV parser: handles quoted fields with embedded commas and newlines
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\r") {
        // skip CR
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
    i++;
  }

  // Last row (no trailing newline)
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function parseTags(raw: string): string[] {
  // Tags may be separated by spaces, commas, or newlines
  return raw
    .split(/[\s,、\n]+/)
    .map((t) => t.trim())
    .filter((t) => t.startsWith("#"));
}

function parseActions(raw: string): string[] {
  return raw
    .split(/\n|^[・•\-]\s*/m)
    .map((s) => s.replace(/^[・•\-]\s*/, "").trim())
    .filter(Boolean);
}

function parseDate(raw: string): string {
  // "2026/06/29 8:46:39" → "2026-06-29"
  const match = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (!match) return raw;
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });

    if (!res.ok) {
      return Response.json(
        { error: `Google Sheets responded with HTTP ${res.status}. シートを「リンクを知っている全員が閲覧可能」に設定してください。` },
        { status: 502 }
      );
    }

    const text = await res.text();

    // Check if we got an HTML login page instead of CSV
    if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
      return Response.json(
        { error: "スプレッドシートが非公開です。「リンクを知っている全員が閲覧可能」に共有設定を変更してください。" },
        { status: 403 }
      );
    }

    const rows = parseCSV(text);
    // row[0] = header, skip it
    const dataRows = rows.slice(1).filter((r) => r[1]?.trim());

    // Columns: 0=タイムスタンプ, 1=タイトル, 2=ソース, 3=学び・内容, 4=タグ, 5=アクション, 6=URL
    const entries = dataRows.map((row, i) => ({
      id: i + 1,
      date: parseDate(row[0] ?? ""),
      title: row[1]?.trim() ?? "",
      source: row[2]?.trim() ?? "",
      category: row[2]?.trim() ?? "", // sourceをcategoryとして流用
      body: row[3]?.trim() ?? "",
      tags: parseTags(row[4] ?? ""),
      actions: parseActions(row[5] ?? ""),
      url: row[6]?.trim() ?? "",
      chat: [] as { role: "user" | "ai"; content: string }[],
    }));

    return Response.json(entries);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
