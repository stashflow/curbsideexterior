import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoLandingPageView } from "@/components/site/seo-landing-page";
import { getServiceLandingPage, serviceLandingPages } from "@/lib/seo-landing-pages";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return serviceLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getServiceLandingPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: page.canonical,
    },
    keywords: [page.primaryKeyword, page.serviceName, "Marietta exterior cleaning", "CURBSIDE EXTERIOR CO."],
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `${SITE_URL}${page.canonical}`,
      type: "website",
      images: [
        {
          url: "/opengraph-image?v=20260618",
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.description,
      images: ["/twitter-image?v=20260618"],
    },
  };
}

export default async function ServiceLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getServiceLandingPage(slug);
  if (!page) notFound();

  return <SeoLandingPageView page={page} />;
}
