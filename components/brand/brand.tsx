import Link from "next/link";
import { Boxes } from "lucide-react";

/** Renders the Spatium 3D wordmark and icon as a link to the home page. */
export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-semibold tracking-tight text-white"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30">
        <Boxes className="size-4" aria-hidden />
      </span>
      Spatium 3D
    </Link>
  );
}
