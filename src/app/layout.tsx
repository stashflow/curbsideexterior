import type { Metadata, Viewport } from "next";
import { Inter, Teko } from "next/font/google";
import { InstallPrompt } from "@/components/site/install-prompt";
import { PwaRegister } from "@/components/site/pwa-register";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL } from "@/lib/business";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const heading = Teko({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "pressure washing",
    "trash can cleaning",
    "curb number painting",
    "Marietta pressure washing",
    "exterior cleaning",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "CURBSIDE EXTERIOR CO.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CURBSIDE EXTERIOR CO.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CURBSIDE",
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "1254x1254" }],
    shortcut: [{ url: "/favicon.png", type: "image/png", sizes: "1254x1254" }],
    apple: [{ url: "/favicon.png", type: "image/png", sizes: "1254x1254" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full`}
    >
      <body className="min-h-full bg-black font-body text-white antialiased">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "CURBSIDE EXTERIOR CO.",
              url: SITE_URL,
              telephone: BUSINESS_PHONE_TEL,
              description: SITE_DESCRIPTION,
              areaServed: [
                "Marietta, GA",
                "Kennesaw, GA",
                "Smyrna, GA",
                "East Cobb, GA",
                "Woodstock, GA",
                "Roswell, GA",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: BUSINESS_PHONE_DISPLAY,
                contactType: "customer service",
              },
              makesOffer: [
                "Driveway pressure washing",
                "House washing",
                "Patio cleaning",
                "Walkway cleaning",
                "Fence cleaning",
                "Trash can cleaning",
              ].map((serviceName) => ({
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: serviceName,
                  areaServed: "Marietta, GA",
                },
              })),
            }),
          }}
        />
        <PwaRegister />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
