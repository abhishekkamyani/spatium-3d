"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, PackageOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWarehouseStore } from "@/lib/store";
import type { InventoryItem } from "@/lib/warehouse";

/** Displays one SKU with controls to add or remove a validated quantity of stock. */
function StockItem({ item }: { item: InventoryItem }) {
  const updateItem = useWarehouseStore((state) => state.updateItem);
  const [amount, setAmount] = useState("1");
  const [busy, setBusy] = useState(false);

  const adjust = async (direction: 1 | -1) => {
    const change = Number(amount);
    if (!Number.isInteger(change) || change < 1) {
      toast.error("Enter a whole number of 1 or more.");
      return;
    }
    if (direction === -1 && change > item.quantity) {
      toast.error(`Only ${item.quantity} on hand, can’t remove ${change}.`);
      return;
    }

    setBusy(true);
    try {
      await updateItem({
        ...item,
        quantity: item.quantity + direction * change,
      });
      toast.success(
        `${direction === 1 ? "Added" : "Removed"} ${change} · ${item.sku}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="border-b border-white/5 px-5 py-4 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-100">{item.name}</p>
          <p className="font-mono text-xs text-cyan-300">{item.sku}</p>
        </div>
        <p className="font-mono text-xl text-white tabular-nums">
          {item.quantity.toLocaleString()}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={`Remove from ${item.sku}`}
          disabled={busy}
          className="border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => void adjust(-1)}
        >
          <Minus />
        </Button>
        <Input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          aria-label={`Amount for ${item.sku}`}
          className="h-8 w-20 border-white/15 bg-black/40 text-center font-mono"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Button
          variant="outline"
          size="icon"
          aria-label={`Add to ${item.sku}`}
          disabled={busy}
          className="border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => void adjust(1)}
        >
          <Plus />
        </Button>
      </div>
    </li>
  );
}

/** Shows inventory, stock controls, and pick route details for the selected rack. */
export function RackDrawer() {
  const selected = useWarehouseStore((state) => state.selected);
  const inventory = useWarehouseStore((state) => state.inventory);
  const path = useWarehouseStore((state) => state.path);
  const selectRack = useWarehouseStore((state) => state.selectRack);

  const items = selected
    ? inventory.filter((item) => item.x === selected.x && item.z === selected.z)
    : [];
  const units = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {selected && (
        <motion.aside
          key="rack-drawer"
          aria-label="Rack details"
          initial={{ x: "110%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="pointer-events-auto fixed inset-y-4 right-4 z-10 flex w-[min(24rem,calc(100vw-2rem))] flex-col rounded-2xl border border-white/10 bg-black/40 text-slate-200 shadow-2xl backdrop-blur-xl"
        >
          <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Rack
              </p>
              <h2 className="mt-1 font-mono text-2xl font-semibold text-white">
                X{selected.x} · Z{selected.z}
              </h2>
              <div className="mt-3 flex gap-2">
                <Badge
                  variant="outline"
                  className={
                    units > 0
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 text-slate-400"
                  }
                >
                  {units > 0 ? "Stocked" : "Empty"}
                </Badge>
                {items.length > 0 && (
                  <Badge variant="outline" className="border-white/10 text-slate-300">
                    {units.toLocaleString()} units
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close rack details"
              onClick={() => selectRack(null)}
            >
              <X />
            </Button>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            {items.length > 0 ? (
              <ul>
                {items.map((item) => (
                  <StockItem key={item.sku} item={item} />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-sm text-slate-400">
                <PackageOpen className="size-8 text-slate-600" aria-hidden />
                No inventory is slotted in this rack.
              </div>
            )}
          </ScrollArea>

          <footer className="border-t border-white/10 p-5 text-sm">
            {path.length > 1 ? (
              <p className="text-slate-300">
                Route from dock:{" "}
                <span className="font-mono text-fuchsia-300">
                  {path.length - 1} steps
                </span>
              </p>
            ) : (
              <p className="text-slate-400">
                No walkable route from the dock to this rack.
              </p>
            )}
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
