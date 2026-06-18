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
  selectedServices: PrimaryService[];
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
  selectedServices: PrimaryService[];
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
  return Math.max(129, Math.round(squareFeet * 0.22));
}

function walkwayPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  return Math.max(49, Math.round(squareFeet * 0.2));
}

function patioPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  return Math.max(99, Math.round(squareFeet * 0.32));
}

function houseWashPrice(squareFeet = 0) {
  if (squareFeet <= 0) return 0;
  return Math.max(149, Math.round(squareFeet * 0.12));
}

function fencePrice(linearFeet = 0) {
  if (linearFeet <= 0) return 0;
  return Math.max(119, Math.round(linearFeet * 1.65));
}

function trashCanOneTimePrice(binCount = 1) {
  if (binCount <= 1) return 30;
  return 35;
}

function trashCanMonthlyEstimate(binCount = 1) {
  if (binCount <= 1) return 30;
  return 35;
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
  const selectedServices = Array.from(new Set(input.selectedServices));

  if (!serviceArea.allowed) {
    return {
      selectedServices,
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
  const hasPressureWashing = selectedServices.includes("pressure_washing");
  const hasTrashCanCleaning = selectedServices.includes("trash_can_cleaning");
  const hasCurbNumberPainting = selectedServices.includes("curb_number_painting");

  if (hasPressureWashing) {
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
        note: "Enter only the surfaces that actually need cleaning so the estimate stays accurate.",
      });
    }

    if (input.heavyStainLevel === "moderate") {
      const moderateSurcharge = Math.round(subtotal * 0.06);
      lineItems.push({
        label: "Extra buildup treatment",
        amount: moderateSurcharge,
        note: "Small increase for heavier-than-normal mildew or grime.",
      });
      subtotal += moderateSurcharge;
    }

    if (input.heavyStainLevel === "heavy") {
      const heavySurcharge = Math.round(subtotal * 0.12);
      lineItems.push({
        label: "Heavy stain treatment allowance",
        amount: heavySurcharge,
        note: "Used when oil, rust, red clay, or major buildup will likely need extra treatment.",
      });
      subtotal += heavySurcharge;
    }
  }

  if (hasTrashCanCleaning) {
    const bins = Math.max(1, input.binsCount ?? 1);

    if (input.frequency === "monthly") {
      const estimate = trashCanMonthlyEstimate(bins);
      lineItems.push({
        label: `Monthly trash can cleaning (${bins} bin${bins > 1 ? "s" : ""})`,
        amount: estimate,
        note: "Transparent bin pricing: 1 bin is $30, 2+ bins are $35. Monthly service is reviewed before it is put on the schedule.",
      });
      subtotal += estimate;
      manualReview = true;
    } else {
      const oneTime = trashCanOneTimePrice(bins);
      lineItems.push({
        label: `One-time trash can cleaning (${bins} bin${bins > 1 ? "s" : ""})`,
        amount: oneTime,
        note: "Transparent bin pricing: 1 bin is $30, 2+ bins are $35.",
      });
      subtotal += oneTime;
    }
  }

  if (hasCurbNumberPainting) {
    lineItems.push({
      label: "Curb number painting interest",
      amount: 0,
      note: "Coming soon. We will contact you once this service opens.",
    });
    manualReview = true;
  }

  if (serviceArea.travelSurcharge > 0) {
    lineItems.push({
      label: "Travel surcharge",
      amount: serviceArea.travelSurcharge,
      note: "Applied for addresses outside our closest service route because fuel and drive time are high right now.",
    });
    subtotal += serviceArea.travelSurcharge;
  }

  if (subtotal <= 0) {
    paymentMode = "lead_only";
    depositDue = 0;
  } else if (manualReview) {
    paymentMode = "manual_confirmation";
    depositDue = 0;
  } else if (hasPressureWashing) {
    paymentMode = "deposit";
    depositDue = subtotal >= 300 ? 100 : 50;
  } else {
    paymentMode = "full";
    depositDue = subtotal;
  }

  if (selectedServices.length === 1 && hasPressureWashing) {
    summary = "Estimated pressure washing total";
  } else if (selectedServices.length === 1 && hasTrashCanCleaning && input.frequency === "monthly") {
    summary = "Estimated monthly service price";
  } else if (selectedServices.length === 1 && hasTrashCanCleaning) {
    summary = "One-time trash can cleaning total";
  } else if (selectedServices.length === 1 && hasCurbNumberPainting) {
    summary = "Curb number painting interest captured";
  } else {
    summary = "Estimated total for selected services";
  }

  return {
    selectedServices,
    subtotal,
    total: subtotal,
    depositDue,
    paymentMode,
    lineItems,
    serviceArea,
    summary,
    disclaimer:
      "This estimate is based on the surfaces and measurements entered here. Only include the parts that actually need cleaning. Final pricing can change if the measurements are off, access is limited, or the condition is very different in person.",
    manualReview,
  };
}
