export type MarketingCadence = "light" | "balanced" | "priority";

export type MarketingMessage = {
  month: number;
  subject: string;
  preview: string;
  headline: string;
  body: string;
  cta: string;
};

export const MARKETING_EMAIL_CALENDAR: MarketingMessage[] = [
  {
    month: 1,
    subject: "Start the year with a cleaner driveway",
    preview: "A simple exterior cleanup can sharpen the look of your home fast.",
    headline: "Start The Year Looking Clean",
    body: "If your driveway, walkway, or trash cans took a beating through the holidays, this is a good time to reset everything before spring ramps up.",
    cta: "Book your cleanup",
  },
  {
    month: 2,
    subject: "A quick curb appeal reset before spring",
    preview: "Late winter is a great time to knock out buildup before busy season.",
    headline: "Beat Spring Rush",
    body: "A simple cleanup now can help avoid heavier buildup later. If your concrete, siding, or bins need attention, this is a smart window to handle it.",
    cta: "Check pricing and timing",
  },
  {
    month: 3,
    subject: "Spring cleanup season is here",
    preview: "Driveways, walkways, patios, and bins tend to need attention right now.",
    headline: "Spring Cleanup Starts Here",
    body: "March is one of the easiest times to refresh curb appeal. If your property needs a cleaner look before events, guests, or HOA attention, now is a strong time to book.",
    cta: "Book spring service",
  },
  {
    month: 4,
    subject: "Freshen up the outside before summer",
    preview: "A cleaner exterior makes a home look sharper right away.",
    headline: "Make The Outside Look Sharp",
    body: "Pressure washing and trash can cleaning are both simple upgrades that make the property feel more put together without a big project.",
    cta: "Get your quote",
  },
  {
    month: 5,
    subject: "Keep the house looking ready for summer",
    preview: "This is a strong month for driveway, patio, and walkway cleaning.",
    headline: "Get Ready For Summer",
    body: "Before summer traffic, cookouts, and guests pick up, it helps to clean the surfaces people notice first.",
    cta: "See available times",
  },
  {
    month: 6,
    subject: "Easy summer curb appeal win",
    preview: "A clean driveway and fresh bins can make the whole property feel better kept.",
    headline: "Quick Summer Refresh",
    body: "If you want the home to look cleaner without a big renovation, exterior cleaning is one of the fastest upgrades you can make.",
    cta: "Book online",
  },
  {
    month: 7,
    subject: "Mid-summer cleanup for busy homes",
    preview: "A fast cleanup helps high-traffic areas feel maintained again.",
    headline: "Clean Up Mid-Summer Wear",
    body: "Summer can be hard on concrete, patios, and bins. A mid-season cleanup is a simple way to keep things from looking worn down.",
    cta: "Request service",
  },
  {
    month: 8,
    subject: "Back-to-routine cleanup before fall",
    preview: "A clean exterior is easier to maintain going into the next season.",
    headline: "Reset Before Fall",
    body: "As schedules settle down again, this is a good time to handle exterior cleaning before leaves, moisture, and cooler weather stack on top of it.",
    cta: "Plan your service",
  },
  {
    month: 9,
    subject: "A cleaner look heading into fall",
    preview: "Driveways, walkways, and bins are easier to stay ahead of right now.",
    headline: "Keep It Looking Maintained",
    body: "Early fall is a good time to take care of visible buildup while the weather is still favorable and schedules are easier to manage.",
    cta: "Check the booking page",
  },
  {
    month: 10,
    subject: "Fall curb appeal without the hassle",
    preview: "A simple cleanup now can keep the property looking neater going into the holidays.",
    headline: "Clean Up Before Holiday Season",
    body: "If family visits or neighborhood traffic matters to you, a fall exterior cleanup can make the home look more cared for without much effort on your end.",
    cta: "Get started",
  },
  {
    month: 11,
    subject: "A cleaner home before guests arrive",
    preview: "This is a good month for a final cleanup before colder weather and holiday visits.",
    headline: "Clean Before Company Comes Over",
    body: "For many homeowners, November is less about deep maintenance and more about making the property feel neat and ready for guests.",
    cta: "Book your spot",
  },
  {
    month: 12,
    subject: "Keep the property looking clean through the season",
    preview: "A simple cleanup now can help the house look sharper into the new year.",
    headline: "Finish The Year Clean",
    body: "If the outside of the home has gotten dingy through the year, a year-end cleanup can make the whole property feel more finished.",
    cta: "Schedule a cleanup",
  },
];

export function getMarketingCadenceGapDays(month: number, cadence: MarketingCadence = "balanced") {
  const balanced = [35, 35, 28, 28, 30, 35, 40, 40, 30, 28, 32, 45];
  const light = [49, 49, 35, 35, 40, 42, 49, 49, 40, 35, 40, 56];
  const priority = [28, 28, 21, 21, 24, 28, 30, 30, 24, 21, 24, 35];

  const source =
    cadence === "light" ? light : cadence === "priority" ? priority : balanced;

  return source[Math.max(0, Math.min(11, month - 1))];
}

export function getCampaignForMonth(month: number) {
  return MARKETING_EMAIL_CALENDAR.find((item) => item.month === month) ?? MARKETING_EMAIL_CALENDAR[0];
}

export function getNextMarketingSendAt({
  now = new Date(),
  lastSentAt,
  cadence = "balanced",
}: {
  now?: Date;
  lastSentAt?: Date | null;
  cadence?: MarketingCadence;
}) {
  const month = now.getMonth() + 1;
  const gapDays = getMarketingCadenceGapDays(month, cadence);
  const base = lastSentAt ?? now;
  return new Date(base.getTime() + gapDays * 24 * 60 * 60 * 1000);
}

export function getMarketingAlgorithmSummary() {
  return [
    "Send a welcome email right away after signup.",
    "After that, send only when the subscriber is still opted in and the next scheduled send date has arrived.",
    "Use shorter gaps during spring and early fall when exterior cleaning interest is strongest.",
    "Use longer gaps during winter and late summer so the list stays useful and does not feel spammy.",
    "Pause marketing immediately when a subscriber unsubscribes.",
  ];
}
