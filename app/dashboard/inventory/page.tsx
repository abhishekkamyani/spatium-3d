"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Brand } from "@/components/brand/brand";
import { StockRow } from "@/components/inventory/stock-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWarehouseStore } from "@/lib/store";
import { isRack } from "@/lib/warehouse";

/** Loads inventory and renders SKU/name search, stock totals, and editable rows. */
export default function InventoryPage() {
  const status = useWarehouseStore((state) => state.status);
  const error = useWarehouseStore((state) => state.error);
  const inventory = useWarehouseStore((state) => state.inventory);
  const layoutMatrix = useWarehouseStore((state) => state.layoutMatrix);
  const load = useWarehouseStore((state) => state.load);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return inventory;
    return inventory.filter(
      (item) =>
        item.sku.toLowerCase().includes(needle) ||
        item.name.toLowerCase().includes(needle),
    );
  }, [inventory, query]);

  const units = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const loading = status === "idle" || status === "loading";

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#05070b] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-mesh absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Brand />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Stock list
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {inventory.length.toLocaleString()} SKUs ·{" "}
              {units.toLocaleString()} units on hand
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            <Link href="/dashboard">
              <ArrowLeft data-icon="inline-start" />
              Back to 3D twin
            </Link>
          </Button>
        </header>

        <Card className="mt-8 border border-white/10 bg-black/40 text-slate-200 ring-0 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">
              <h2>Inventory</h2>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Use the pencil to change a name, quantity or rack location. Enter
              saves, Escape cancels.
            </CardDescription>
            <div className="relative mt-3 max-w-sm">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <Input
                type="search"
                aria-label="Search by SKU or name"
                placeholder="Search by SKU or name"
                className="border-white/15 bg-black/40 pl-8"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="pl-5 text-slate-400">SKU</TableHead>
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-right text-slate-400">Qty</TableHead>
                  <TableHead className="text-right text-slate-400">X</TableHead>
                  <TableHead className="text-right text-slate-400">Z</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="pr-5 text-right text-slate-400">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <StockRow
                    key={item.sku}
                    item={item}
                    onRack={isRack(layoutMatrix ?? [], item.x, item.z)}
                  />
                ))}
                {filtered.length === 0 && (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="py-14 text-center whitespace-normal text-slate-400"
                    >
                      {loading ? (
                        <Loader2
                          className="mx-auto size-5 animate-spin text-cyan-400"
                          aria-label="Loading inventory"
                        />
                      ) : status === "error" ? (
                        <>
                          Couldn’t load inventory. {error}{" "}
                          <button
                            type="button"
                            className="text-cyan-300 underline-offset-4 hover:underline"
                            onClick={() => void load()}
                          >
                            Retry
                          </button>
                        </>
                      ) : inventory.length === 0 ? (
                        <>
                          No stock yet. Run <code>npm run seed</code> or{" "}
                          <Link
                            href="/dashboard/setup"
                            className="text-cyan-300 underline-offset-4 hover:underline"
                          >
                            import a CSV
                          </Link>
                          .
                        </>
                      ) : (
                        <>No SKUs match “{query}”.</>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
