export type SeoLandingPage = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  primaryKeyword: string;
  serviceName: string;
  canonical: string;
  highlights: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
};

export const serviceLandingPages: SeoLandingPage[] = [
  {
    slug: "pressure-washing-marietta-ga",
    title: "Pressure Washing Marietta GA",
    metaTitle: "Pressure Washing Marietta GA | CURBSIDE EXTERIOR CO.",
    description:
      "Book pressure washing in Marietta GA for driveways, walkways, patios, siding, fences, and exterior surfaces with simple online estimates.",
    eyebrow: "Pressure Washing",
    headline: "Pressure Washing In Marietta GA",
    intro:
      "CURBSIDE helps homeowners clean up concrete, siding, patios, fences, and exterior surfaces without a confusing quote process.",
    primaryKeyword: "pressure washing Marietta GA",
    serviceName: "Pressure Washing",
    canonical: "/services/pressure-washing-marietta-ga",
    highlights: ["Driveways", "Walkways", "Patios", "Siding", "Fence Cleaning", "Photo Quotes"],
    sections: [
      {
        title: "Fast Exterior Cleaning Quotes",
        body: "Choose the closest size, upload photos if you are not sure, and see a live estimate before you submit the request.",
      },
      {
        title: "Built For Homeowners",
        body: "You do not need square footage. Pick simple driveway, patio, walkway, house wash, and fence options.",
      },
      {
        title: "Final Price Confirmed",
        body: "The online estimate gives a helpful range. We confirm the final price before service so expectations are clear.",
      },
    ],
    faqs: [
      {
        question: "Do I need to know square footage?",
        answer: "No. Choose the closest size option or upload photos and we can estimate it.",
      },
      {
        question: "Can I book pressure washing online?",
        answer: "Yes. The booking tool gives a live estimate and lets you request a preferred service time.",
      },
    ],
  },
  {
    slug: "driveway-cleaning-marietta-ga",
    title: "Driveway Cleaning Marietta GA",
    metaTitle: "Driveway Cleaning Marietta GA | Online Estimate",
    description:
      "Driveway pressure washing in Marietta GA with easy 1-car, 2-car, 3-car, and long driveway estimate options.",
    eyebrow: "Driveway Cleaning",
    headline: "Driveway Cleaning Made Easy",
    intro:
      "Pick the driveway size that looks closest, check the live estimate, and upload a photo if you want help confirming the size.",
    primaryKeyword: "driveway cleaning Marietta GA",
    serviceName: "Driveway Cleaning",
    canonical: "/services/driveway-cleaning-marietta-ga",
    highlights: ["1-Car Driveways", "2-Car Driveways", "3-Car Driveways", "Long Driveways", "Oil Spots", "Red Clay"],
    sections: [
      {
        title: "Simple Driveway Sizes",
        body: "The estimator uses homeowner-friendly driveway options instead of asking you to measure square footage.",
      },
      {
        title: "Good Pricing Balance",
        body: "Driveway cleaning starts with competitive local pricing, then adjusts for size and heavy buildup when needed.",
      },
      {
        title: "Photos Help",
        body: "If the driveway is unusually long, steep, or stained, upload a photo so the quote can be confirmed quickly.",
      },
    ],
    faqs: [
      {
        question: "How much is driveway cleaning?",
        answer: "The online tool shows a live estimate based on size. Final price is confirmed before service.",
      },
      {
        question: "What if my driveway is long?",
        answer: "Choose long driveway or upload a photo. We will confirm the best price before charging.",
      },
    ],
  },
  {
    slug: "house-washing-marietta-ga",
    title: "House Washing Marietta GA",
    metaTitle: "House Washing Marietta GA | Siding Cleaning",
    description:
      "House washing and siding cleaning in Marietta GA. Choose front, back, one side, two sides, or full house for a simple estimate.",
    eyebrow: "House Washing",
    headline: "House Washing For The Areas That Need It",
    intro:
      "Only choose the siding areas that actually need cleaning, so the quote stays fair and easy to understand.",
    primaryKeyword: "house washing Marietta GA",
    serviceName: "House Washing",
    canonical: "/services/house-washing-marietta-ga",
    highlights: ["Front Only", "Back Only", "One Side", "Two Sides", "Full House", "Siding Cleaning"],
    sections: [
      {
        title: "Choose Only What Needs Cleaning",
        body: "The estimator lets you pick front, back, side, two sides, or full house instead of forcing one generic price.",
      },
      {
        title: "Soft Wash Mindset",
        body: "House washing is quoted with care for siding areas and buildup level, not just a random flat number.",
      },
      {
        title: "Clear Confirmation",
        body: "If photos show a different condition than expected, the final price is confirmed before service.",
      },
    ],
    faqs: [
      {
        question: "Can I wash only one side of my house?",
        answer: "Yes. Choose the siding areas that actually need cleaning.",
      },
      {
        question: "Do photos help with house washing?",
        answer: "Yes. Photos are helpful for siding height, access, and buildup.",
      },
    ],
  },
  {
    slug: "trash-can-cleaning-marietta-ga",
    title: "Trash Can Cleaning Marietta GA",
    metaTitle: "Trash Can Cleaning Marietta GA | $30-$35 Bin Cleaning",
    description:
      "Trash can cleaning in Marietta GA with transparent $30-$35 pricing. One bin is $30 and two or more bins are $35 total.",
    eyebrow: "Trash Can Cleaning",
    headline: "Trash Can Cleaning For $30-$35",
    intro:
      "Simple bin cleaning pricing: one trash can is $30, and two or more cans are $35 total for one-time service.",
    primaryKeyword: "trash can cleaning Marietta GA",
    serviceName: "Trash Can Cleaning",
    canonical: "/services/trash-can-cleaning-marietta-ga",
    highlights: ["1 Bin $30", "2+ Bins $35", "Odor Help", "One-Time Cleaning", "Monthly Review", "Easy Booking"],
    sections: [
      {
        title: "Transparent Bin Pricing",
        body: "One bin is $30. Two or more bins are $35 total. You can see the price in the booking estimate before submitting.",
      },
      {
        title: "Good For Odor And Grime",
        body: "Trash can cleaning helps reset bins that smell bad, have residue, or need a quick curbside cleanup.",
      },
      {
        title: "Recurring Service Reviewed",
        body: "Monthly trash can service can be requested online and is reviewed before confirmation.",
      },
    ],
    faqs: [
      {
        question: "How much is trash can cleaning?",
        answer: "One bin is $30. Two or more bins are $35 total.",
      },
      {
        question: "Can I add bin cleaning to pressure washing?",
        answer: "Yes. You can combine trash can cleaning with pressure washing in one booking request.",
      },
    ],
  },
];

