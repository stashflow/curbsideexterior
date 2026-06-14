import { z } from "zod";

export const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Please enter your name."),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number.")
    .transform((value) => value.replace(/\D/g, "")),
  email: z.string().email("Please enter a valid email address."),
  instagramHandle: z.string().optional().default(""),
  primaryService: z.enum([
    "pressure_washing",
    "trash_can_cleaning",
    "curb_number_painting",
  ]),
  frequency: z.enum(["one_time", "monthly"]),
  propertyType: z.enum([
    "single_family",
    "townhome",
    "rental",
    "hoa",
    "multi_unit",
    "other",
  ]),
  addressLine1: z.string().min(5, "Please enter the service address."),
  city: z.string().min(2, "Please enter the city."),
  state: z.string().length(2).transform((value) => value.toUpperCase()),
  zip: z.string().regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
  preferredDate: z.string().min(1, "Please choose a preferred date."),
  preferredTimeWindow: z.enum(["8-10", "10-12", "12-2", "2-4", "4-6"]),
  drivewaySqft: z.coerce.number().min(0).optional().default(0),
  walkwaySqft: z.coerce.number().min(0).optional().default(0),
  patioSqft: z.coerce.number().min(0).optional().default(0),
  houseSqft: z.coerce.number().min(0).optional().default(0),
  fenceLinearFeet: z.coerce.number().min(0).optional().default(0),
  binsCount: z.coerce.number().min(0).optional().default(0),
  heavyStainLevel: z.enum(["light", "moderate", "heavy"]).default("light"),
  gateCodeNeeded: z.boolean().default(false),
  gateCode: z.string().optional().default(""),
  notes: z.string().max(1000).optional().default(""),
  referralSource: z.string().max(120).optional().default(""),
  smsOptIn: z.boolean().default(true),
  emailOptIn: z.boolean().default(true),
  termsAccepted: z.literal(true, {
    message: "You must accept the terms to continue.",
  }),
  privacyAccepted: z.literal(true, {
    message: "You must accept the privacy policy to continue.",
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
