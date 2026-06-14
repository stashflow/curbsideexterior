import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import { InstallPrompt } from "@/components/site/install-prompt";
import { PwaRegister } from "@/components/site/pwa-register";
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
  title: "CURBSIDE EXTERIOR CO. | Premium Exterior Cleaning",
  description:
    "Professional pressure washing, trash can cleaning, and curb number painting for homeowners, HOAs, and property managers.",
  keywords: [
    "pressure washing",
    "trash can cleaning",
    "curb number painting",
    "Marietta pressure washing",
    "exterior cleaning",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CURBSIDE",
  },
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
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
      <body className="min-h-full bg-[#02060B] font-body text-white antialiased">
        <PwaRegister />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
