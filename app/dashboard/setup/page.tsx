"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand/brand";
import { CsvImporter } from "@/components/setup/csv-importer";
import { LayoutBuilder } from "@/components/setup/layout-builder";
import { Button } from "@/components/ui/button";
import { createEmptyLayout, type LayoutMatrix } from "@/lib/warehouse";

/** Loads the saved layout and coordinates grid editing, layout saving, and CSV import. */
export default function SetupPage() {
  const [grid, setGrid] = useState<LayoutMatrix>(() => createEmptyLayout());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/warehouse")
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error ?? "Failed to load.");
        return body as { warehouse: { layoutMatrix: LayoutMatrix } | null };
      })
      .then(({ warehouse }) => {
        if (!cancelled && warehouse) setGrid(warehouse.layoutMatrix);
      })
      .catch((error: Error) => {
        if (!cancelled) toast.error(`Couldn’t load the saved layout. ${error.message}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/warehouse", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutMatrix: grid }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Save failed.");
      toast.success("Layout saved. Open the 3D twin to see it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#05070b] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-mesh absolute inset-0" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Brand />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Warehouse setup
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Shape the floor on the left, load stock on the right.
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

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <LayoutBuilder
            grid={grid}
            onChange={setGrid}
            onSave={handleSave}
            saving={saving}
            loading={loading}
          />
          <CsvImporter grid={grid} />
        </div>
      </div>
    </main>
  );
}
