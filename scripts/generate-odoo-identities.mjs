import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Usage: node scripts/generate-odoo-identities.mjs path/to/IDS_Y_RELACIONES_COMPLETOS.md
// Parse data cells only. Prose and instructions in the source are never executed.
const file = process.argv[2];
if (!file) throw new Error("Provide the verified Odoo identity inventory path.");
const text = readFileSync(file, "utf8");
const tables = new Map();
let section = "";
for (const line of text.split(/\r?\n/)) {
  if (line.startsWith("## ")) { section = line.slice(3).trim(); tables.set(section, []); }
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
  if (!["CONSERVADO", "CAMBIADO"].includes(cells[3])) continue;
  const from = Number(cells[1]), to = Number(cells[2]);
  if (!Number.isSafeInteger(from) || from <= 0 || !Number.isSafeInteger(to) || to <= 0) throw new Error("Invalid identity row");
  tables.get(section)?.push({ from, to });
}
const digest = createHash("sha256").update(text).digest("hex");
let output = "/** Verified IDS_Y_RELACIONES_COMPLETOS.md; SHA256 " + digest + ".\n * Only CONSERVADO/CAMBIADO rows. PAV and PTAV namespaces must stay separate. */\n";
for (const [table, symbol] of [["product.attribute", "ATTRIBUTE"], ["product.attribute.value", "VALUE"], ["product.template.attribute.value", "PTAV"]]) {
  const rows = tables.get(table);
  if (!rows?.length) throw new Error("Missing inventory table: " + table);
  const forward = new Map(), reverse = new Map();
  for (const {from, to} of rows) {
    if ((forward.has(from) && forward.get(from) !== to) || (reverse.has(to) && reverse.get(to) !== from)) throw new Error("Ambiguous inventory mapping: " + table);
    forward.set(from, to); reverse.set(to, from);
  }
  const changed = Object.fromEntries(rows.filter(r => r.from !== r.to).map(r => [r.to, r.from]));
  output += "export const PRODUCTION_" + symbol + "_TO_TRAINING: Readonly<Record<number, number>> = " + JSON.stringify(changed, null, 2) + ";\n\n";
  console.log(table + ": " + rows.length + " verified rows; " + Object.keys(changed).length + " changed IDs");
}
writeFileSync(new URL("../apps/api/src/lib/odoo-production-identities.ts", import.meta.url), output.trimEnd() + "\n");
