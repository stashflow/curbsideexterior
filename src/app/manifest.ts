import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CURBSIDE EXTERIOR CO.",
    short_name: "CURBSIDE",
    description: "Book services, review quotes, and manage CURBSIDE bookings like an app.",
    start_url: "/",
    display: "standalone",
    background_color: "#02060B",
    theme_color: "#02060B",
    icons: [
      {
        src: "/Logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
