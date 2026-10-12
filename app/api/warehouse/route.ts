import { connection } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { parseLayoutMatrix } from "@/lib/warehouse";
import { Warehouse } from "@/models/Warehouse";

export async function GET() {
  await connection();

  try {
    await connectToDatabase();
    const warehouse = await Warehouse.findOne().sort({ updatedAt: -1 }).lean();

    return Response.json({
      warehouse: warehouse
        ? { name: warehouse.name, layoutMatrix: warehouse.layoutMatrix }
        : null,
    });
  } catch (error) {
    console.error("GET /api/warehouse failed:", error);
    return Response.json(
      { error: "Could not reach the database." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = parseLayoutMatrix(
    (body as { layoutMatrix?: unknown } | null)?.layoutMatrix,
  );
  if ("error" in parsed) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const warehouse = await Warehouse.findOneAndUpdate(
      {},
      { $set: { layoutMatrix: parsed.matrix } },
      {
        sort: { updatedAt: -1 },
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    ).lean();

    return Response.json({
      warehouse: {
        name: warehouse.name,
        layoutMatrix: warehouse.layoutMatrix,
      },
    });
  } catch (error) {
    console.error("PUT /api/warehouse failed:", error);
    return Response.json(
      { error: "Could not save the layout." },
      { status: 503 },
    );
  }
}
