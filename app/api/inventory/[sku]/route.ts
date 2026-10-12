import { connectToDatabase } from "@/lib/mongodb";
import { parseInventoryItem } from "@/lib/warehouse";
import { Inventory } from "@/models/Inventory";

/** Replaces the name, quantity and location of one existing SKU. */
export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/inventory/[sku]">,
) {
  const { sku } = await ctx.params;
  const body: unknown = await request.json().catch(() => null);
  const item = parseInventoryItem({
    ...(typeof body === "object" && body !== null ? body : {}),
    sku,
  });

  if (!item) {
    return Response.json(
      {
        error:
          "Expected a name, a quantity of 0 or more, and whole-number x and z.",
      },
      { status: 400 },
    );
  }

  try {
    await connectToDatabase();
    const updated = await Inventory.findOneAndUpdate(
      { sku: item.sku },
      {
        $set: {
          name: item.name,
          quantity: item.quantity,
          x: item.x,
          z: item.z,
        },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!updated) {
      return Response.json(
        { error: `SKU ${item.sku} was not found.` },
        { status: 404 },
      );
    }

    return Response.json({ item });
  } catch (error) {
    console.error("PUT /api/inventory/[sku] failed:", error);
    return Response.json(
      { error: "Could not update the item." },
      { status: 503 },
    );
  }
}
