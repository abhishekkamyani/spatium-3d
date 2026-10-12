export const siteConfig = {
  name: "Spatium 3D",
  product: "Spatium 3D",
  publisher: "Meridian Depot",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  title: "Spatium 3D — Warehouse Management System",
  description:
    "Spatium 3D is a spatial warehouse management system. Design rack layouts, import inventory from CSV, and route pickers through a live 3D digital twin of your warehouse.",
  keywords: [
    "Spatium 3D",
    "3D warehouse software",
    "warehouse management system",
    "3D WMS",
    "warehouse digital twin",
    "pick path optimization",
    "warehouse layout software",
    "inventory slotting",
    "spatial logistics software",
    "WMS SaaS",
  ],
};
