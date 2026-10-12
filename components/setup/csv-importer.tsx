"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { FileSpreadsheet, Loader2, Upload, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MAX_IMPORT_ROWS,
  isRack,
  parseInventoryItem,
  type InventoryItem,
  type LayoutMatrix,
} from "@/lib/warehouse";

const GLASS_CARD =
  "border border-white/10 bg-black/40 text-slate-200 ring-0 backdrop-blur-xl";

type Parsed = { fileName: string; items: InventoryItem[]; skipped: number };

/**
 * Parses and previews CSV inventory, flags locations outside racks in the supplied grid,
 * and submits valid rows for import by SKU.
 */
export function CsvImporter({ grid }: { grid: LayoutMatrix }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [importing, setImporting] = useState(false);

  const offRack = parsed
    ? parsed.items.filter((item) => !isRack(grid, item.x, item.z)).length
    : 0;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please choose a .csv file.");
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: ({ data }) => {
        const items: InventoryItem[] = [];
        for (const row of data) {
          const item = parseInventoryItem({
            ...row,
            quantity: row.qty ?? row.quantity,
          });
          if (item) items.push(item);
        }

        if (items.length === 0) {
          toast.error("No valid rows found. Expected columns: SKU, Name, Qty, X, Z.");
          return;
        }
        if (items.length > MAX_IMPORT_ROWS) {
          toast.error(`Imports are limited to ${MAX_IMPORT_ROWS} rows per file.`);
          return;
        }
        setParsed({
          fileName: file.name,
          items,
          skipped: data.length - items.length,
        });
      },
      error: (error) => toast.error(`Could not read the CSV: ${error.message}`),
    });
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsed.items }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Import failed.");

      toast.success(
        `Imported ${parsed.fileName}: ${body.inserted} new, ${body.updated} updated.`,
      );
      setParsed(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className={GLASS_CARD}>
      <CardHeader>
        <CardTitle className="text-white">
          <h2>Inventory import</h2>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Upload a CSV with the columns{" "}
          <code className="font-mono text-slate-300">SKU, Name, Qty, X, Z</code>.
          Existing SKUs are updated in place.{" "}
          <a
            href="/sample-inventory.csv"
            download
            className="text-cyan-300 underline-offset-4 hover:underline"
          >
            Download a sample file
          </a>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFile(event.dataTransfer.files[0]);
          }}
          className={`flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-white/15 bg-black/30"
          }`}
        >
          <UploadCloud className="size-8 text-cyan-400" aria-hidden />
          <p className="text-sm text-slate-300">
            Drag and drop your CSV here, or
          </p>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
          <Input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            aria-label="Inventory CSV file"
            className="hidden"
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              // Allow re-selecting the same file after an edit.
              event.target.value = "";
            }}
          />
        </div>

        {parsed && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <FileSpreadsheet className="size-4 text-emerald-400" aria-hidden />
              <span className="font-medium text-white">{parsed.fileName}</span>
              <Badge
                variant="outline"
                className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
              >
                {parsed.items.length} valid
              </Badge>
              {parsed.skipped > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-400/40 bg-amber-400/10 text-amber-300"
                >
                  {parsed.skipped} skipped
                </Badge>
              )}
              {offRack > 0 && (
                <Badge
                  variant="outline"
                  className="border-rose-400/40 bg-rose-400/10 text-rose-300"
                >
                  {offRack} not on a rack
                </Badge>
              )}
            </div>

            <ScrollArea className="h-64 rounded-xl border border-white/10 bg-black/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">SKU</TableHead>
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-right text-slate-400">Qty</TableHead>
                    <TableHead className="text-right text-slate-400">X</TableHead>
                    <TableHead className="text-right text-slate-400">Z</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.items.map((item, index) => {
                    const onRack = isRack(grid, item.x, item.z);
                    return (
                      <TableRow
                        key={`${item.sku}-${index}`}
                        className="border-white/5"
                      >
                        <TableCell className="font-mono text-xs text-cyan-300">
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {item.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono tabular-nums ${onRack ? "" : "text-rose-300"}`}
                        >
                          {item.x}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono tabular-nums ${onRack ? "" : "text-rose-300"}`}
                        >
                          {item.z}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

            {offRack > 0 && (
              <p className="text-xs leading-5 text-slate-400">
                Rows in red point at floor cells in the current layout. They
                will be saved, but only appear in 3D once a rack exists there.
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-white/10 bg-transparent">
        <Button
          className="ml-auto bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          disabled={!parsed || importing}
          onClick={handleImport}
        >
          {importing ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Upload data-icon="inline-start" />
          )}
          {parsed ? `Import ${parsed.items.length} records` : "Import records"}
        </Button>
      </CardFooter>
    </Card>
  );
}
