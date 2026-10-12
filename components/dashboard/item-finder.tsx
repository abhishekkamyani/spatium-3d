"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWarehouseStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 50;

export function ItemFinder({ className }: { className?: string }) {
  const inventory = useWarehouseStore((state) => state.inventory);
  const selected = useWarehouseStore((state) => state.selected);
  const selectRack = useWarehouseStore((state) => state.selectRack);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();

  const matches = useMemo(() => {
    const filtered = term
      ? inventory.filter(
          (item) =>
            item.sku.toLowerCase().includes(term) ||
            item.name.toLowerCase().includes(term),
        )
      : inventory;
    return filtered.slice(0, MAX_RESULTS);
  }, [inventory, term]);

  return (
    <section
      aria-label="Find an item"
      className={cn(
        "flex min-h-0 flex-col rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl",
        className,
      )}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <Input
          type="search"
          aria-label="Search by SKU or name"
          placeholder="Find SKU or item name…"
          className="border-white/15 bg-black/40 pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {inventory.length > 0 && (
        <ScrollArea className="mt-3 min-h-0 flex-1">
          {matches.length > 0 ? (
            <ul>
              {matches.map((item) => {
                const active = selected?.x === item.x && selected?.z === item.z;
                return (
                  <li key={item.sku}>
                    <button
                      type="button"
                      onClick={() => selectRack({ x: item.x, z: item.z })}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5",
                        active && "bg-cyan-400/10",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-100">
                          {item.name}
                        </span>
                        <span className="font-mono text-xs text-cyan-300">
                          {item.sku}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-slate-400">
                        <MapPin className="size-3" aria-hidden />X{item.x} Z
                        {item.z}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-2 py-4 text-sm text-slate-400">
              No items match “{query.trim()}”.
            </p>
          )}
        </ScrollArea>
      )}
    </section>
  );
}
