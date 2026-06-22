import { ImageResponse } from "next/og";

// Generates the browser favicon: a bold "L" in Poppins, matching the sidebar wordmark.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Fetch only the glyphs we need so the request stays tiny. The css2 endpoint
// returns a truetype/opentype src that satori (next/og) can consume.
const loadPoppins = async (text: string) => {
  const url = `https://fonts.googleapis.com/css2?family=Poppins:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!resource) throw new Error("Failed to resolve Poppins font URL");
  return (await fetch(resource[1])).arrayBuffer();
};

export default async function Icon() {
  const fontData = await loadPoppins("L");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1,
          // Poppins seats the cap-glyph high in its line box; nudge down to optically center.
          paddingTop: 3,
          color: "#1e1e2e",
          background: "transparent",
        }}
      >
        L
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Poppins", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
