# Spatium 3D — 3D Warehouse Management System

**Spatium 3D** is a spatial warehouse management system (WMS) that turns your rack layout and inventory into an interactive **3D warehouse digital twin**. Paint a floor plan, import stock from CSV, see where every SKU sits, and trace the shortest walkable **pick path** from the dock to any rack.

Built for **Meridian Depot** with Next.js, React Three Fiber and MongoDB.

## Features

- **Interactive 3D warehouse digital twin**: WebGL view of racks and stocked locations, with click-to-inspect rack details.
- **Pick-path optimization**: A\* routing from the dock to any rack over walkable aisles.
- **Warehouse layout builder**: drag-to-paint 2D grid editor for racks and aisles (default 20×20, up to 60×60).
- **Bulk inventory import from CSV**: row-level validation, up to 5,000 rows per import.
- **Item finder and stock list**: search by SKU or item name, jump to the rack, and adjust stock levels.
- **SEO-ready landing page**: metadata, Open Graph and Twitter cards, JSON-LD structured data, sitemap, robots rules and generated icons.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · React Three Fiber / three.js · Tailwind CSS 4 · shadcn/ui · Zustand · Framer Motion · MongoDB with Mongoose · PapaParse · pathfinding

## Getting started

### Prerequisites

- Node.js 20 or newer
- A running MongoDB instance (local or MongoDB Atlas)

### Setup

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
```

Edit `.env.local`:

| Variable               | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `MONGODB_URI`          | MongoDB connection string (default `mongodb://127.0.0.1:27017/meridian-depot`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for canonical links, the sitemap and social cards. Set it to your production domain before deploying. |

Load the sample warehouse and inventory, then start the dev server:

```bash
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is taken, Next.js picks the next free one and prints it.

## Commands

| Command         | What it does                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `npm run dev`   | Starts the development server with Turbopack and hot reload.                                           |
| `npm run build` | Creates an optimized production build and type-checks the project.                                     |
| `npm start`     | Serves the production build. Run `npm run build` first.                                                |
| `npm run lint`  | Runs ESLint.                                                                                           |
| `npm run seed`  | Replaces the saved warehouse and inventory with the sample data (a 20×20 layout, 10 SKUs). **Deletes existing warehouse and inventory documents.** |

Start on a specific port with `npm run dev -- -p 3001` or `npm start -- -p 3001`.

## Using the app

| Route                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `/`                  | Landing page.                                        |
| `/dashboard`         | 3D warehouse view, item finder and rack details.     |
| `/dashboard/inventory` | Searchable stock list with quantity adjustments.   |
| `/dashboard/setup`   | Layout builder and CSV importer.                     |

### CSV import format

Racks are addressed by grid coordinates, where `X` is the column and `Z` is the row. Each item must sit on a rack cell, and existing SKUs are updated in place. Column names are case-insensitive. See [`public/sample-inventory.csv`](public/sample-inventory.csv):

```csv
SKU,Name,Qty,X,Z
AS-2001,Collapsible Tote 24x16,120,6,12
```

## API

| Endpoint                | Methods      | Description                          |
| ----------------------- | ------------ | ------------------------------------ |
| `/api/warehouse`        | GET, PUT     | Read or save the layout matrix.      |
| `/api/inventory`        | GET, POST    | List items or bulk-import them.      |
| `/api/inventory/[sku]`  | PUT          | Update one item.                     |

## SEO

SEO is configured in code:

- Site-wide copy and keywords live in [`lib/site.ts`](lib/site.ts).
- Metadata, title template and social tags are in [`app/layout.tsx`](app/layout.tsx).
- Structured data (`SoftwareApplication` JSON-LD) is on the landing page, [`app/page.tsx`](app/page.tsx).
- [`app/sitemap.ts`](app/sitemap.ts) serves `/sitemap.xml` and [`app/robots.ts`](app/robots.ts) serves `/robots.txt`, which keeps `/dashboard` and `/api` out of search results.
- Icons, the web manifest and the social share image are generated in `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts` and `app/opengraph-image.tsx`.

After deploying, submit `https://your-domain.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Deployment

Deploy to any Node.js host, or to [Vercel](https://vercel.com). Set `MONGODB_URI` (MongoDB Atlas works well) and `NEXT_PUBLIC_SITE_URL` in the host's environment variables, then run `npm run build` and `npm start`.

## Keywords

3D warehouse management system, warehouse digital twin, 3D WMS, pick path optimization, warehouse layout software, inventory slotting, spatial logistics software, rack and aisle visualization, CSV inventory import.

## Developer

Built and maintained by **Abhishek Kamyani**, a Full Stack Developer from
Pakistan with 2+ years of experience building web products with React, Next.js
and Node.js.

- **Currently:** Full Stack Developer (Next.js) at AlFactor Inc., plus freelance work
- **Education:** BS Computer Science, Sukkur IBA University
- **Skills:** React, Next.js, TypeScript, Tailwind CSS, Node.js, Express, MongoDB, REST APIs, Jest, Playwright, Docker, CI/CD
- **Other projects:** Sareer Publication Admin Panel (MERN), Tone Shift AI, AI Chef Mate (React Native)

**Contact**

- Portfolio: https://abhishekkamyani.vercel.app/
- Email: abhishekkamyani@gmail.com
- LinkedIn: https://linkedin.com/in/abhishekkamyani
