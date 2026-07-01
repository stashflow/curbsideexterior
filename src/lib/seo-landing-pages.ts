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
    metaTitle: "Trash Can Cleaning Marietta GA | From $20",
    description:
      "Trash can cleaning in Marietta GA with bundle pricing: $20 for one bin, $35 for two, $50 for three, and $10 for each additional bin.",
    eyebrow: "Trash Can Cleaning",
    headline: "Trash Can Cleaning From $20",
    intro:
      "Simple bin cleaning pricing: 1 bin is $20, 2 bins are $35, 3 bins are $50, and each additional bin is $10.",
    primaryKeyword: "trash can cleaning Marietta GA",
    serviceName: "Trash Can Cleaning",
    canonical: "/services/trash-can-cleaning-marietta-ga",
    highlights: ["1 Bin $20", "2 Bins $35", "3 Bins $50", "+$10 Extra", "Odor Help", "Easy Booking"],
    sections: [
      {
        title: "Transparent Bin Pricing",
        body: "1 bin is $20, 2 bins are $35, 3 bins are $50, and each additional bin is $10. You can see the price in the booking estimate before submitting.",
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
        answer: "1 bin is $20, 2 bins are $35, 3 bins are $50, and each additional bin is $10.",
      },
      {
        question: "Can I add bin cleaning to pressure washing?",
        answer: "Yes. You can combine trash can cleaning with pressure washing in one booking request.",
      },
    ],
  },
  {
    slug: "pressure-washing-near-me-marietta-ga",
    title: "Pressure Washing Near Me In Marietta GA",
    metaTitle: "Pressure Washing Near Me Marietta GA | CURBSIDE",
    description:
      "Searching pressure washing near me in Marietta GA? CURBSIDE offers driveway, walkway, patio, siding, fence, and trash can cleaning with fast quotes.",
    eyebrow: "Near Me Search",
    headline: "Pressure Washing Near Me In Marietta",
    intro:
      "If you are in Marietta and need exterior cleaning nearby, CURBSIDE makes it easy to get a quote without measuring square footage.",
    primaryKeyword: "pressure washing near me Marietta GA",
    serviceName: "Pressure Washing Near Me",
    canonical: "/services/pressure-washing-near-me-marietta-ga",
    highlights: ["Near Marietta", "Driveways", "Patios", "Walkways", "Siding", "Photo Quotes"],
    sections: [
      {
        title: "Built For Local Searchers",
        body: "This page helps Marietta homeowners who search for pressure washing near me find a local exterior cleaning option with clear next steps.",
      },
      {
        title: "Quote Without Measuring",
        body: "Pick simple sizes, send photos, or let us create the quote for you if we are already talking in person.",
      },
      {
        title: "Fast Booking Path",
        body: "Book online, text photos, or scan a QR code from a flyer or door hanger to get started.",
      },
    ],
    faqs: [
      {
        question: "Do you offer pressure washing near Marietta?",
        answer: "Yes. CURBSIDE serves Marietta and nearby areas around East Cobb, Kennesaw, Smyrna, Woodstock, and Roswell.",
      },
      {
        question: "Can I just text photos?",
        answer: "Yes. Photos are often the fastest way to quote pressure washing work.",
      },
    ],
  },
  {
    slug: "driveway-pressure-washing-near-me",
    title: "Driveway Pressure Washing Near Me",
    metaTitle: "Driveway Pressure Washing Near Me | Marietta GA",
    description:
      "Driveway pressure washing near Marietta GA with simple driveway size options, photo quotes, and fast online booking.",
    eyebrow: "Driveway Near Me",
    headline: "Driveway Pressure Washing Nearby",
    intro:
      "For homeowners searching driveway pressure washing near me, CURBSIDE keeps the quote simple with 1-car, 2-car, 3-car, and long driveway choices.",
    primaryKeyword: "driveway pressure washing near me",
    serviceName: "Driveway Pressure Washing",
    canonical: "/services/driveway-pressure-washing-near-me",
    highlights: ["1-Car", "2-Car", "3-Car", "Long Driveway", "Photo Help", "Marietta"],
    sections: [
      {
        title: "Simple Driveway Choices",
        body: "Use easy driveway size options instead of guessing exact square footage.",
      },
      {
        title: "Great For Curb Appeal",
        body: "A clean driveway can make the whole front of the home feel better kept.",
      },
      {
        title: "Quote Before Service",
        body: "You see a live estimate first, and the final price is confirmed before service.",
      },
    ],
    faqs: [
      {
        question: "Can you quote a driveway from photos?",
        answer: "Yes. Send photos or choose the closest driveway size online.",
      },
      {
        question: "Do oil spots cost more?",
        answer: "Heavy stains can add extra treatment cost, and we confirm that before service.",
      },
    ],
  },
  {
    slug: "trash-can-cleaning-near-me",
    title: "Trash Can Cleaning Near Me",
    metaTitle: "Trash Can Cleaning Near Me | Marietta GA From $20",
    description:
      "Trash can cleaning near Marietta GA with clear pricing for homeowners who want cleaner bins and less odor.",
    eyebrow: "Bin Cleaning Near Me",
    headline: "Trash Can Cleaning Near Me",
    intro:
      "1 bin is $20, 2 bins are $35, 3 bins are $50, and each additional bin is $10. Add bin cleaning to a pressure washing request or book it by itself.",
    primaryKeyword: "trash can cleaning near me",
    serviceName: "Trash Can Cleaning Near Me",
    canonical: "/services/trash-can-cleaning-near-me",
    highlights: ["1 Bin $20", "2 Bins $35", "3 Bins $50", "+$10 Extra", "Easy Booking", "Add-On Service"],
    sections: [
      {
        title: "Clear Bin Pricing",
        body: "Bundle pricing keeps it simple: $20 for one bin, $35 for two, $50 for three, and $10 for each additional bin.",
      },
      {
        title: "Easy Add-On",
        body: "Add trash can cleaning while booking driveway, patio, walkway, or house washing.",
      },
      {
        title: "Local And Convenient",
        body: "Great for Marietta homeowners who want bins cleaned without a full exterior cleaning project.",
      },
    ],
    faqs: [
      {
        question: "How much is bin cleaning near me?",
        answer: "For CURBSIDE, 1 bin is $20, 2 bins are $35, 3 bins are $50, and each additional bin is $10.",
      },
      {
        question: "Can I book just trash can cleaning?",
        answer: "Yes. You can book trash can cleaning by itself or add it to pressure washing.",
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
  {
    slug: "east-cobb-ga-pressure-washing",
    title: "Pressure Washing East Cobb GA",
    metaTitle: "Pressure Washing East Cobb GA | CURBSIDE",
    description:
      "Pressure washing and exterior cleaning near East Cobb GA for driveways, patios, walkways, siding, fences, and trash bins.",
    eyebrow: "East Cobb Service Area",
    headline: "Pressure Washing In East Cobb",
    intro:
      "CURBSIDE helps East Cobb homeowners request fast quotes for concrete, siding, patios, fences, and bin cleaning.",
    primaryKeyword: "pressure washing East Cobb GA",
    serviceName: "Pressure Washing",
    canonical: "/areas/east-cobb-ga-pressure-washing",
    highlights: ["East Cobb", "Driveways", "Patios", "House Washing", "Trash Bins", "Photo Quotes"],
    sections: [
      {
        title: "East Cobb Exterior Cleaning",
        body: "Get a simple quote for the areas that actually need cleaning.",
      },
      {
        title: "Homeowner-Friendly Estimates",
        body: "Use simple size choices or send photos if you are not sure.",
      },
      {
        title: "Clear Scheduling",
        body: "Pick a preferred date and we confirm route timing before service.",
      },
    ],
    faqs: [
      {
        question: "Do you serve East Cobb?",
        answer: "Yes. East Cobb is part of the nearby service area for CURBSIDE.",
      },
      {
        question: "Can I get an online estimate?",
        answer: "Yes. Use the booking tool or send photos for a fast quote.",
      },
    ],
  },
  {
    slug: "kennesaw-ga-pressure-washing",
    title: "Pressure Washing Kennesaw GA",
    metaTitle: "Pressure Washing Kennesaw GA | CURBSIDE",
    description:
      "Pressure washing near Kennesaw GA for driveways, walkways, patios, siding, fences, and trash can cleaning.",
    eyebrow: "Kennesaw Service Area",
    headline: "Pressure Washing In Kennesaw",
    intro:
      "CURBSIDE serves Kennesaw-area homeowners with simple exterior cleaning quotes and mobile-friendly booking.",
    primaryKeyword: "pressure washing Kennesaw GA",
    serviceName: "Pressure Washing",
    canonical: "/areas/kennesaw-ga-pressure-washing",
    highlights: ["Kennesaw", "Driveways", "Walkways", "Patios", "Siding", "Trash Bins"],
    sections: [
      {
        title: "Clean Up Curb Appeal",
        body: "Quote driveway, walkway, patio, house wash, fence, and bin cleaning in one request.",
      },
      {
        title: "No Square Footage Needed",
        body: "Choose the closest size option and we confirm before charging.",
      },
      {
        title: "Text Photos",
        body: "If the job is unusual, photos are often enough to get a fast quote.",
      },
    ],
    faqs: [
      {
        question: "Do you pressure wash near Kennesaw?",
        answer: "Yes. Kennesaw is included in the nearby service area when route timing works.",
      },
      {
        question: "Is there a travel fee?",
        answer: "Some farther ZIP codes may include a small travel fee, shown in the estimate.",
      },
    ],
  },
  {
    slug: "smyrna-ga-pressure-washing",
    title: "Pressure Washing Smyrna GA",
    metaTitle: "Pressure Washing Smyrna GA | CURBSIDE",
    description:
      "Pressure washing near Smyrna GA with online estimates for driveways, patios, walkways, siding, fences, and trash cans.",
    eyebrow: "Smyrna Service Area",
    headline: "Pressure Washing In Smyrna",
    intro:
      "For Smyrna homeowners, CURBSIDE provides a simple quote flow for exterior cleaning and trash bin cleaning.",
    primaryKeyword: "pressure washing Smyrna GA",
    serviceName: "Pressure Washing",
    canonical: "/areas/smyrna-ga-pressure-washing",
    highlights: ["Smyrna", "Concrete", "Siding", "Patios", "Fences", "Bins"],
    sections: [
      {
        title: "Exterior Cleaning Nearby",
        body: "Request a quote for the surfaces that need attention and skip the ones that do not.",
      },
      {
        title: "Live Estimate",
        body: "The booking page shows a range while you choose services.",
      },
      {
        title: "Final Confirmation",
        body: "Final pricing is confirmed before service so there are no weird surprises.",
      },
    ],
    faqs: [
      {
        question: "Do you serve Smyrna?",
        answer: "Yes. Smyrna is part of the nearby service area when route timing works.",
      },
      {
        question: "Can I book from my phone?",
        answer: "Yes. The booking flow is mobile-first.",
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
