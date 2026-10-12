export type LayoutMatrix = number[][];

export interface InventoryItem {
  sku: string;
  name: string;
  quantity: number;
  x: number;
  z: number;
}

export const FLOOR = 0;
export const RACK = 1;
export const DEFAULT_GRID_SIZE = 20;
export const MAX_GRID_SIZE = 60;
export const MAX_IMPORT_ROWS = 5000;

export function createEmptyLayout(size = DEFAULT_GRID_SIZE): LayoutMatrix {
  return Array.from({ length: size }, () => Array<number>(size).fill(FLOOR));
}

/**
 * Back-to-back rack rows split by a cross aisle. Every rack touches an aisle,
 * and the dock at [0,0] plus a staging strip on the far side stay clear.
 */
export function createDefaultLayout(size = DEFAULT_GRID_SIZE): LayoutMatrix {
  return Array.from({ length: size }, (_, z) =>
    Array.from({ length: size }, (_, x) => {
      const inRackColumn = x % 4 >= 2 && x < size - 4;
      const inRackRow = (z >= 2 && z <= 8) || (z >= 11 && z <= size - 3);
      return inRackColumn && inRackRow ? RACK : FLOOR;
    }),
  );
}

export function isRack(matrix: LayoutMatrix, x: number, z: number): boolean {
  return matrix[z]?.[x] === RACK;
}

export function cellKey(x: number, z: number): string {
  return `${x}:${z}`;
}

/** Returns a clean matrix, or an error message describing why it is invalid. */
export function parseLayoutMatrix(
  value: unknown,
): { matrix: LayoutMatrix } | { error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: "layoutMatrix must be a non-empty 2D array." };
  }
  if (value.length > MAX_GRID_SIZE) {
    return { error: `layoutMatrix cannot exceed ${MAX_GRID_SIZE} rows.` };
  }

  const width = Array.isArray(value[0]) ? value[0].length : 0;
  if (width === 0 || width > MAX_GRID_SIZE) {
    return {
      error: `Each row must contain between 1 and ${MAX_GRID_SIZE} cells.`,
    };
  }

  const matrix: LayoutMatrix = [];
  for (const row of value) {
    if (!Array.isArray(row) || row.length !== width) {
      return { error: "Every row in layoutMatrix must have the same length." };
    }
    if (!row.every((cell) => cell === FLOOR || cell === RACK)) {
      return { error: "layoutMatrix cells must be 0 (floor) or 1 (rack)." };
    }
    matrix.push([...row]);
  }

  return { matrix };
}

/** Coerces one loosely-typed record (API body or CSV row) into an item. */
export function parseInventoryItem(value: unknown): InventoryItem | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  const sku = String(record.sku ?? "").trim();
  const name = String(record.name ?? "").trim();
  const quantity = toNumber(record.quantity);
  const x = toNumber(record.x);
  const z = toNumber(record.z);

  if (!sku || !name || sku.length > 64 || name.length > 200) return null;
  if (!Number.isFinite(quantity) || quantity < 0) return null;
  if (!isGridCoordinate(x) || !isGridCoordinate(z)) return null;

  return { sku, name, quantity, x, z };
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

function isGridCoordinate(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < MAX_GRID_SIZE;
}
