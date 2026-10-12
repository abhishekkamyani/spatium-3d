import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  MAX_IMPORT_ROWS,
  parseInventoryItem,
  type InventoryItem,
} from "@/lib/warehouse";
import { Inventory } from "@/models/Inventory";

/** Returns inventory sorted by SKU, or a 503 response if the database query fails. */
export async function GET() {
  await connection();

  try {
    await connectToDatabase();
    const docs = await Inventory.find().sort({ sku: 1 }).lean();
    const items: InventoryItem[] = docs.map(({ sku, name, quantity, x, z }) => ({
      sku,
      name,
      quantity,
      x,
      z,
    }));

    return Response.json({ items });
  } catch (error) {
    console.error("GET /api/inventory failed:", error);
    return Response.json(
      { error: "Could not reach the database." },
      { status: 503 },
    );
  }
}

/** Bulk import. Rows are keyed on SKU, so re-importing a file updates in place. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const rows = (body as { items?: unknown } | null)?.items;

  if (!Array.isArray(rows) || rows.length === 0) {
    return Response.json(
      { error: "Request body must include a non-empty items array." },
      { status: 400 },
    );
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return Response.json(
      { error: `Imports are limited to ${MAX_IMPORT_ROWS} rows.` },
      { status: 413 },
    );
  }

  // Last occurrence of a SKU wins within a single file.
  const bySku = new Map<string, InventoryItem>();
  let rejected = 0;
  for (const row of rows) {
    const item = parseInventoryItem(row);
    if (item) bySku.set(item.sku, item);
    else rejected += 1;
  }

  if (bySku.size === 0) {
    return Response.json(
      { error: "No valid rows found. Expected sku, name, quantity, x, z." },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();
    const result = await Inventory.bulkWrite(
      [...bySku.values()].map((item) => ({
        updateOne: {
          filter: { sku: item.sku },
          update: { $set: item },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return Response.json({
      inserted: result.upsertedCount,
      updated: result.matchedCount,
      rejected,
    });
  } catch (error) {
    console.error("POST /api/inventory failed:", error);
    return Response.json(
      { error: "Could not import inventory." },
      { status: 503 },
    );
  }
}
