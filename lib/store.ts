import { create } from "zustand";
import { findPickPath, type GridPoint } from "@/lib/pick-path";
import type { InventoryItem, LayoutMatrix } from "@/lib/warehouse";

type Status = "idle" | "loading" | "ready" | "error";

interface WarehouseState {
  status: Status;
  error: string | null;
  warehouseName: string | null;
  /** null once loaded means no warehouse has been saved yet. */
  layoutMatrix: LayoutMatrix | null;
  inventory: InventoryItem[];
  selected: GridPoint | null;
  path: [number, number][];
  load: () => Promise<void>;
  selectRack: (point: GridPoint | null) => void;
  /** Saves one item and patches it into the loaded inventory. */
  updateItem: (item: InventoryItem) => Promise<void>;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? `Request to ${url} failed.`);
  }
  return body as T;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  status: "idle",
  error: null,
  warehouseName: null,
  layoutMatrix: null,
  inventory: [],
  selected: null,
  path: [],

  load: async () => {
    set({ status: "loading", error: null });
    try {
      const [{ warehouse }, { items }] = await Promise.all([
        getJson<{
          warehouse: { name: string; layoutMatrix: LayoutMatrix } | null;
        }>("/api/warehouse"),
        getJson<{ items: InventoryItem[] }>("/api/inventory"),
      ]);
      set({
        status: "ready",
        warehouseName: warehouse?.name ?? null,
        layoutMatrix: warehouse?.layoutMatrix ?? null,
        inventory: items,
        selected: null,
        path: [],
      });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load.",
      });
    }
  },

  // Selecting a rack routes to it from the dock right away.
  selectRack: (point) =>
    set(({ layoutMatrix }) => ({
      selected: point,
      path: point && layoutMatrix ? findPickPath(layoutMatrix, point) : [],
    })),

  updateItem: async (item) => {
    const response = await fetch(
      `/api/inventory/${encodeURIComponent(item.sku)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error ?? "Update failed.");

    const saved = body.item as InventoryItem;
    set({
      inventory: get().inventory.map((existing) =>
        existing.sku === saved.sku ? saved : existing,
      ),
    });
  },
}));
