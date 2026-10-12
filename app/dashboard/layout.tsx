import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Warehouse Dashboard | ${siteConfig.name}` },
  description:
    "Explore your warehouse in 3D, inspect rack inventory and route picks.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return children;
}
