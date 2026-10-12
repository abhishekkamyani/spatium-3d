import { Schema, model, models, type Model } from "mongoose";

export interface InventoryAttrs {
  sku: string;
  name: string;
  quantity: number;
  /** Column in the warehouse layoutMatrix. */
  x: number;
  /** Row in the warehouse layoutMatrix. */
  z: number;
}

const InventorySchema = new Schema<InventoryAttrs>(
  {
    sku: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    x: { type: Number, required: true, min: 0 },
    z: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

InventorySchema.index({ x: 1, z: 1 });

export const Inventory: Model<InventoryAttrs> =
  (models.Inventory as Model<InventoryAttrs> | undefined) ??
  model<InventoryAttrs>("Inventory", InventorySchema);
