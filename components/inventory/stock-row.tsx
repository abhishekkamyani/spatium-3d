"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { useWarehouseStore } from "@/lib/store";
import { parseInventoryItem, type InventoryItem } from "@/lib/warehouse";

const FIELD = "h-8 border-white/15 bg-black/40";

type Draft = { name: string; quantity: string; x: string; z: string };

const toDraft = (item: InventoryItem): Draft => ({
  name: item.name,
  quantity: String(item.quantity),
  x: String(item.x),
  z: String(item.z),
});

export function StockRow({
  item,
  onRack,
}: {
  item: InventoryItem;
  onRack: boolean;
}) {
  const updateItem = useWarehouseStore((state) => state.updateItem);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = (field: keyof Draft, value: string) =>
    setDraft((current) => (current ? { ...current, [field]: value } : current));

  const save = async () => {
    if (!draft) return;
    const next = parseInventoryItem({ sku: item.sku, ...draft });
    if (!next) {
      toast.error(
        "Enter a name, a quantity of 0 or more, and whole-number X and Z.",
      );
      return;
    }

    setSaving(true);
    try {
      await updateItem(next);
      toast.success(`${item.sku} updated.`);
      setDraft(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <TableRow className="border-white/5">
        <TableCell className="pl-5 font-mono text-xs text-cyan-300">
          {item.sku}
        </TableCell>
        <TableCell className="whitespace-normal">{item.name}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {item.quantity.toLocaleString()}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {item.x}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums">
          {item.z}
        </TableCell>
        <TableCell>
          {item.quantity === 0 ? (
            <Badge
              variant="outline"
              className="border-amber-400/40 bg-amber-400/10 text-amber-300"
            >
              Out of stock
            </Badge>
          ) : onRack ? (
            <Badge
              variant="outline"
              className="border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
            >
              On rack
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-rose-400/40 bg-rose-400/10 text-rose-300"
            >
              No rack here
            </Badge>
          )}
        </TableCell>
        <TableCell className="pr-5 text-right">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${item.sku}`}
            onClick={() => setDraft(toDraft(item))}
          >
            <Pencil />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className="border-white/5 bg-white/5 hover:bg-white/5"
      onKeyDown={(event) => {
        if (event.key === "Enter") void save();
        if (event.key === "Escape") setDraft(null);
      }}
    >
      <TableCell className="pl-5 font-mono text-xs text-cyan-300">
        {item.sku}
      </TableCell>
      <TableCell>
        <Input
          autoFocus
          aria-label={`Name for ${item.sku}`}
          className={FIELD}
          value={draft.name}
          onChange={(event) => setField("name", event.target.value)}
        />
      </TableCell>
      {(["quantity", "x", "z"] as const).map((field) => (
        <TableCell key={field}>
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            aria-label={`${field === "quantity" ? "Quantity" : field.toUpperCase()} for ${item.sku}`}
            className={`${FIELD} ml-auto block w-20 text-right font-mono`}
            value={draft[field]}
            onChange={(event) => setField(field, event.target.value)}
          />
        </TableCell>
      ))}
      <TableCell />
      <TableCell className="pr-5 text-right whitespace-nowrap">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Save ${item.sku}`}
          disabled={saving}
          onClick={() => void save()}
          className="text-emerald-300"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Check />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Cancel editing"
          disabled={saving}
          onClick={() => setDraft(null)}
        >
          <X />
        </Button>
      </TableCell>
    </TableRow>
  );
}
