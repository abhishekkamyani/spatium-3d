import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `Warehouse Setup | ${siteConfig.name}` },
  description:
    "Paint your warehouse rack layout and bulk-import inventory from CSV.",
};

export default function SetupLayout({
  children,
}: LayoutProps<"/dashboard/setup">) {
  return children;
}
