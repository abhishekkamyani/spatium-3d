"use client";

import { useEffect, useRef } from "react";
import { Eraser, Loader2, Save, Wand2 } from "lucide-react";
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
import { DOCK } from "@/lib/pick-path";
import {
  FLOOR,
  RACK,
  createDefaultLayout,
  createEmptyLayout,
  type LayoutMatrix,
} from "@/lib/warehouse";

const GLASS_CARD =
  "border border-white/10 bg-black/40 text-slate-200 ring-0 backdrop-blur-xl";

export function LayoutBuilder({
  grid,
  onChange,
  onSave,
  saving,
  loading,
}: {
  grid: LayoutMatrix;
  onChange: (grid: LayoutMatrix) => void;
  onSave: () => void;
  saving: boolean;
  loading: boolean;
}) {
  // Value being painted while the pointer is held down, or null when idle.
  const brush = useRef<number | null>(null);

  useEffect(() => {
    const stop = () => {
      brush.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const rows = grid.length;
  const cols = grid[0].length;
  const rackCount = grid.flat().filter((cell) => cell === RACK).length;

  const paint = (x: number, z: number, value: number) => {
    if (grid[z][x] === value) return;
    onChange(
      grid.map((row, rz) =>
        rz === z ? row.map((cell, cx) => (cx === x ? value : cell)) : row,
      ),
    );
  };

  return (
    <Card className={GLASS_CARD}>
      <CardHeader>
        <CardTitle className="text-white">
          <h2>Layout builder</h2>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Click a cell to toggle it between floor and rack, or drag to paint.
          The dock at [0,0] always stays clear.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="outline" className="border-white/10 text-slate-300">
            {cols} × {rows}
          </Badge>
          <Badge
            variant="outline"
            className="border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
          >
            {rackCount} racks
          </Badge>
          {loading && (
            <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
          )}
        </div>

        <div
          role="group"
          aria-label="Warehouse layout grid"
          className="grid touch-none gap-[3px] rounded-xl border border-white/10 bg-black/30 p-2 select-none"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, z) =>
            row.map((cell, x) => {
              const isDock = x === DOCK.x && z === DOCK.z;
              const next = cell === RACK ? FLOOR : RACK;
              return (
                <button
                  key={`${x}:${z}`}
                  type="button"
                  disabled={isDock}
                  aria-pressed={cell === RACK}
                  aria-label={
                    isDock
                      ? "Dock, column 0, row 0"
                      : `${cell === RACK ? "Rack" : "Floor"}, column ${x}, row ${z}`
                  }
                  onPointerDown={(event) => {
                    // Let touch drags reach neighbouring cells.
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    brush.current = next;
                    paint(x, z, next);
                  }}
                  onPointerEnter={() => {
                    if (brush.current !== null) paint(x, z, brush.current);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      paint(x, z, next);
                    }
                  }}
                  className={`aspect-square rounded-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                    isDock
                      ? "bg-lime-400"
                      : cell === RACK
                        ? "bg-cyan-400 shadow-[0_0_8px_rgb(34_211_238/0.6)]"
                        : "bg-white/5 hover:bg-white/15"
                  }`}
                />
              );
            }),
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 border-white/10 bg-transparent">
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onChange(createEmptyLayout(rows))}
        >
          <Eraser data-icon="inline-start" />
          Clear
        </Button>
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onChange(createDefaultLayout())}
        >
          <Wand2 data-icon="inline-start" />
          Sample layout
        </Button>
        <Button
          className="ml-auto bg-cyan-400 text-slate-950 hover:bg-cyan-300"
          disabled={saving || loading}
          onClick={onSave}
        >
          {saving ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Save layout
        </Button>
      </CardFooter>
    </Card>
  );
}
