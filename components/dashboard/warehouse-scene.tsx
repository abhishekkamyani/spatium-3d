"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Grid, Line, OrbitControls, useCursor } from "@react-three/drei";
import type { Mesh } from "three";
import { DOCK } from "@/lib/pick-path";
import { useWarehouseStore } from "@/lib/store";
import { RACK, cellKey, type LayoutMatrix } from "@/lib/warehouse";

const RACK_HEIGHT = 1.6;
const PATH_Y = 0.08;

const COLORS = {
  background: "#05070b",
  floor: "#080b12",
  stocked: "#22d3ee",
  empty: "#1e293b",
  emptyEdge: "#475569",
  selected: "#f0abfc",
  path: "#e879f9",
  dock: "#a3e635",
};

type Vec3 = [number, number, number];

/** Renders a selectable rack mesh colored by stock, selection, and hover state. */
function Rack({
  position,
  stocked,
  selected,
  onSelect,
}: {
  position: Vec3;
  stocked: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const color = selected
    ? COLORS.selected
    : stocked
      ? COLORS.stocked
      : COLORS.empty;
  const lit = stocked || selected;

  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[0.84, RACK_HEIGHT, 0.84]} />
      <meshStandardMaterial
        color={color}
        emissive={lit ? color : "#000000"}
        emissiveIntensity={selected ? 1.1 : hovered ? 0.9 : 0.55}
        metalness={0.2}
        roughness={0.45}
        transparent
        opacity={lit ? 0.9 : hovered ? 1 : 0.85}
      />
      <Edges color={lit ? "#ecfeff" : hovered ? "#94a3b8" : COLORS.emptyEdge} />
    </mesh>
  );
}

/** Glowing route plus a marker that travels it from dock to rack. */
function PickPath({ points }: { points: Vec3[] }) {
  const marker = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!marker.current) return;
    const segments = points.length - 1;
    const travelled = (clock.elapsedTime * 4) % segments;
    const index = Math.floor(travelled);
    const t = travelled - index;
    const [ax, ay, az] = points[index];
    const [bx, by, bz] = points[index + 1];
    marker.current.position.set(
      ax + (bx - ax) * t,
      ay + (by - ay) * t + 0.15,
      az + (bz - az) * t,
    );
  });

  return (
    <group>
      <Line
        points={points}
        color={COLORS.path}
        lineWidth={10}
        transparent
        opacity={0.25}
        toneMapped={false}
      />
      <Line points={points} color="#fdf4ff" lineWidth={2.5} toneMapped={false} />
      <mesh ref={marker}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#fdf4ff" toneMapped={false} />
      </mesh>
      <pointLight
        position={points[points.length - 1]}
        color={COLORS.path}
        intensity={6}
        distance={5}
      />
    </group>
  );
}

/** Builds the centered warehouse floor, racks, dock marker, and current pick route. */
function Warehouse({ layoutMatrix }: { layoutMatrix: LayoutMatrix }) {
  const inventory = useWarehouseStore((state) => state.inventory);
  const selected = useWarehouseStore((state) => state.selected);
  const path = useWarehouseStore((state) => state.path);
  const selectRack = useWarehouseStore((state) => state.selectRack);

  const rows = layoutMatrix.length;
  const cols = layoutMatrix[0].length;

  const stockedCells = useMemo(
    () => new Set(inventory.map((item) => cellKey(item.x, item.z))),
    [inventory],
  );

  // Centre the grid on the world origin.
  const toWorld = (x: number, z: number, y: number): Vec3 => [
    x - (cols - 1) / 2,
    y,
    z - (rows - 1) / 2,
  ];

  const pathPoints = path.map(([x, z]) => toWorld(x, z, PATH_Y));

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[cols, rows]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.9} />
      </mesh>
      <Grid
        args={[cols, rows]}
        // Keep grid lines on cell boundaries for odd-sized layouts too.
        position={[(cols % 2) / 2, 0, (rows % 2) / 2]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#0e7490"
        fadeDistance={90}
        fadeStrength={1}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={toWorld(DOCK.x, DOCK.z, 0.02)}
      >
        <ringGeometry args={[0.22, 0.38, 32]} />
        <meshBasicMaterial color={COLORS.dock} toneMapped={false} />
      </mesh>

      {layoutMatrix.map((row, z) =>
        row.map((cell, x) =>
          cell === RACK ? (
            <Rack
              key={cellKey(x, z)}
              position={toWorld(x, z, RACK_HEIGHT / 2)}
              stocked={stockedCells.has(cellKey(x, z))}
              selected={selected?.x === x && selected.z === z}
              onSelect={() => selectRack({ x, z })}
            />
          ) : null,
        ),
      )}

      {pathPoints.length > 1 && <PickPath points={pathPoints} />}
    </group>
  );
}

/** Renders the warehouse canvas with lighting and orbit controls scaled to the layout. */
export default function WarehouseScene() {
  const layoutMatrix = useWarehouseStore((state) => state.layoutMatrix);
  const selectRack = useWarehouseStore((state) => state.selectRack);

  const rows = layoutMatrix?.length ?? 20;
  const cols = layoutMatrix?.[0]?.length ?? 20;
  const span = Math.max(rows, cols);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [span * 0.9, span * 1.05, span * 1.35], fov: 42 }}
        onPointerMissed={() => selectRack(null)}
      >
        <color attach="background" args={[COLORS.background]} />
        <fog attach="fog" args={[COLORS.background, span * 1.6, span * 4]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 8]} intensity={1.1} />
        <pointLight position={[0, 12, 0]} color="#22d3ee" intensity={40} />

        {layoutMatrix && <Warehouse layoutMatrix={layoutMatrix} />}

        <OrbitControls
          makeDefault
          enableDamping
          maxPolarAngle={Math.PI / 2.15}
          minDistance={6}
          maxDistance={span * 3}
        />
      </Canvas>
    </div>
  );
}
