import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import {
  createDefaultLayout,
  isRack,
  type InventoryItem,
} from "../lib/warehouse";
import { Inventory } from "../models/Inventory";
import { Warehouse } from "../models/Warehouse";

// tsx does not read Next.js env files on its own.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // File is optional; fall back to the default local URI.
  }
}

const inventory: InventoryItem[] = [
  { sku: "AS-1001", name: "Pallet Jack Wheel Kit", quantity: 48, x: 2, z: 2 },
  { sku: "AS-1002", name: "Stretch Wrap 18in (4 Rolls)", quantity: 220, x: 3, z: 5 },
  { sku: "AS-1003", name: "Corrugated Box 24x18x12", quantity: 1500, x: 6, z: 3 },
  { sku: "AS-1004", name: "Thermal Shipping Labels 4x6", quantity: 640, x: 7, z: 8 },
  { sku: "AS-1005", name: "Barcode Scanner 2D Wireless", quantity: 36, x: 10, z: 12 },
  { sku: "AS-1006", name: "Safety Vest Hi-Vis Class 2", quantity: 175, x: 11, z: 15 },
  { sku: "AS-1007", name: "Steel Strapping Coil 1/2in", quantity: 60, x: 14, z: 4 },
  { sku: "AS-1008", name: "Plastic Tote 27x17x12", quantity: 310, x: 15, z: 17 },
  { sku: "AS-1009", name: "Dock Bumper Laminated 36in", quantity: 24, x: 2, z: 13 },
  { sku: "AS-1010", name: "Packing Tape 2in (36 Rolls)", quantity: 92, x: 10, z: 6 },
];

async function seed() {
  await connectToDatabase();

  const layoutMatrix = createDefaultLayout(20);
  const misplaced = inventory.filter(
    (item) => !isRack(layoutMatrix, item.x, item.z),
  );
  if (misplaced.length > 0) {
    throw new Error(
      `Seed inventory is not on a rack: ${misplaced.map((i) => i.sku).join(", ")}`,
    );
  }

  await Promise.all([Warehouse.deleteMany({}), Inventory.deleteMany({})]);

  const warehouse = await Warehouse.create({
    name: "Meridian Depot DC-01",
    layoutMatrix,
  });
  const items = await Inventory.insertMany(inventory);

  const rackCount = layoutMatrix.flat().filter((cell) => cell === 1).length;
  console.log(
    `Seeded "${warehouse.name}" (20x20, ${rackCount} racks) with ${items.length} inventory items.`,
  );
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
