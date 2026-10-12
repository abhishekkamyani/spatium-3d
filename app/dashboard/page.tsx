"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ClipboardList, LayoutGrid, Loader2, RefreshCw } from "lucide-react";
import { Brand } from "@/components/brand/brand";
import { ItemFinder } from "@/components/dashboard/item-finder";
import { RackDrawer } from "@/components/dashboard/rack-drawer";
import { Button } from "@/components/ui/button";
import { useWarehouseStore } from "@/lib/store";
import { RACK, cellKey, isRack } from "@/lib/warehouse";

const WarehouseScene = dynamic(
  () => import("@/components/dashboard/warehouse-scene"),
  { ssr: false },
);

const GLASS = "border border-white/10 bg-black/40 backdrop-blur-xl";

/** Loads warehouse data and renders the 3D scene, inventory summary, and rack controls. */
export default function DashboardPage() {
  const status = useWarehouseStore((state) => state.status);
  const error = useWarehouseStore((state) => state.error);
  const warehouseName = useWarehouseStore((state) => state.warehouseName);
  const layoutMatrix = useWarehouseStore((state) => state.layoutMatrix);
  const inventory = useWarehouseStore((state) => state.inventory);
  const load = useWarehouseStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const matrix = layoutMatrix ?? [];
    const racks = matrix.flat().filter((cell) => cell === RACK).length;
    const slotted = inventory.filter((item) => isRack(matrix, item.x, item.z));
    const stocked = new Set(slotted.map((item) => cellKey(item.x, item.z))).size;
    const units = inventory.reduce((sum, item) => sum + item.quantity, 0);
    return [
      { label: "Racks", value: racks },
      { label: "Stocked", value: stocked },
      { label: "SKUs", value: inventory.length },
      { label: "Units", value: units },
    ];
  }, [layoutMatrix, inventory]);

  const isEmpty = status === "ready" && !layoutMatrix;

  return (
    <main className="relative flex-1 text-slate-200">
      <WarehouseScene />

      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4">
        <header
          className={`${GLASS} pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-5`}
        >
          <div className="flex items-center justify-between gap-3">
            <Brand />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Reload warehouse data"
              disabled={status === "loading"}
              onClick={() => void load()}
            >
              <RefreshCw className={status === "loading" ? "animate-spin" : ""} />
            </Button>
          </div>
          <h1 className="mt-4 text-lg font-medium text-white">
            {warehouseName ?? "Spatium 3D"}
          </h1>
          <dl className="mt-4 grid grid-cols-4 gap-2">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11px] tracking-wide text-slate-400 uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 font-mono text-base text-white tabular-nums">
                  {stat.value.toLocaleString()}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link href="/dashboard/inventory">
                <ClipboardList data-icon="inline-start" />
                Stock list
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link href="/dashboard/setup">
                <LayoutGrid data-icon="inline-start" />
                Setup
              </Link>
            </Button>
          </div>
        </header>

        <ItemFinder className="pointer-events-auto my-4 w-[min(22rem,calc(100vw-2rem))] flex-1" />

        <ul
          aria-label="Legend"
          className={`${GLASS} pointer-events-auto flex w-fit flex-wrap gap-x-5 gap-y-2 rounded-full px-5 py-2.5 text-xs text-slate-300`}
        >
          <LegendItem className="bg-cyan-400" label="Stocked rack" />
          <LegendItem className="bg-slate-700" label="Empty rack" />
          <LegendItem className="bg-fuchsia-400" label="Pick path" />
          <LegendItem className="bg-lime-400" label="Dock [0,0]" />
        </ul>
      </div>

      {(status === "loading" || status === "idle") && !layoutMatrix && (
        <StatusCard>
          <Loader2 className="size-5 animate-spin text-cyan-400" aria-hidden />
          Loading warehouse…
        </StatusCard>
      )}

      {status === "error" && (
        <StatusCard>
          <p className="font-medium text-white">Couldn’t load the warehouse</p>
          <p className="text-slate-400">
            {error} Check that MongoDB is running and <code>MONGODB_URI</code>{" "}
            is set, then retry.
          </p>
          <Button onClick={() => void load()}>Retry</Button>
        </StatusCard>
      )}

      {isEmpty && (
        <StatusCard>
          <p className="font-medium text-white">No warehouse yet</p>
          <p className="text-slate-400">
            Run <code>npm run seed</code> for sample data, or paint a layout in
            the builder.
          </p>
          <Button asChild>
            <Link href="/dashboard/setup">Open the layout builder</Link>
          </Button>
        </StatusCard>
      )}

      <RackDrawer />
    </main>
  );
}

/** Renders a labeled color swatch for the warehouse scene legend. */
function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`size-2.5 rounded-sm ${className}`} aria-hidden />
      {label}
    </li>
  );
}

/** Centers a status message over the warehouse scene with an accessible status role. */
function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 grid place-items-center p-4">
      <div
        role="status"
        className={`${GLASS} pointer-events-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl p-6 text-center text-sm`}
      >
        {children}
      </div>
    </div>
  );
}
