import type { Metadata } from "next";

import { VerticalLandingPage, type VerticalLandingPageData } from "@/components/site/vertical-landing-page";
import { SITE_URL } from "@/lib/site";

const page: VerticalLandingPageData = {
  eyebrow: "Property Manager Cleaning",
  headline: "Exterior Cleaning For Rentals, Listings, And Managed Homes",
  subhead:
    "CURBSIDE EXTERIOR CO. is licensed and insured for property managers, landlords, realtors, and short-term rental hosts who need fast exterior cleanup without extra back-and-forth.",
  audience: "Managers + Landlords",
  proof: [
    "Licensed and insured for managed properties",
    "Fast photo-based estimates",
    "Before and after photos for owner records",
    "Good fit for turnovers, listings, and maintenance",
  ],
  services: [
    "Driveway Cleaning",
    "Walkway Cleaning",
    "Patio Cleaning",
    "House Washing",
    "Trash Can Cleaning",
    "Listing Prep",
    "Move-Out Cleanup",
    "Rental Turnovers",
  ],
  workflow: [
    {
      title: "Send The Address",
      body: "Send the property address, ZIP code, and photos of the exterior areas that need attention.",
    },
    {
      title: "Get A Clear Estimate",
      body: "We estimate based on the actual surfaces: driveway, walkway, patio, house wash, fence, or trash cans.",
    },
    {
      title: "Approve The Work",
      body: "Use the online booking flow or text photos so you can approve the job without making a site visit.",
    },
    {
      title: "Keep The Proof",
      body: "Before and after photos make it easier to update owners, tenants, buyers, or guests.",
    },
  ],
  scripts: [
    {
      title: "Turnover Ready",
      body: "Use this before a new tenant moves in so the driveway, patio, cans, and entry areas feel cared for.",
    },
    {
      title: "Listing Prep",
      body: "Use this before photos or showings when the property needs to look sharper from the street.",
    },
    {
      title: "Owner Update",
      body: "Use before/after photos and a simple estimate so owners can approve maintenance without a long email chain.",
    },
  ],
  faqs: [
    {
      question: "Can you work from photos?",
      answer: "Yes. Photos are the fastest way to estimate managed properties without needing everyone on site.",
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes. CURBSIDE EXTERIOR CO. is licensed and insured.",
    },
    {
      question: "Can you handle multiple properties?",
      answer: "Yes. Start with one address or send a small list and we can prioritize what needs cleaning first.",
    },
    {
      question: "What services are best for rentals?",
      answer: "Driveways, walkways, patios, house wash, trash can cleaning, and quick curb appeal cleanup are the best fit.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Property Manager Exterior Cleaning Marietta GA | CURBSIDE EXTERIOR CO.",
  description:
    "Licensed and insured exterior cleaning for property managers, landlords, realtors, listings, and rental turnovers around Marietta, GA.",
  alternates: { canonical: "/property-managers" },
  openGraph: {
    title: "Property Manager Exterior Cleaning | CURBSIDE EXTERIOR CO.",
    description: "Fast photo estimates and exterior cleaning for managed homes, rentals, and listings.",
    url: `${SITE_URL}/property-managers`,
    type: "website",
  },
};

export default function PropertyManagersPage() {
  return <VerticalLandingPage page={page} />;
}
