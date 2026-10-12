import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Stock List | ${siteConfig.name}` },
  description: "Search every SKU in the warehouse and update stock levels.",
};

/** Passes through inventory content within the route that defines stock list metadata. */
export default function InventoryLayout({
  children,
}: LayoutProps<"/dashboard/inventory">) {
  return children;
}
