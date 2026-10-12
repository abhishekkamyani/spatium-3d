import { Schema, model, models, type Model } from "mongoose";

export interface WarehouseAttrs {
  name: string;
  /** Row-major grid indexed as layoutMatrix[z][x]. 0 = floor, 1 = rack. */
  layoutMatrix: number[][];
}

const WarehouseSchema = new Schema<WarehouseAttrs>(
  {
    name: { type: String, default: "Main Warehouse", trim: true },
    layoutMatrix: { type: [[Number]], required: true },
  },
  { timestamps: true },
);

export const Warehouse: Model<WarehouseAttrs> =
  (models.Warehouse as Model<WarehouseAttrs> | undefined) ??
  model<WarehouseAttrs>("Warehouse", WarehouseSchema);
