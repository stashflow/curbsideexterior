import zipcodes from "zipcodes";

import { BASE_ZIP } from "@/lib/business";

const NO_SURCHARGE_MILES = 12;
const SMALL_SURCHARGE_MILES = 20;
const MAX_SERVICE_MILES = 28;

export type ServiceAreaDecision =
  | {
      allowed: true;
      miles: number;
      travelSurcharge: number;
      message: string;
      city: string;
      state: string;
      serviceability: "core" | "extended";
    }
  | {
      allowed: false;
      miles: number | null;
      travelSurcharge: 0;
      message: string;
      city?: string;
      state?: string;
      serviceability: "outside";
    };

export function evaluateServiceArea(zip: string): ServiceAreaDecision {
  const details = zipcodes.lookup(zip);

  if (!details || details.state !== "GA") {
    return {
      allowed: false,
      miles: null,
      travelSurcharge: 0,
      message:
        "We currently serve select areas around Marietta, Georgia. Please double-check your ZIP code or contact us directly.",
      serviceability: "outside",
    };
  }

  const miles = zipcodes.distance(BASE_ZIP, zip);

  if (miles > MAX_SERVICE_MILES) {
    return {
      allowed: false,
      miles,
      travelSurcharge: 0,
      city: details.city,
      state: details.state,
      message:
        "Sorry, at this moment we do not serve your area. We want to keep scheduling reliable and avoid overpromising on travel time.",
      serviceability: "outside",
    };
  }

  if (miles > SMALL_SURCHARGE_MILES) {
    return {
      allowed: true,
      miles,
      travelSurcharge: 30,
      city: details.city,
      state: details.state,
      message:
        "You're a little outside our core route. Because gas prices and drive time are high right now, a $30 travel fee is included.",
      serviceability: "extended",
    };
  }

  if (miles > NO_SURCHARGE_MILES) {
    return {
      allowed: true,
      miles,
      travelSurcharge: 15,
      city: details.city,
      state: details.state,
      message:
        "You're outside our closest route, so a small $15 travel fee is included to help cover fuel and drive time.",
      serviceability: "extended",
    };
  }

  return {
    allowed: true,
    miles,
    travelSurcharge: 0,
    city: details.city,
    state: details.state,
    message: "Good news. You're inside our main service area, so there is no travel fee.",
    serviceability: "core",
  };
}
