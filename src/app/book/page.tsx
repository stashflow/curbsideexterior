import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/booking-form";

export const metadata: Metadata = {
  title: "Book Pressure Washing In Marietta | CURBSIDE EXTERIOR CO.",
  description:
    "Get a fast online estimate and book pressure washing, house washing, driveway cleaning, patio cleaning, fence cleaning, or trash can cleaning in Marietta and nearby areas.",
  alternates: {
    canonical: "/book",
  },
};

export default function BookPage() {
  return <BookingForm />;
}