export const areaLandingPages: SeoLandingPage[] = [
  {
    slug: "marietta-ga-exterior-cleaning",
    title: "Exterior Cleaning Marietta GA",
    metaTitle: "Exterior Cleaning Marietta GA | CURBSIDE EXTERIOR CO.",
    description:
      "Exterior cleaning in Marietta GA for driveways, sidewalks, patios, siding, fences, and trash cans with fast online estimates.",
    eyebrow: "Marietta Service Area",
    headline: "Exterior Cleaning In Marietta GA",
    intro:
      "CURBSIDE serves Marietta homeowners with simple online booking for pressure washing, house washing, driveway cleaning, and trash can cleaning.",
    primaryKeyword: "exterior cleaning Marietta GA",
    serviceName: "Exterior Cleaning",
    canonical: "/areas/marietta-ga-exterior-cleaning",
    highlights: ["Marietta", "East Cobb", "Kennesaw", "Smyrna", "Woodstock", "Roswell"],
    sections: [
      {
        title: "Local Exterior Cleaning",
        body: "Book a fast estimate for the exterior surfaces that make the biggest difference in curb appeal.",
      },
      {
        title: "Simple Online Booking",
        body: "Pick services, choose homeowner-friendly sizes, and request a preferred date without waiting on a long phone call.",
      },
      {
        title: "Clear Scope",
        body: "Only choose what needs cleaning. Driveways, walkways, patios, siding, fences, and trash bins can be quoted together.",
      },
    ],
    faqs: [
      {
        question: "Do you serve Marietta GA?",
        answer: "Yes. Marietta is a main service area for CURBSIDE EXTERIOR CO.",
      },
      {
        question: "Can I get a quote online?",
        answer: "Yes. The booking tool gives a live estimate and lets you upload photos if needed.",
      },
    ],
  },
];

export function getServiceLandingPage(slug: string) {
  return serviceLandingPages.find((page) => page.slug === slug);
}

export function getAreaLandingPage(slug: string) {
  return areaLandingPages.find((page) => page.slug === slug);
}
