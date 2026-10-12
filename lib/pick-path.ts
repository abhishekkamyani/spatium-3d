import PF from "pathfinding";
import type { LayoutMatrix } from "@/lib/warehouse";

export type GridPoint = { x: number; z: number };

export const DOCK: GridPoint = { x: 0, z: 0 };

/**
 * A* over the layout matrix (0 = walkable floor, 1 = rack). Racks block
 * travel, so the target rack is opened up to let the route end at its face.
 * Returns [x, z] cells from start to target, or [] when no route exists.
 */
export function findPickPath(
  matrix: LayoutMatrix,
  target: GridPoint,
  start: GridPoint = DOCK,
): [number, number][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const inBounds = ({ x, z }: GridPoint) =>
    x >= 0 && z >= 0 && x < cols && z < rows;

  if (!inBounds(start) || !inBounds(target)) return [];

  const grid = new PF.Grid(matrix);
  grid.setWalkableAt(start.x, start.z, true);
  grid.setWalkableAt(target.x, target.z, true);

  const finder = new PF.AStarFinder();
  const path = finder.findPath(start.x, start.z, target.x, target.z, grid);

  return path.map(([x, z]) => [x, z]);
}
