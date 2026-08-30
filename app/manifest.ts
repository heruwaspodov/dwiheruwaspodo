import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dwi Heru — Software Engineer Portfolio",
    short_name: "Dwi Heru",
    description: "Software engineering portfolio of Dwi Heru Budi Waspodo.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3eddd",
    theme_color: "#ef3f38",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
