import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Spatium 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generates the branded 1200×630 PNG used for social link previews. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#f8fafc",
          background:
            "radial-gradient(60% 80% at 15% 10%, rgba(34,211,238,0.28), transparent 70%), radial-gradient(50% 70% at 90% 90%, rgba(129,140,248,0.28), transparent 70%), #05070b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 30 }}>
          <div
            style={{
              width: 22,
              height: 22,
              marginRight: 16,
              borderRadius: 6,
              background: "#22d3ee",
            }}
          />
          <span>{siteConfig.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            See your warehouse. Route every pick.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#94a3b8" }}>
            {"Spatial warehouse management"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
