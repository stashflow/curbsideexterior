import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CURBSIDE EXTERIOR CO.",
    short_name: "CURBSIDE",
    description: "Book exterior cleaning service, review pricing, and keep CURBSIDE on your home screen.",
    start_url: "/",
    display: "standalone",
    background_color: "#02060B",
    theme_color: "#02060B",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
