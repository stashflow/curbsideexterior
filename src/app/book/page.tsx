import type { Metadata } from "next";

import { BookingForm } from "@/components/booking/booking-form";

export const metadata: Metadata = {
  title: "Book Service | CURBSIDE EXTERIOR CO.",
  description:
    "Book pressure washing, trash can cleaning, or request curb number painting with CURBSIDE EXTERIOR CO.",
};

export default function BookPage() {
  return <BookingForm />;
}
