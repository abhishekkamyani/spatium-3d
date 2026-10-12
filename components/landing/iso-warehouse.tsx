// Static isometric preview of the digital twin, drawn as plain SVG so the
// landing page ships no WebGL.

const COLS = 7;
const ROWS = 7;
const TILE_W = 34;
const TILE_H = 17;
// Kept below two tile heights so racks never hide the aisle behind them.
const RACK_HEIGHT = 16;
const ORIGIN_X = 260;
const ORIGIN_Y = 70;

const isRackCell = (x: number, z: number) =>
  (x === 1 || x === 2 || x === 4 || x === 5) && z >= 1 && z <= 5;

const STOCKED = new Set(["1:1", "2:3", "4:3", "5:1", "4:5", "1:4", "5:4"]);
const TARGET = "4:3";
const ROUTE: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [3, 1],
  [3, 2],
  [3, 3],
];

/** Projects grid coordinates onto the SVG’s isometric plane in pixels. */
function project(x: number, z: number): [number, number] {
  return [ORIGIN_X + (x - z) * TILE_W, ORIGIN_Y + (x + z) * TILE_H];
}

/**
 * Returns SVG polygon points for a tile centered at the given pixel coordinates.
 * The scale multiplies the base tile width and height.
 */
function diamond(cx: number, cy: number, scale = 1): string {
  const w = TILE_W * scale;
  const h = TILE_H * scale;
  return `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
}

/** Draws an isometric rack using the preview’s fixed stock and target highlights. */
function Rack({ x, z }: { x: number; z: number }) {
  const [cx, cy] = project(x, z);
  const w = TILE_W * 0.8;
  const h = TILE_H * 0.8;
  const top = cy - RACK_HEIGHT;
  const key = `${x}:${z}`;
  const stocked = STOCKED.has(key);
  const target = key === TARGET;

  const stroke = target ? "#f0abfc" : stocked ? "#22d3ee" : "#334155";
  const fills = target
    ? ["#f5d0fe", "#a21caf", "#701a75"]
    : stocked
      ? ["#67e8f9", "#0e7490", "#155e75"]
      : ["#1e293b", "#0f172a", "#0b1220"];

  return (
    <g
      stroke={stroke}
      strokeWidth={1}
      strokeLinejoin="round"
      filter={stocked || target ? "url(#rack-glow)" : undefined}
    >
      <polygon
        fill={fills[1]}
        points={`${cx - w},${top} ${cx},${top + h} ${cx},${cy + h} ${cx - w},${cy}`}
      />
      <polygon
        fill={fills[2]}
        points={`${cx + w},${top} ${cx},${top + h} ${cx},${cy + h} ${cx + w},${cy}`}
      />
      <polygon fill={fills[0]} points={diamond(cx, top, 0.8)} />
    </g>
  );
}

/** Renders a static SVG warehouse preview with stocked racks, dock, and pick route. */
export function IsoWarehouse({ className }: { className?: string }) {
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => ({
    x: i % COLS,
    z: Math.floor(i / COLS),
  }));
  // Painter's order: far cells first.
  const racks = cells
    .filter(({ x, z }) => isRackCell(x, z))
    .sort((a, b) => a.x + a.z - (b.x + b.z));
  const route = ROUTE.map(([x, z]) => project(x, z).join(",")).join(" ");
  const [dockX, dockY] = project(0, 0);

  return (
    <svg
      viewBox="10 34 500 266"
      className={className}
      role="img"
      aria-labelledby="iso-warehouse-title"
    >
      <title id="iso-warehouse-title">
        Isometric warehouse digital twin with stocked racks highlighted and a
        pick path routed from the dock to a selected rack
      </title>
      <defs>
        <filter id="rack-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g fill="rgb(255 255 255 / 0.015)" stroke="rgb(255 255 255 / 0.09)">
        {cells.map(({ x, z }) => {
          const [cx, cy] = project(x, z);
          return <polygon key={`${x}:${z}`} points={diamond(cx, cy)} />;
        })}
      </g>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline
          points={route}
          stroke="#e879f9"
          strokeWidth={7}
          opacity={0.7}
          filter="url(#route-glow)"
        />
        <polyline points={route} stroke="#fae8ff" strokeWidth={2} />
      </g>
      <circle cx={dockX} cy={dockY} r={5} fill="#a3e635" />

      {racks.map(({ x, z }) => (
        <Rack key={`${x}:${z}`} x={x} z={z} />
      ))}
    </svg>
  );
}
