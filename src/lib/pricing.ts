import { evaluateServiceArea } from "@/lib/service-area";

export type FrequencyOption = "one_time" | "monthly";
export type PrimaryService =
  | "pressure_washing"
  | "trash_can_cleaning"
  | "curb_number_painting";
export type PropertyType =
  | "single_family"
  | "townhome"
  | "rental"
  | "hoa"
  | "multi_unit"
  | "other";
export type TimeWindow = "8-10" | "10-12" | "12-2" | "2-4" | "4-6";

export interface QuoteInput {
  primaryService: PrimaryService;
  frequency: FrequencyOption;
  propertyType: PropertyType;
  zip: string;
  drivewaySqft?: number;
  walkwaySqft?: number;
  patioSqft?: number;
  houseSqft?: number;
  fenceLinearFeet?: number;
  binsCount?: number;
  gateCodeNeeded?: boolean;
  heavyStainLevel?: "light" | "moderate" | "heavy";
}

export interface QuoteLineItem {
  label: string;
  amount: number;
  note?: string;
}

export interface QuoteResult {
  subtotal: number;
  total: number;
  depositDue: number;
  paymentMode: "deposit" | "full" | "manual_confirmation" | "lead_only";
  lineItems: QuoteLineItem[];
  serviceArea: ReturnType<typeof evaluateServiceArea>;
  summary: string;
  disclaimer: string;
  manualReview: boolean;
}

function drivewayPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  if (squareFeet <= 1000) return 149;
  if (squareFeet <= 1500) return 209;
  if (squareFeet <= 2000) return 269;

  const extraUnits = Math.ceil((squareFeet - 2000) / 500);
  return 269 + extraUnits * 55;
}

function walkwayPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  if (squareFeet <= 150) return 59;
  if (squareFeet <= 300) return 89;
  if (squareFeet <= 500) return 119;
  return 119 + Math.ceil((squareFeet - 500) / 150) * 30;
}

function patioPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  if (squareFeet <= 250) return 89;
  if (squareFeet <= 500) return 149;
  if (squareFeet <= 750) return 199;
  return 199 + Math.ceil((squareFeet - 750) / 250) * 45;
}

function houseWashPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  if (squareFeet <= 2000) return 249;
  if (squareFeet <= 3000) return 329;
  if (squareFeet <= 4000) return 409;
  return 409 + Math.ceil((squareFeet - 4000) / 500) * 50;
}

function fencePrice(linearFeet = 0) {
  if (linearFeet <= 0) return 0;
  if (linearFeet <= 100) return 179;
  if (linearFeet <= 200) return 319;
  return 319 + Math.ceil((linearFeet - 200) / 50) * 45;
}

function trashCanOneTimePrice(binCount = 1) {
  if (binCount <= 1) return 35;
  if (binCount === 2) return 49;
  return 49 + (binCount - 2) * 12;
}

function trashCanMonthlyEstimate(binCount = 1) {
  if (binCount <= 1) return 20;
  if (binCount === 2) return 25;
  return 25 + (binCount - 2) * 8;
}

export function getTimeWindowLabel(window: TimeWindow) {
  const labels: Record<TimeWindow, string> = {
    "8-10": "8:00 AM - 10:00 AM",
    "10-12": "10:00 AM - 12:00 PM",
    "12-2": "12:00 PM - 2:00 PM",
    "2-4": "2:00 PM - 4:00 PM",
    "4-6": "4:00 PM - 6:00 PM",
  };

  return labels[window];
}

export function buildQuote(input: QuoteInput): QuoteResult {
  const serviceArea = evaluateServiceArea(input.zip);

  if (!serviceArea.allowed) {
    return {
      subtotal: 0,
      total: 0,
      depositDue: 0,
      paymentMode: "lead_only",
      lineItems: [],
      serviceArea,
      summary: serviceArea.message,
      disclaimer:
        "If you think your address should qualify, contact us directly and we can review it manually.",
      manualReview: true,
    };
  }

  const lineItems: QuoteLineItem[] = [];
  let subtotal = 0;
  let paymentMode: QuoteResult["paymentMode"] = "deposit";
  let depositDue = 0;
  let manualReview = false;
  let summary = "";

  if (input.primaryService === "pressure_washing") {
    const driveway = drivewayPrice(input.drivewaySqft);
    const walkway = walkwayPrice(input.walkwaySqft);
    const patio = patioPrice(input.patioSqft);
    const houseWash = houseWashPrice(input.houseSqft);
    const fence = fencePrice(input.fenceLinearFeet);

    if (driveway > 0) lineItems.push({ label: "Driveway cleaning", amount: driveway });
    if (walkway > 0) lineItems.push({ label: "Walkway cleaning", amount: walkway });
    if (patio > 0) lineItems.push({ label: "Patio cleaning", amount: patio });
    if (houseWash > 0) lineItems.push({ label: "House wash", amount: houseWash });
    if (fence > 0) lineItems.push({ label: "Fence cleaning", amount: fence });

    subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

    if (subtotal === 0) {
      manualReview = true;
      lineItems.push({
        label: "Custom pressure washing review",
        amount: 0,
        note: "We need a manual review because no pressure washing areas were selected.",
      });
    }

    if (input.heavyStainLevel === "heavy") {
      lineItems.push({
        label: "Deep stain treatment allowance",
        amount: 35,
        note: "Applied when oil, rust, or significant buildup is present.",
      });
      subtotal += 35;
    }

    paymentMode = "deposit";
    depositDue = subtotal >= 300 ? 100 : 50;
    summary = "Estimated pressure washing total";
  }

  if (input.primaryService === "trash_can_cleaning") {
    const bins = Math.max(1, input.binsCount ?? 1);

    if (input.frequency === "monthly") {
      const estimate = trashCanMonthlyEstimate(bins);
      lineItems.push({
        label: `Monthly trash can cleaning (${bins} bin${bins > 1 ? "s" : ""})`,
        amount: estimate,
        note: "Manual confirmation required before scheduling recurring service.",
      });
      subtotal = estimate;
      paymentMode = "manual_confirmation";
      depositDue = 0;
      manualReview = true;
      summary = "Estimated monthly service price";
    } else {
      const oneTime = trashCanOneTimePrice(bins);
      lineItems.push({
        label: `One-time trash can cleaning (${bins} bin${bins > 1 ? "s" : ""})`,
        amount: oneTime,
      });
      subtotal = oneTime;
      paymentMode = "full";
      depositDue = oneTime;
      summary = "One-time trash can cleaning total";
    }
  }

  if (input.primaryService === "curb_number_painting") {
    lineItems.push({
      label: "Curb number painting interest",
      amount: 0,
      note: "Coming soon. We will contact you once this service opens.",
    });
    subtotal = 0;
    paymentMode = "lead_only";
    depositDue = 0;
    manualReview = true;
    summary = "Curb number painting interest captured";
  }

  if (serviceArea.travelSurcharge > 0) {
    lineItems.push({
      label: "Travel surcharge",
      amount: serviceArea.travelSurcharge,
      note: "Applied for addresses outside our closest service route because fuel and drive time are high right now.",
    });
    subtotal += serviceArea.travelSurcharge;
  }

  return {
    subtotal,
    total: subtotal,
    depositDue,
    paymentMode,
    lineItems,
    serviceArea,
    summary,
    disclaimer:
      "Final pricing is confirmed after we review the full job details. Deposits reserve time on the schedule but do not waive the right to adjust for inaccurate measurements, unsafe access, or undisclosed surface conditions.",
    manualReview,
  };
}
