"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Droplets,
  LoaderCircle,
  SprayCan,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatServiceList } from "@/lib/format";
import {
  buildQuote,
  getTimeWindowLabel,
  type PrimaryService,
  type PropertyType,
  type TimeWindow,
} from "@/lib/pricing";
import {
  getBookableDaysForMonth,
  getNextBookableServiceDate,
  timeWindowOptions,
} from "@/lib/scheduling";

type StepId = "services" | "measurements" | "schedule" | "contact";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  instagramHandle: string;
  selectedServices: PrimaryService[];
  frequency: "one_time" | "monthly";
  propertyType: PropertyType;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  preferredMonth: string;
  preferredDay: string;
  preferredTimeWindow: TimeWindow;
  drivewaySize: string;
  walkwaySize: string;
  patioSize: string;
  houseWashSize: string;
  drivewaySqft: string;
  walkwaySqft: string;
  patioSqft: string;
  houseSqft: string;
  fenceLinearFeet: string;
  photoUrls: string[];
  binsCount: string;
  heavyStainLevel: "light" | "moderate" | "heavy";
  gateCodeNeeded: boolean;
  gateCode: string;
  notes: string;
  referralSource: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

const now = new Date();
const defaultDate = getNextBookableServiceDate(now, 3);

const initialState: FormState = {
  customerName: "",
  phone: "",
  email: "",
  instagramHandle: "",
  selectedServices: ["pressure_washing"],
  frequency: "one_time",
  propertyType: "single_family",
  addressLine1: "",
  city: "Marietta",
  state: "GA",
  zip: "",
  preferredMonth: String(defaultDate.getMonth() + 1),
  preferredDay: String(defaultDate.getDate()),
  preferredTimeWindow: "10-12",
  drivewaySize: "",
  walkwaySize: "",
  patioSize: "",
  houseWashSize: "",
  drivewaySqft: "",
  walkwaySqft: "",
  patioSqft: "",
  houseSqft: "",
  fenceLinearFeet: "",
  photoUrls: [],
  binsCount: "2",
  heavyStainLevel: "light",
  gateCodeNeeded: false,
  gateCode: "",
  notes: "",
  referralSource: "",
  smsOptIn: true,
  emailOptIn: true,
  termsAccepted: false,
  privacyAccepted: false,
};

const steps: Array<{
  id: StepId;
  number: string;
  title: string;
  body: string;
}> = [
  {
    id: "services",
    number: "01",
    title: "Choose services",
    body: "Pick what you want done and how the property is set up.",
  },
  {
    id: "measurements",
    number: "02",
    title: "Add measurements",
    body: "Enter only the surfaces that actually need cleaning.",
  },
  {
    id: "schedule",
    number: "03",
    title: "Pick timing",
    body: "We use your address and date to check the route and timing.",
  },
  {
    id: "contact",
    number: "04",
    title: "Finish request",
    body: "Add your contact info and approve the request details.",
  },
];

const serviceOptions = [
  {
    value: "pressure_washing",
    label: "Pressure Washing",
    body: "Driveway, walkways, patio, house wash, and fences.",
    icon: Droplets,
  },
  {
    value: "trash_can_cleaning",
    label: "Trash Can Cleaning",
    body: "One-time cleanings or recurring monthly service.",
    icon: Trash2,
  },
  {
    value: "curb_number_painting",
    label: "Curb Number Painting",
    body: "Get on the list now while this service is still coming soon.",
    icon: SprayCan,
  },
] as const;

type SizeOption = {
  value: string;
  label: string;
  sqft: number;
  image?: string;
};

