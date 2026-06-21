import type { Metadata } from "next";

import { VerticalLandingPage, type VerticalLandingPageData } from "@/components/site/vertical-landing-page";
import { SITE_URL } from "@/lib/site";

const page: VerticalLandingPageData = {
  eyebrow: "Apartment Exterior Cleaning",
  headline: "Cleaner Apartment Communities Without Babysitting The Job",
  subhead:
    "CURBSIDE EXTERIOR CO. is licensed and insured for apartment communities that need cleaner sidewalks, breezeways, dumpster pads, entries, and resident-facing areas around Marietta.",
  audience: "Apartments + Communities",
  proof: [
    "Licensed and insured exterior cleaning",
    "Photo estimates for faster approvals",
    "Resident-friendly scheduling windows",
    "Before and after documentation",
  ],
  services: [
    "Sidewalk Cleaning",
    "Breezeway Touch-Ups",
    "Dumpster Pad Cleaning",
    "Entryway Washing",
    "Trash Can Cleaning",
    "Curb Appeal Cleanup",
    "Pressure Washing",
    "Soft Washing",
  ],
  workflow: [
    {
      title: "Walk The Property",
      body: "Send photos of the areas that look dirty or high-traffic. We can turn that into a simple estimate instead of making your team explain every surface.",
    },
    {
      title: "Prioritize The Worst Areas",
      body: "Start with leasing-office entries, sidewalks, dumpster areas, breezeways, mail areas, and resident-visible concrete.",
    },
    {
      title: "Schedule Around Residents",
      body: "We keep the plan simple: where we clean, when we clean, and how to avoid getting in the way of daily property operations.",
    },
    {
      title: "Document The Result",
      body: "After the job, the goal is clean proof: before and after photos, what was cleaned, and what should be handled next.",
    },
  ],
  scripts: [
    {
      title: "Leasing Office",
      body: "Good for entry walks, leasing-office concrete, curb appeal photos, and the first impression a prospect sees before they tour.",
    },
    {
      title: "Dumpster Area",
      body: "Good for grime, spills, odor areas, and the parts of the property residents complain about when they look neglected.",
    },
    {
      title: "Resident Walkways",
      body: "Good for high-traffic sidewalks, breezeways, mail kiosks, and routes residents use every day.",
    },
  ],
  faqs: [
    {
      question: "Can you estimate from photos?",
      answer: "Yes. Send photos of each area and we can build a simple exterior cleaning estimate before scheduling.",
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes. CURBSIDE EXTERIOR CO. is licensed and insured.",
    },
    {
      question: "Can you clean only one section?",
      answer: "Yes. Many communities start with the worst areas first, then add more sections later.",
    },
    {
      question: "Do you work around residents?",
      answer: "Yes. We can plan around office hours, resident traffic, and areas that need to stay accessible.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Apartment Pressure Washing Marietta GA | CURBSIDE EXTERIOR CO.",
  description:
    "Licensed and insured apartment exterior cleaning in Marietta, GA. Sidewalks, breezeways, entries, dumpster pads, and property curb appeal.",
  alternates: { canonical: "/apartments" },
  openGraph: {
    title: "Apartment Exterior Cleaning | CURBSIDE EXTERIOR CO.",
    description: "Licensed and insured exterior cleaning for apartment communities around Marietta.",
    url: `${SITE_URL}/apartments`,
    type: "website",
  },
};

export default function ApartmentsPage() {
  return <VerticalLandingPage page={page} />;
}
