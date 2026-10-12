import type { Metadata } from "next";
import { Brand } from "@/components/brand/brand";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Database,
  FileSpreadsheet,
  LayoutGrid,
  Route,
  ScanSearch,
} from "lucide-react";
import { IsoWarehouse } from "@/components/landing/iso-warehouse";
import { Stagger, StaggerItem } from "@/components/landing/motion";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  image: `${siteConfig.url}/opengraph-image`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Warehouse Management System",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript and WebGL 2",
  featureList: [
    "Interactive 3D warehouse digital twin",
    "A* pick-path routing from dock to rack",
    "Drag-to-paint 2D rack layout builder",
    "Bulk inventory import from CSV",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  publisher: {
    "@type": "Organization",
    name: siteConfig.publisher,
    url: siteConfig.url,
  },
};

const MINI_LAYOUT = [
  "0000000000",
  "0110110110",
  "0110110110",
  "0000000000",
  "0110110110",
];

const steps = [
  {
    title: "Paint your floor plan",
    body: "Open the 2D builder and drag across the grid to place racks and carve aisles. Save, and the layout becomes your warehouse matrix.",
  },
  {
    title: "Import your inventory",
    body: "Drop in a CSV with SKU, name, quantity and rack coordinates. The twin validates every row and writes it to MongoDB in one bulk operation.",
  },
  {
    title: "Route picks in 3D",
    body: "Enter the digital twin, click any rack to inspect its stock, and trace the shortest walkable route from the dock with a single button.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="relative isolate flex flex-1 flex-col overflow-hidden bg-[#05070b] text-slate-200">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]"
        >
          <div className="bg-mesh absolute inset-0" />
          <div className="bg-grid absolute inset-0" />
        </div>

        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#05070b]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
            <Brand />
            <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
              <a
                href="#features"
                className="hidden text-slate-400 transition-colors hover:text-white sm:block"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hidden text-slate-400 transition-colors hover:text-white sm:block"
              >
                How it works
              </a>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-medium text-white transition-colors hover:bg-white/10"
              >
                Open dashboard
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <section
            aria-labelledby="hero-heading"
            className="mx-auto w-full max-w-6xl px-6 pt-20 pb-24 sm:pt-28"
          >
            <Stagger className="flex flex-col items-center text-center">
              <StaggerItem>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgb(34_211_238/0.7)]" />
                  {siteConfig.name}
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1
                  id="hero-heading"
                  className="mt-6 max-w-4xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent sm:text-6xl lg:text-7xl"
                >
                  The 3D warehouse management system you can walk through
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-6 max-w-2xl text-base leading-7 text-pretty text-slate-400 sm:text-lg">
                  Spatium 3D turns your rack layout and inventory into a live
                  digital twin. See where every SKU sits, then route pickers
                  along the shortest path from dock to rack.
                </p>
              </StaggerItem>
              <StaggerItem className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgb(34_211_238/0.5),0_0_40px_-4px_rgb(34_211_238/0.7)] transition-shadow hover:shadow-[0_0_0_1px_rgb(34_211_238/0.8),0_0_60px_0px_rgb(34_211_238/0.8)]"
                >
                  Enter 3D Portal
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/dashboard/setup"
                  className="inline-flex h-12 items-center rounded-full border border-white/10 px-7 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                >
                  Design your layout
                </Link>
              </StaggerItem>
              <StaggerItem className="mt-16 w-full max-w-3xl">
                <div className="glow-card rounded-3xl p-4 backdrop-blur-sm sm:p-8">
                  <IsoWarehouse className="h-auto w-full" />
                </div>
              </StaggerItem>
            </Stagger>
          </section>

          <section
            id="features"
            aria-labelledby="features-heading"
            className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-cyan-400">Features</p>
              <h2
                id="features-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl"
              >
                Every rack, SKU and route in a single spatial view
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Spreadsheets tell you what you have. Your twin shows you where
                it is and how to get there.
              </p>
            </div>

            <Stagger className="mt-12 grid gap-4 md:grid-cols-6">
              <StaggerItem className="md:col-span-4">
                <article className="glow-card flex h-full flex-col justify-between gap-8 rounded-2xl p-6 sm:flex-row sm:items-center">
                  <div className="max-w-sm">
                    <Boxes className="size-5 text-cyan-400" aria-hidden />
                    <h3 className="mt-4 text-lg font-medium text-white">
                      Interactive 3D digital twin
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Orbit, pan and zoom a WebGL model of your floor. Stocked
                      racks glow cyan, empty ones recede, so open capacity is
                      obvious at a glance.
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="flex h-28 shrink-0 items-end gap-1.5"
                  >
                    {[60, 100, 45, 80, 100, 35, 70].map((height, i) => (
                      <span
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`w-5 rounded-sm border ${
                          i % 3 === 2
                            ? "border-slate-700 bg-slate-800"
                            : "border-cyan-300/60 bg-cyan-400/30 shadow-[0_0_18px_-2px_rgb(34_211_238/0.6)]"
                        }`}
                      />
                    ))}
                  </div>
                </article>
              </StaggerItem>

              <StaggerItem className="md:col-span-2">
                <article className="glow-card h-full rounded-2xl p-6">
                  <Route className="size-5 text-fuchsia-400" aria-hidden />
                  <h3 className="mt-4 text-lg font-medium text-white">
                    A* pick-path routing
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    One click draws the shortest walkable route from the dock
                    to any rack, steering around every obstacle in your layout.
                  </p>
                </article>
              </StaggerItem>

              <StaggerItem className="md:col-span-2">
                <article className="glow-card h-full rounded-2xl p-6">
                  <LayoutGrid className="size-5 text-cyan-400" aria-hidden />
                  <h3 className="mt-4 text-lg font-medium text-white">
                    Drag-to-paint layout builder
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Sketch racks and aisles on a 2D grid. What you paint is
                    exactly what renders in 3D.
                  </p>
                  <div aria-hidden className="mt-6 grid gap-1">
                    {MINI_LAYOUT.map((row, z) => (
                      <div key={z} className="flex gap-1">
                        {[...row].map((cell, x) => (
                          <span
                            key={x}
                            className={`h-3 flex-1 rounded-[3px] ${
                              cell === "1" ? "bg-cyan-400/70" : "bg-white/5"
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </article>
              </StaggerItem>

              <StaggerItem className="md:col-span-2">
                <article className="glow-card h-full rounded-2xl p-6">
                  <FileSpreadsheet
                    className="size-5 text-emerald-400"
                    aria-hidden
                  />
                  <h3 className="mt-4 text-lg font-medium text-white">
                    CSV inventory import
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Drop a file, preview every row, and bulk-load it. Bad rows
                    are flagged before anything is written.
                  </p>
                  <pre
                    aria-hidden
                    className="mt-6 overflow-hidden rounded-lg border border-white/5 bg-black/40 p-3 font-mono text-[11px] leading-5 text-slate-400"
                  >
                    {"SKU,Name,Qty,X,Z\nAS-2001,Tote,120,6,12\nAS-2002,Labels,900,14,11"}
                  </pre>
                </article>
              </StaggerItem>

              <StaggerItem className="md:col-span-2">
                <article className="glow-card h-full rounded-2xl p-6">
                  <ScanSearch className="size-5 text-indigo-400" aria-hidden />
                  <h3 className="mt-4 text-lg font-medium text-white">
                    Click-to-inspect racks
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Select any rack to slide open its inventory: SKUs, names
                    and on-hand quantities, straight from the database.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                    <Database className="size-3.5" aria-hidden />
                    Backed by MongoDB
                  </div>
                </article>
              </StaggerItem>
            </Stagger>
          </section>

          <section
            id="how-it-works"
            aria-labelledby="how-heading"
            className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-cyan-400">How it works</p>
              <h2
                id="how-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl"
              >
                From empty grid to routed picks in three steps
              </h2>
            </div>
            <Stagger>
              <ol className="mt-12 grid gap-4 md:grid-cols-3">
                {steps.map((step, i) => (
                  <li key={step.title}>
                    <StaggerItem className="h-full">
                      <article className="glow-card h-full rounded-2xl p-6">
                        <p className="font-mono text-xs text-cyan-400">
                          0{i + 1}
                        </p>
                        <h3 className="mt-4 text-lg font-medium text-white">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {step.body}
                        </p>
                      </article>
                    </StaggerItem>
                  </li>
                ))}
              </ol>
            </Stagger>
          </section>

          <section
            aria-labelledby="cta-heading"
            className="mx-auto w-full max-w-6xl px-6 pt-8 pb-28"
          >
            <div className="glow-card relative overflow-hidden rounded-3xl px-6 py-16 text-center">
              <div
                aria-hidden
                className="bg-mesh pointer-events-none absolute inset-0 -z-10 opacity-70"
              />
              <h2
                id="cta-heading"
                className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl"
              >
                Step inside your warehouse
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
                Load the sample distribution center and route your first pick
                in under a minute.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-200"
              >
                Launch the digital twin
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/5">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 {siteConfig.publisher}. The {siteConfig.product} is a spatial
              warehouse management system.
            </p>
            <nav aria-label="Footer">
              <ul className="flex gap-6">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Spatium 3D
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/setup" className="hover:text-white">
                    Layout builder
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