const drivewaySizeOptions: SizeOption[] = [
  { value: "na", label: "No driveway", sqft: 0 },
  { value: "one_car", label: "1-car driveway", sqft: 300, image: "/driveway-size-1-car.png" },
  { value: "two_car", label: "2-car driveway", sqft: 600, image: "/driveway-size-2-car.png" },
  { value: "three_car", label: "3-car driveway", sqft: 900, image: "/driveway-size-3-car.png" },
  { value: "long", label: "Long driveway", sqft: 1200, image: "/driveway-size-long.png" },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const walkwaySizeOptions: SizeOption[] = [
  { value: "na", label: "No walkway", sqft: 0 },
  { value: "small", label: "Small walkway", sqft: 80 },
  { value: "medium", label: "Medium walkway", sqft: 150 },
  { value: "large", label: "Large walkway", sqft: 250 },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const patioSizeOptions: SizeOption[] = [
  { value: "na", label: "No patio", sqft: 0 },
  { value: "small", label: "Small patio", sqft: 150 },
  { value: "medium", label: "Medium patio", sqft: 300 },
  { value: "large", label: "Large patio", sqft: 500 },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const houseWashSizeOptions: SizeOption[] = [
  { value: "na", label: "No house wash", sqft: 0 },
  { value: "front", label: "Front only", sqft: 500 },
  { value: "back", label: "Back only", sqft: 500 },
  { value: "one_side", label: "One side", sqft: 400 },
  { value: "two_sides", label: "Two sides", sqft: 800 },
  { value: "full_house", label: "Full house", sqft: 1800 },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const panelMotion = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(6px)" },
};

function toNumber(value: string) {
  return Number(value || 0);
}

function getEstimateRange(total: number) {
  if (total <= 0) {
    return {
      low: 0,
      high: 0,
      label: "Add details",
    };
  }

  const low = Math.max(0, Math.round(total * 0.88));
  const high = Math.round(total * 1.12);

  return {
    low,
    high,
    label: `${formatCurrency(low)}-${formatCurrency(high)}`,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function inferPreferredYear(month: number, day: number) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const normalizedToday = new Date(currentYear, today.getMonth(), today.getDate());
  const candidate = new Date(currentYear, month - 1, day);

  if (candidate < normalizedToday) {
    return currentYear + 1;
  }

  return currentYear;
}

function buildPreferredDate(monthValue: string, dayValue: string) {
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!month || !day) {
    return "";
  }

  const year = inferPreferredYear(month, day);
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getDaysForMonth(monthValue: string, dayValue: string) {
  const month = Number(monthValue);
  if (!month) return [];

  const year = inferPreferredYear(month, Number(dayValue || 1));
  return getBookableDaysForMonth(year, month);
}

function formatFriendlyDate(monthValue: string, dayValue: string) {
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!month || !day) return "Choose a day";

  const year = inferPreferredYear(month, day);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SizeSelector({
  label,
  helper,
  value,
  options,
  onChange,
}: {
  label: string;
  helper?: string;
  value: string;
  options: SizeOption[];
  onChange: (option: SizeOption) => void;
}) {
  return (
    <section className="rounded-[1.15rem] border border-white/10 bg-black/25 p-3 sm:rounded-[1.5rem] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl font-black uppercase italic leading-none text-white sm:text-3xl">
            {label}
          </h3>
          {helper ? <p className="mt-2 text-sm leading-6 text-white/62">{helper}</p> : null}
        </div>
        <Camera className="mt-1 size-5 shrink-0 text-[#0B67F0]" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option)}
              className={`overflow-hidden rounded-[1.15rem] border text-left transition ${
                selected
                  ? "border-[#0B67F0] bg-[#0B67F0]/16 shadow-[0_0_30px_rgba(11,103,240,0.18)]"
                  : "border-white/10 bg-white/[0.03] hover:border-[#0B67F0]/70"
              }`}
              aria-pressed={selected}
            >
              {option.image ? (
                <div className="relative aspect-[16/9] w-full bg-black">
                  <Image src={option.image} alt="" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-contain" />
                </div>
              ) : null}
              <div className="flex min-h-12 items-center justify-between gap-2 px-3 py-2">
                <span className="text-xs font-black uppercase italic tracking-[0.06em] text-white sm:text-sm">
                  {option.label}
                </span>
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-[#0B67F0] bg-[#0B67F0]" : "border-white/20"
                  }`}
                >
                  {selected ? <Check className="size-3.5 text-white" /> : null}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function BookingForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [unavailableTimeWindows, setUnavailableTimeWindows] = useState<TimeWindow[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();

  const hasPressureWashing = form.selectedServices.includes("pressure_washing");
  const hasTrashCanCleaning = form.selectedServices.includes("trash_can_cleaning");

  const preferredDate = useMemo(
    () => buildPreferredDate(form.preferredMonth, form.preferredDay),
    [form.preferredMonth, form.preferredDay],
  );

  const availableDays = useMemo(
    () => getDaysForMonth(form.preferredMonth, form.preferredDay),
    [form.preferredMonth, form.preferredDay],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (!preferredDate) {
        setUnavailableTimeWindows([]);
        return;
      }

      setAvailabilityLoading(true);

      try {
        const response = await fetch(`/api/bookings/availability?date=${preferredDate}`);
        const data = (await response.json()) as { unavailable?: TimeWindow[] };

        if (!cancelled) {
          setUnavailableTimeWindows(data.unavailable ?? []);
        }
      } catch {
        if (!cancelled) {
          setUnavailableTimeWindows([]);
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [preferredDate]);

  const quote = useMemo(
    () =>
      buildQuote({
        selectedServices: form.selectedServices,
        frequency: form.frequency,
        propertyType: form.propertyType,
        zip: form.zip,
        drivewaySqft: toNumber(form.drivewaySqft),
        walkwaySqft: toNumber(form.walkwaySqft),
        patioSqft: toNumber(form.patioSqft),
        houseSqft: toNumber(form.houseSqft),
        fenceLinearFeet: toNumber(form.fenceLinearFeet),
        binsCount: toNumber(form.binsCount),
        gateCodeNeeded: form.gateCodeNeeded,
        heavyStainLevel: form.heavyStainLevel,
      }),
    [form],
  );

  const estimateRange = useMemo(() => getEstimateRange(quote.total), [quote.total]);
  const needsPhotoReview =
    form.drivewaySize === "not_sure" ||
    form.walkwaySize === "not_sure" ||
    form.patioSize === "not_sure" ||
    form.houseWashSize === "not_sure";
  const estimateLabel = quote.total > 0 ? estimateRange.label : needsPhotoReview ? "Photo review" : "Add details";
  const hasPressureWashingDetails =
    [
      toNumber(form.drivewaySqft),
      toNumber(form.walkwaySqft),
      toNumber(form.patioSqft),
      toNumber(form.houseSqft),
      toNumber(form.fenceLinearFeet),
    ].some((value) => value > 0) ||
    [form.drivewaySize, form.walkwaySize, form.patioSize, form.houseWashSize].some(
      (value) => value === "not_sure",
    ) ||
    form.photoUrls.length > 0;

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);
  const openTimeWindows = useMemo(
    () => timeWindowOptions.filter((window) => !unavailableTimeWindows.includes(window)),
    [unavailableTimeWindows],
  );
  const selectedTimeWindowUnavailable = unavailableTimeWindows.includes(form.preferredTimeWindow);

  const bookingButtonLabel =
    quote.paymentMode === "deposit"
      ? `Pay ${formatCurrency(quote.depositDue)} Deposit`
      : quote.paymentMode === "full"
        ? `Pay ${formatCurrency(quote.total)}`
        : "Send Request";
  const paymentPreview =
    quote.total <= 0
      ? "No payment yet"
      : quote.paymentMode === "deposit"
        ? `Today: ${formatCurrency(quote.depositDue)} deposit`
        : quote.paymentMode === "full"
          ? `Today: ${formatCurrency(quote.total)}`
          : "Reviewed before payment";
  const isLastStep = currentStep === steps.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSize(
    sizeKey: "drivewaySize" | "walkwaySize" | "patioSize" | "houseWashSize",
    sqftKey: "drivewaySqft" | "walkwaySqft" | "patioSqft" | "houseSqft",
    option: SizeOption,
  ) {
    setForm((current) => ({
      ...current,
      [sizeKey]: option.value,
      [sqftKey]: option.sqft > 0 ? String(option.sqft) : "",
    }));
  }

  function removePhoto(url: string) {
    setForm((current) => ({
      ...current,
      photoUrls: current.photoUrls.filter((photoUrl) => photoUrl !== url),
    }));
  }

  function handlePhotoUpload(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []).slice(0, 8 - form.photoUrls.length);
    if (selectedFiles.length === 0) return;

    setUploadError("");
    setUploadProgress(1);

    startUploadTransition(async () => {
      try {
        const uploadedUrls: string[] = [];

        for (const file of selectedFiles) {
          if (!file.type.startsWith("image/")) {
            throw new Error("Only image uploads are supported.");
          }

          if (file.size > 8 * 1024 * 1024) {
            throw new Error("Each photo must be 8 MB or smaller.");
          }

          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          const blob = await upload(`booking-photos/${Date.now()}-${safeName}`, file, {
            access: "public",
            handleUploadUrl: "/api/uploads",
            contentType: file.type,
            onUploadProgress: ({ percentage }) => setUploadProgress(Math.max(1, percentage)),
          });

          uploadedUrls.push(blob.url);
        }

        setForm((current) => ({
          ...current,
          photoUrls: [...current.photoUrls, ...uploadedUrls].slice(0, 8),
        }));
        setUploadProgress(0);
      } catch (uploadFailure) {
        setUploadProgress(0);
        setUploadError(
          uploadFailure instanceof Error
            ? uploadFailure.message
            : "Photo upload failed. You can still DM photos on Instagram.",
        );
      }
    });
  }

  function toggleService(service: PrimaryService) {
    setForm((current) => {
      const exists = current.selectedServices.includes(service);
      const selectedServices = exists
        ? current.selectedServices.filter((item) => item !== service)
        : [...current.selectedServices, service];

      return {
        ...current,
        selectedServices: selectedServices.length > 0 ? selectedServices : current.selectedServices,
        frequency:
          !selectedServices.includes("trash_can_cleaning") && current.frequency === "monthly"
            ? "one_time"
            : current.frequency,
      };
    });
  }

  function validateStep(index: number) {
    if (index === 0) {
      if (form.selectedServices.length === 0) {
        setError("Pick at least one service to continue.");
        return false;
      }
      return true;
    }

    if (index === 1) {
      if (
        hasPressureWashing &&
        !hasPressureWashingDetails
      ) {
        setError("For pressure washing, choose at least one surface or upload photos.");
        return false;
      }

      if (hasTrashCanCleaning && toNumber(form.binsCount) < 1) {
        setError("Enter how many trash cans you want cleaned.");
        return false;
      }

      return true;
    }

    if (index === 2) {
      if (!form.addressLine1 || !form.city || form.state.length !== 2 || !/^\d{5}$/.test(form.zip)) {
        setError("Enter a full service address with a valid 5-digit ZIP code.");
        return false;
      }

      if (!preferredDate) {
        setError("Choose a preferred month and day.");
        return false;
      }

      if (unavailableTimeWindows.includes(form.preferredTimeWindow)) {
        setError("That time is already booked. Pick another available time.");
        return false;
      }

      return true;
    }

    if (index === 3) {
      if (!form.customerName || !form.phone || !form.email) {
        setError("Add your name, phone, and email so we can confirm the request.");
        return false;
      }

      if (!form.termsAccepted || !form.privacyAccepted) {
        setError("Please accept the terms and privacy policy to continue.");
        return false;
      }
    }

    return true;
  }

  function goNext() {
    setError("");
    if (!validateStep(currentStep)) return;
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setError("");
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    for (let index = 0; index < steps.length; index += 1) {
      if (!validateStep(index)) {
        setCurrentStep(index);
        return;
      }
    }

    startTransition(async () => {
      const response = await fetch("/api/bookings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      window.location.href = `/book/success?booking=${data.bookingId}`;
    });
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl overflow-x-hidden bg-black px-3 pb-28 pt-[7.25rem] text-white sm:px-6 sm:pb-10 sm:pt-[7.75rem] lg:px-8">
      <div className="grid gap-5 lg:gap-6">
        <div>
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="fixed inset-x-0 top-0 z-50 border-b border-[#0B67F0]/40 bg-black/96 px-3 pt-[calc(env(safe-area-inset-top)+0.5rem)] shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:px-6">
              <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" className="hidden h-10 px-4 sm:inline-flex">
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 px-3"
                  onClick={goBack}
                  disabled={currentStep === 0 || isPending}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-lg font-black uppercase italic leading-none text-white sm:text-2xl">
                        {currentStep + 1}/{steps.length} {steps[currentStep].title}
                      </p>
                      <p className="truncate text-[10px] font-bold uppercase italic tracking-[0.08em] text-white/58 sm:text-[11px]">
                        {paymentPreview} • Final price confirmed
                      </p>
                    </div>
                    <div className="shrink-0 rounded-2xl border border-[#0B67F0]/70 bg-[#0B67F0]/18 px-3 py-2 text-right shadow-[0_0_24px_rgba(11,103,240,0.25)]">
                      <p className="text-[9px] font-black uppercase italic tracking-[0.12em] text-white/62">
                        Live estimate
                      </p>
                      <p className="mt-0.5 whitespace-nowrap font-heading text-xl font-black uppercase italic leading-none text-white sm:text-2xl">
                        {estimateLabel}
                      </p>
                    </div>
                  </div>
                </div>
                {isLastStep ? (
                  <Button type="submit" className="hidden h-10 px-4 sm:inline-flex" disabled={isPending}>
                    {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    Send
                  </Button>
                ) : (
                  <Button type="button" className="hidden h-10 px-4 sm:inline-flex" onClick={goNext}>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-[#0B67F0]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-3 sm:rounded-[1.75rem] sm:p-5">
              <p className="mb-3 text-sm leading-6 text-white/66">{steps[currentStep].body}</p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[currentStep].id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={panelMotion}
                  transition={{ duration: 0.28 }}
                  className="mt-5 sm:mt-8"
                >
                  {steps[currentStep].id === "services" ? (
                    <div className="space-y-6">
                      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                        {serviceOptions.map((option) => {
                          const selected = form.selectedServices.includes(option.value);

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => toggleService(option.value)}
                              className={`rounded-[1.25rem] border p-4 text-left transition sm:rounded-[1.7rem] sm:p-5 ${
                                selected
                                  ? "border-[#0B67F0]/40 bg-[#0B67F0]/10 shadow-[0_0_40px_rgba(11,103,240,0.12)]"
                                  : "border-white/10 bg-black/20 hover:border-white/20"
                              }`}
                              aria-pressed={selected}
                            >
                              <option.icon className="size-6 text-[#0B67F0]" />
                              <p className="mt-3 font-heading text-[1.35rem] font-black uppercase leading-none text-white sm:mt-4 sm:text-2xl">
                                {option.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{option.body}</p>
                              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#BFD7FF]">
                                {selected ? "Selected" : "Tap to add"}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Property type</span>
                          <select
                            value={form.propertyType}
                            onChange={(event) => update("propertyType", event.target.value as PropertyType)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          >
                            <option value="single_family">Single-family home</option>
                            <option value="townhome">Townhome</option>
                            <option value="rental">Rental property</option>
                            <option value="hoa">HOA / community</option>
                            <option value="multi_unit">Multi-unit property</option>
                            <option value="other">Other</option>
                          </select>
                        </label>

                        {hasTrashCanCleaning ? (
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-200">
                              Trash can cleaning frequency
                            </span>
                            <select
                              value={form.frequency}
                              onChange={(event) =>
                                update("frequency", event.target.value as "one_time" | "monthly")
                              }
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            >
                              <option value="one_time">One-time service</option>
                              <option value="monthly">Monthly service</option>
                            </select>
                          </label>
                        ) : (
                          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                            Combine services in one request if you want. We will keep the next step
                            focused only on the surfaces that really need to be cleaned.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {steps[currentStep].id === "measurements" ? (
                    <div className="space-y-3 sm:space-y-4">
                      {hasPressureWashing ? (
                        <div className="grid gap-3 sm:gap-4">
                          <SizeSelector
                            label="Driveway size"
                            helper="Closest option is fine. We confirm before charging."
                            value={form.drivewaySize}
                            options={drivewaySizeOptions}
                            onChange={(option) => updateSize("drivewaySize", "drivewaySqft", option)}
                          />

                          <div className="grid gap-3 lg:grid-cols-2">
                            <SizeSelector
                              label="Walkway size"
                              value={form.walkwaySize}
                              options={walkwaySizeOptions}
                              onChange={(option) => updateSize("walkwaySize", "walkwaySqft", option)}
                            />
                            <SizeSelector
                              label="Patio size"
                              value={form.patioSize}
                              options={patioSizeOptions}
                              onChange={(option) => updateSize("patioSize", "patioSqft", option)}
                            />
                          </div>

                          <SizeSelector
                            label="House area"
                            helper="Only choose siding areas that need cleaning."
                            value={form.houseWashSize}
                            options={houseWashSizeOptions}
                            onChange={(option) => updateSize("houseWashSize", "houseSqft", option)}
                          />

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2 rounded-[1.15rem] border border-white/10 bg-black/25 p-3">
                              <span className="font-heading text-2xl font-black uppercase italic leading-none text-white">
                                Fence
                              </span>
                              <span className="block text-sm leading-6 text-white/62">
                                Most panels are 6-8 feet.
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => update("fenceLinearFeet", "")}
                                  className={`rounded-2xl border px-3 py-3 text-xs font-black uppercase italic tracking-[0.06em] transition ${
                                    !toNumber(form.fenceLinearFeet)
                                      ? "border-[#0B67F0] bg-[#0B67F0]/16 text-white"
                                      : "border-white/10 bg-white/[0.03] text-white/70"
                                  }`}
                                  aria-pressed={!toNumber(form.fenceLinearFeet)}
                                >
                                  No fence
                                </button>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                                  <span className="block text-[10px] font-bold uppercase italic tracking-[0.08em] text-white/48">
                                    Linear feet
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={form.fenceLinearFeet}
                                    onChange={(event) => update("fenceLinearFeet", event.target.value)}
                                    placeholder="80"
                                    className="mt-1 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                                  />
                                </div>
                              </div>
                            </div>
                            <label className="space-y-2 rounded-[1.15rem] border border-white/10 bg-black/25 p-3">
                              <span className="font-heading text-2xl font-black uppercase italic leading-none text-white">
                                Stains
                              </span>
                              <span className="block text-sm leading-6 text-white/62">
                                Pick what looks closest.
                              </span>
                            <select
                              value={form.heavyStainLevel}
                              onChange={(event) =>
                                update(
                                  "heavyStainLevel",
                                  event.target.value as "light" | "moderate" | "heavy",
                                )
                              }
                              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            >
                              <option value="light">Light dirt</option>
                              <option value="moderate">Moderate buildup</option>
                              <option value="heavy">Heavy stains or deep buildup</option>
                            </select>
                            </label>
                          </div>

                          <div className="rounded-[1.15rem] border border-dashed border-[#0B67F0]/55 bg-[#0B67F0]/8 p-3 sm:rounded-[1.5rem] sm:p-4">
                            <div className="flex items-start gap-3">
                              <UploadCloud className="mt-1 size-6 shrink-0 text-[#0B67F0]" />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                                  Not sure?
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-white/72">
                                  Upload a photo or enter your address and we’ll estimate the size for you.
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                              <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#126DFF] bg-[#0B67F0] px-6 py-3 text-sm font-bold uppercase italic tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(0,82,220,0.24)] transition hover:bg-[#0A5CDF]">
                                <UploadCloud className="size-4" />
                                Upload photos
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="sr-only"
                                  onChange={(event) => handlePhotoUpload(event.target.files)}
                                  disabled={isUploading || form.photoUrls.length >= 8}
                                />
                              </label>
                              <p className="text-xs font-bold uppercase italic tracking-[0.08em] text-white/60">
                                {isUploading ? `Uploading ${uploadProgress}%` : `${form.photoUrls.length}/8 photos added`}
                              </p>
                            </div>
                            {uploadError ? (
                              <p className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                                {uploadError}
                              </p>
                            ) : null}
                            {form.photoUrls.length > 0 ? (
                              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {form.photoUrls.map((url, index) => (
                                  <div
                                    key={url}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2"
                                  >
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="truncate text-sm text-white/88 underline"
                                    >
                                      Photo {index + 1}
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => removePhoto(url)}
                                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70"
                                      aria-label={`Remove photo ${index + 1}`}
                                    >
                                      <X className="size-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {hasTrashCanCleaning ? (
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-200">Number of bins</span>
                            <input
                              type="number"
                              min="1"
                              value={form.binsCount}
                              onChange={(event) => update("binsCount", event.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            />
                          </label>
                          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                            Clear pricing: 1 bin is $30. Two or more bins are $35 total.
                            Monthly service is reviewed before it is confirmed.
                          </div>
                        </div>
                      ) : null}

                      {!hasPressureWashing && !hasTrashCanCleaning ? (
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                          No measurements are needed for this step. You can continue.
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {steps[currentStep].id === "schedule" ? (
                    <div className="space-y-5 sm:space-y-6">
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <label className="space-y-2 sm:col-span-2">
                          <span className="text-sm font-medium text-slate-200">Street address</span>
                          <input
                            value={form.addressLine1}
                            onChange={(event) => update("addressLine1", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">City</span>
                          <input
                            value={form.city}
                            onChange={(event) => update("city", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">State</span>
                          <input
                            value={form.state}
                            onChange={(event) => update("state", event.target.value.toUpperCase())}
                            maxLength={2}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">ZIP code</span>
                          <input
                            value={form.zip}
                            onChange={(event) => update("zip", event.target.value)}
                            maxLength={5}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                          We figure out the year automatically, so you only need to pick the month
                          and day. Sundays are skipped because we are closed.
                        </div>
                      </div>

                      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Preferred month</span>
                          <select
                            value={form.preferredMonth}
                            onChange={(event) => {
                              const nextMonth = event.target.value;
                              const nextDays = getDaysForMonth(nextMonth, form.preferredDay);
                              update("preferredMonth", nextMonth);
                              if (!nextDays.includes(Number(form.preferredDay))) {
                                update("preferredDay", String(nextDays[0] ?? ""));
                              }
                            }}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          >
                            {monthOptions.map((month, index) => (
                              <option key={month} value={index + 1}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Preferred day</span>
                          <select
                            value={form.preferredDay}
                            onChange={(event) => update("preferredDay", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          >
                            {availableDays.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Time window</span>
                          <select
                            value={selectedTimeWindowUnavailable ? "" : form.preferredTimeWindow}
                            onChange={(event) =>
                              update("preferredTimeWindow", event.target.value as TimeWindow)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          >
                            {selectedTimeWindowUnavailable ? (
                              <option value="" disabled>
                                Choose an available time
                              </option>
                            ) : null}
                            {timeWindowOptions.map((window) => {
                              const unavailable = unavailableTimeWindows.includes(window);

                              return (
                                <option key={window} value={window} disabled={unavailable}>
                                  {getTimeWindowLabel(window)}
                                  {unavailable ? " - booked" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </label>
                      </div>

                      {availabilityLoading ? (
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/70">
                          Checking available times...
                        </div>
                      ) : null}

                      {!availabilityLoading && openTimeWindows.length === 0 ? (
                        <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                          This day is unavailable. Pick another day.
                        </div>
                      ) : null}

                      {!availabilityLoading && selectedTimeWindowUnavailable && openTimeWindows.length > 0 ? (
                        <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
                          That time is booked. Choose one of the open times.
                        </div>
                      ) : null}

                      <div className="rounded-2xl border border-[#0B67F0]/16 bg-[#0B67F0]/8 px-4 py-4 text-sm leading-6 text-[#BFD7FF]">
                        Preferred visit:{" "}
                        <strong>
                          {formatFriendlyDate(form.preferredMonth, form.preferredDay)} at{" "}
                          {getTimeWindowLabel(form.preferredTimeWindow)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={form.gateCodeNeeded}
                          onChange={(event) => update("gateCodeNeeded", event.target.checked)}
                          className="size-4 rounded border-white/20 bg-transparent"
                        />
                        <span className="text-sm text-white/88">
                          This property has a gate or needs special access instructions.
                        </span>
                      </div>

                      {form.gateCodeNeeded ? (
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-slate-200">
                            Gate code or access instructions
                          </span>
                          <input
                            value={form.gateCode}
                            onChange={(event) => update("gateCode", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          />
                        </label>
                      ) : null}
                    </div>
                  ) : null}

                  {steps[currentStep].id === "contact" ? (
                    <div className="space-y-5 sm:space-y-6">
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Full name</span>
                          <input
                            value={form.customerName}
                            onChange={(event) => update("customerName", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Phone</span>
                          <input
                            value={form.phone}
                            onChange={(event) => update("phone", event.target.value)}
                            placeholder="678-709-6690"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Email</span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) => update("email", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">
                            Instagram handle (optional)
                          </span>
                          <input
                            value={form.instagramHandle}
                            onChange={(event) => update("instagramHandle", event.target.value)}
                            placeholder="@yourhandle"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 sm:gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">
                            Anything we should know?
                          </span>
                          <textarea
                            value={form.notes}
                            onChange={(event) => update("notes", event.target.value)}
                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            placeholder="Steep driveway, HOA limits, pets in yard, strong bin odor, or anything else that helps."
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">
                            How did you hear about us?
                          </span>
                          <input
                            value={form.referralSource}
                            onChange={(event) => update("referralSource", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                            placeholder="Google, Instagram, a neighbor, HOA, a sign, or something else"
                          />
                        </label>
                      </div>

                      <div className="rounded-[1.35rem] border border-white/8 bg-black/20 p-4 sm:rounded-[1.6rem] sm:p-5">
                        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                          Request summary
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[
                            ["Services", formatServiceList(form.selectedServices)],
                            ["Property type", form.propertyType.replaceAll("_", " ")],
                            ["Preferred visit", formatFriendlyDate(form.preferredMonth, form.preferredDay)],
                            ["Time window", getTimeWindowLabel(form.preferredTimeWindow)],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                            >
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                                {label}
                              </p>
                              <p className="mt-2 text-sm text-white/92">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 rounded-[1.35rem] border border-white/8 bg-black/20 p-4 sm:rounded-[1.6rem] sm:p-5">
                        <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                          <input
                            type="checkbox"
                            checked={form.smsOptIn}
                            onChange={(event) => update("smsOptIn", event.target.checked)}
                            className="mt-1 size-4 rounded border-white/20 bg-transparent"
                          />
                          I agree to get service texts about scheduling, reminders, and job updates.
                        </label>
                        <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                          <input
                            type="checkbox"
                            checked={form.emailOptIn}
                            onChange={(event) => update("emailOptIn", event.target.checked)}
                            className="mt-1 size-4 rounded border-white/20 bg-transparent"
                          />
                          I agree to get quote and service emails.
                        </label>
                        <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                          <input
                            type="checkbox"
                            checked={form.termsAccepted}
                            onChange={(event) => update("termsAccepted", event.target.checked)}
                            className="mt-1 size-4 rounded border-white/20 bg-transparent"
                            required
                          />
                          I agree to the{" "}
                          <Link href="/terms" className="text-[#0B67F0] underline">
                            terms of service
                          </Link>
                          .
                        </label>
                        <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                          <input
                            type="checkbox"
                            checked={form.privacyAccepted}
                            onChange={(event) => update("privacyAccepted", event.target.checked)}
                            className="mt-1 size-4 rounded border-white/20 bg-transparent"
                            required
                          />
                          I agree to the{" "}
                          <Link href="/privacy" className="text-[#0B67F0] underline">
                            privacy policy
                          </Link>
                          .
                        </label>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

          </form>
        </div>
      </div>

      <div className="mobile-fixed-cta inset-x-0 bottom-0 z-50 border-t border-[#0B67F0]/30 bg-black/96 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-12 flex-1"
            onClick={goBack}
            disabled={currentStep === 0 || isPending}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          {isLastStep ? (
            <Button type="submit" form="booking-form" size="lg" className="h-12 flex-[1.35]" disabled={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {bookingButtonLabel}
            </Button>
          ) : (
            <Button type="button" size="lg" className="h-12 flex-[1.35]" onClick={goNext}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
