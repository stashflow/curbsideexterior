"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  LoaderCircle,
  Lock,
  MapPinned,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_NAME,
  PAYMENT_OPERATOR_NAME,
} from "@/lib/business";
import { formatCurrency, formatServiceList } from "@/lib/format";
import {
  buildQuote,
  getTimeWindowLabel,
  type PrimaryService,
  type PropertyType,
  type TimeWindow,
} from "@/lib/pricing";

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
const defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

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
  { value: "one_car", label: "1-car driveway", sqft: 300, image: "/driveway-size-1-car.png" },
  { value: "two_car", label: "2-car driveway", sqft: 600, image: "/driveway-size-2-car.png" },
  { value: "three_car", label: "3-car driveway", sqft: 900, image: "/driveway-size-3-car.png" },
  { value: "long", label: "Long driveway", sqft: 1200, image: "/driveway-size-long.png" },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const walkwaySizeOptions: SizeOption[] = [
  { value: "small", label: "Small walkway", sqft: 80 },
  { value: "medium", label: "Medium walkway", sqft: 150 },
  { value: "large", label: "Large walkway", sqft: 250 },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const patioSizeOptions: SizeOption[] = [
  { value: "small", label: "Small patio", sqft: 150 },
  { value: "medium", label: "Medium patio", sqft: 300 },
  { value: "large", label: "Large patio", sqft: 500 },
  { value: "not_sure", label: "Not sure / upload photo", sqft: 0 },
];

const houseWashSizeOptions: SizeOption[] = [
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
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, index) => index + 1);
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

function StepBadge({
  active,
  complete,
  number,
  title,
}: {
  active: boolean;
  complete: boolean;
  number: string;
  title: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-4 transition ${
        active
          ? "border-cyan-300/35 bg-cyan-400/12 shadow-[0_0_40px_rgba(18,182,255,0.12)]"
          : complete
            ? "border-emerald-300/20 bg-emerald-400/10"
            : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 items-center justify-center rounded-full border text-sm font-semibold ${
            active
              ? "border-cyan-300/50 bg-cyan-300/12 text-cyan-100"
              : complete
                ? "border-emerald-300/40 bg-emerald-300/12 text-emerald-100"
                : "border-white/10 bg-black/20 text-white/75"
          }`}
        >
          {complete ? <CheckCircle2 className="size-4" /> : number}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Step</p>
          <p className="font-heading text-2xl font-black uppercase leading-none text-white">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileSupportPanel({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 sm:hidden"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
        {title}
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
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
    <section className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4 sm:rounded-[1.75rem] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
            {label}
          </h3>
          {helper ? <p className="mt-2 text-sm leading-6 text-white/62">{helper}</p> : null}
        </div>
        <Camera className="mt-1 size-5 shrink-0 text-[#0B67F0]" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
                <Image
                  src={option.image}
                  alt=""
                  width={420}
                  height={236}
                  className="h-20 w-full object-cover"
                />
              ) : null}
              <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-3">
                <span className="text-sm font-black uppercase italic tracking-[0.06em] text-white">
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
    Boolean(form.drivewaySize || form.walkwaySize || form.patioSize || form.houseWashSize) ||
    form.photoUrls.length > 0;

  const stepValidity = useMemo(
    () => [
      form.selectedServices.length > 0,
      (!hasPressureWashing || hasPressureWashingDetails) &&
        (!hasTrashCanCleaning || toNumber(form.binsCount) >= 1),
      Boolean(
        form.addressLine1 &&
          form.city &&
          form.state.length === 2 &&
          /^\d{5}$/.test(form.zip) &&
          preferredDate &&
          form.preferredTimeWindow,
      ),
      Boolean(
        form.customerName &&
          form.phone &&
          form.email &&
          form.termsAccepted &&
          form.privacyAccepted,
      ),
    ],
    [form, hasPressureWashing, hasPressureWashingDetails, hasTrashCanCleaning, preferredDate],
  );

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const bookingButtonLabel =
    quote.paymentMode === "deposit"
      ? `Pay ${formatCurrency(quote.depositDue)} Deposit`
      : quote.paymentMode === "full"
        ? `Pay ${formatCurrency(quote.total)}`
        : "Send Request";
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
    <div className="mx-auto max-w-5xl overflow-x-hidden bg-black px-4 py-4 pb-28 text-white sm:px-6 sm:py-8 sm:pb-10 lg:px-8">
      <div className="grid gap-5 lg:gap-6">
        <div className="space-y-6 sm:space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[1.7rem] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(18,182,255,0.14),rgba(7,17,29,0.98)_28%,rgba(2,6,11,0.98)_100%)] p-4 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:rounded-[2.3rem] sm:p-8"
          >
            <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-500/14 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <Sparkles className="size-3.5" />
                Book Online
              </div>
              <h1 className="mt-4 max-w-4xl font-heading text-[2rem] font-black uppercase leading-[0.92] text-white sm:mt-5 sm:text-6xl">
                Fast quote. Clear steps. No confusing pricing.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:mt-5 sm:text-lg sm:leading-8">
                This booking flow is built to be simple. Pick the service, enter only the surfaces
                that really need cleaning, choose a day, and send the request.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:hidden">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`rounded-2xl border px-3 py-3 ${
                      currentStep === index
                        ? "border-cyan-300/35 bg-cyan-400/12"
                        : stepValidity[index]
                          ? "border-emerald-300/20 bg-emerald-400/10"
                          : "border-white/8 bg-white/[0.03]"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">{step.number}</p>
                    <p className="mt-1 text-sm font-semibold uppercase leading-5 text-white">
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>

              <div className="-mx-1 mt-5 hidden gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:mt-6 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 xl:grid-cols-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="min-w-[15rem] sm:min-w-0">
                    <StepBadge
                      active={currentStep === index}
                      complete={stepValidity[index]}
                      number={step.number}
                      title={step.title}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8 sm:mt-6">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#12B6FF,#009DFF,#78E6FF)]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/88 sm:hidden">
                  4 short steps. Live price updates. No call needed.
                </div>
                <Button asChild variant="secondary" className="sm:w-auto">
                  <Link href={BUSINESS_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                    <MessageSquare className="size-4" />
                    DM {BUSINESS_INSTAGRAM_HANDLE}
                  </Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex">
                  <Link href="/book">
                    <CalendarDays className="size-4" />
                    Book Online
                  </Link>
                </Button>
              </div>
            </div>
          </motion.section>

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="sticky top-3 z-40 rounded-[1.35rem] border border-[#0B67F0]/40 bg-black/94 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary" className="hidden h-11 px-4 sm:inline-flex">
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    Home
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 px-4"
                  onClick={goBack}
                  disabled={currentStep === 0 || isPending}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                    Live Estimate
                  </p>
                  <p className="truncate font-heading text-2xl font-black uppercase italic leading-none text-white">
                    {quote.total > 0 ? `Estimated price: ${estimateLabel}` : estimateLabel}
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center sm:block">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/48">Step</p>
                  <p className="font-semibold text-white">{currentStep + 1}/{steps.length}</p>
                </div>
                {isLastStep ? (
                  <Button type="submit" className="hidden h-11 px-4 sm:inline-flex" disabled={isPending}>
                    {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    Send
                  </Button>
                ) : (
                  <Button type="button" className="hidden h-11 px-4 sm:inline-flex" onClick={goNext}>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-center text-[11px] font-bold uppercase italic tracking-[0.08em] text-white/58">
                Final price confirmed before service.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[2rem] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <h2 className="mt-2 font-heading text-[1.7rem] font-black uppercase leading-none text-white sm:mt-3 sm:text-5xl">
                    {steps[currentStep].title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base">
                    {steps[currentStep].body}
                  </p>
                </div>
                <div className="hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center sm:block">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Progress</p>
                  <p className="mt-1 text-xl font-semibold text-white">{progress}%</p>
                </div>
              </div>

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
                                  ? "border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_40px_rgba(18,182,255,0.08)]"
                                  : "border-white/10 bg-black/20 hover:border-white/20"
                              }`}
                              aria-pressed={selected}
                            >
                              <option.icon className="size-6 text-cyan-200" />
                              <p className="mt-3 font-heading text-[1.35rem] font-black uppercase leading-none text-white sm:mt-4 sm:text-2xl">
                                {option.label}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{option.body}</p>
                              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                    <div className="space-y-5 sm:space-y-6">
                      <div className="rounded-[1.35rem] border border-[#0B67F0]/30 bg-[#0B67F0]/10 px-4 py-4 text-sm leading-6 text-white sm:rounded-[1.6rem] sm:px-5 sm:py-5">
                        Choose the closest size. We will confirm before charging.
                      </div>

                      {hasPressureWashing ? (
                        <div className="grid gap-4">
                          <SizeSelector
                            label="Driveway size"
                            helper="Choose the closest option. We’ll confirm before charging."
                            value={form.drivewaySize}
                            options={drivewaySizeOptions}
                            onChange={(option) => updateSize("drivewaySize", "drivewaySqft", option)}
                          />
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
                          <SizeSelector
                            label="House area to wash"
                            helper="Only choose the siding areas that actually need cleaning."
                            value={form.houseWashSize}
                            options={houseWashSizeOptions}
                            onChange={(option) => updateSize("houseWashSize", "houseSqft", option)}
                          />

                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                                Fence linear feet
                              </span>
                              <span className="block text-sm leading-6 text-white/62">
                                Estimate by fence panels. Most panels are about 6-8 feet wide.
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={form.fenceLinearFeet}
                                onChange={(event) => update("fenceLinearFeet", event.target.value)}
                                placeholder="Example: 80"
                                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                                Stain level
                              </span>
                              <span className="block text-sm leading-6 text-white/62">
                                Keep this simple. We will confirm if anything looks heavier.
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

                          <div className="rounded-[1.4rem] border border-dashed border-[#0B67F0]/55 bg-[#0B67F0]/8 p-4 sm:rounded-[1.75rem] sm:p-5">
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
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            />
                          </label>
                          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                            Monthly trash can service is always reviewed by a real person before it
                            is confirmed.
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">City</span>
                          <input
                            value={form.city}
                            onChange={(event) => update("city", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">State</span>
                          <input
                            value={form.state}
                            onChange={(event) => update("state", event.target.value.toUpperCase())}
                            maxLength={2}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">ZIP code</span>
                          <input
                            value={form.zip}
                            onChange={(event) => update("zip", event.target.value)}
                            maxLength={5}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/80">
                          We figure out the year automatically, so you only need to pick the month
                          and day.
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            value={form.preferredTimeWindow}
                            onChange={(event) =>
                              update("preferredTimeWindow", event.target.value as TimeWindow)
                            }
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                          >
                            <option value="8-10">8:00 AM - 10:00 AM</option>
                            <option value="10-12">10:00 AM - 12:00 PM</option>
                            <option value="12-2">12:00 PM - 2:00 PM</option>
                            <option value="2-4">2:00 PM - 4:00 PM</option>
                            <option value="4-6">4:00 PM - 6:00 PM</option>
                          </select>
                        </label>
                      </div>

                      <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Phone</span>
                          <input
                            value={form.phone}
                            onChange={(event) => update("phone", event.target.value)}
                            placeholder="678-709-6690"
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            required
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-slate-200">Email</span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) => update("email", event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
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
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                            placeholder="Google, Instagram, a neighbor, HOA, a sign, or something else"
                          />
                        </label>
                      </div>

                      <div className="rounded-[1.35rem] border border-white/8 bg-black/20 p-4 sm:rounded-[1.6rem] sm:p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
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
                          <Link href="/terms" className="text-cyan-200 underline">
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
                          <Link href="/privacy" className="text-cyan-200 underline">
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

            <div className="hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={goBack}
                disabled={currentStep === 0 || isPending}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={goNext}>
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
                  {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {bookingButtonLabel}
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="hidden">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.5rem] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(7,17,29,0.95),rgba(2,6,11,0.98))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Live Estimate
                </p>
                <h2 className="mt-2 font-heading text-[1.45rem] font-black uppercase leading-tight text-white sm:mt-3 sm:text-4xl sm:leading-none">
                  {quote.summary || "Smart pricing"}
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center sm:px-4 sm:py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Step</p>
                <p className="mt-1 text-base font-semibold text-white sm:text-xl">
                  {currentStep + 1}/{steps.length}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.35rem] border border-white/8 bg-black/20 p-4 sm:mt-5 sm:rounded-[1.6rem] sm:p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Selected services</p>
              <p className="mt-2 text-sm leading-6 text-white/92">
                {formatServiceList(form.selectedServices)}
              </p>
            </div>

            <div className="mt-4 space-y-3 sm:mt-6">
              {quote.lineItems.length > 0 ? (
                quote.lineItems.map((item) => (
                  <div
                    key={`${item.label}-${item.amount}`}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm leading-6 text-white/92">{item.label}</span>
                      <span className="text-sm font-semibold text-cyan-100">
                        {item.amount > 0 ? formatCurrency(item.amount) : "Manual"}
                      </span>
                    </div>
                    {item.note ? (
                      <p className="mt-2 text-xs leading-5 text-white/55">{item.note}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-slate-300">
                  Pick a service and add the job details to see the estimate update.
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3 rounded-[1.35rem] border border-white/8 bg-black/20 p-4 sm:mt-6 sm:rounded-[1.6rem] sm:p-5">
              <div className="flex items-center justify-between text-sm text-white/88">
                <span>Estimated total</span>
                <strong>{formatCurrency(quote.total)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-white/88">
                <span>Due today</span>
                <strong>
                  {quote.depositDue > 0 ? formatCurrency(quote.depositDue) : "Nothing due yet"}
                </strong>
              </div>
              <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
                <div className="flex gap-3">
                  <MapPinned className="mt-0.5 size-4 shrink-0" />
                  <span>{quote.serviceArea.message}</span>
                </div>
              </div>
              <p className="text-xs leading-5 text-slate-400">{quote.disclaimer}</p>
            </div>
          </motion.section>

          <MobileSupportPanel title="Why this feels easy" defaultOpen={false}>
            <div className="space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                The form moves one clear step at a time
              </div>
              <div className="flex gap-3">
                <Lock className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Stripe is only used when payment is actually needed
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                The date picker is simple and does not ask you for a year
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Pricing moves up with the area entered instead of big jumps
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
              If Stripe asks for payment, it may show <strong>{PAYMENT_OPERATOR_NAME}</strong>.
              That is the software company that securely handles online payments for {BUSINESS_NAME}.
            </div>
          </MobileSupportPanel>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:block sm:rounded-[2rem] sm:p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Why this feels easy
            </p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                The form moves one clear step at a time
              </div>
              <div className="flex gap-3">
                <Lock className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Stripe is only used when payment is actually needed
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                The date picker is simple and does not ask you for a year
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Pricing moves up with the area entered instead of big jumps
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
              If Stripe asks for payment, it may show <strong>{PAYMENT_OPERATOR_NAME}</strong>.
              That is the software company that securely handles online payments for {BUSINESS_NAME}.
            </div>
          </motion.section>

          <MobileSupportPanel title="What happens next" defaultOpen={false}>
            <div className="space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We review the request details
              </div>
              <div className="flex gap-3">
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                If payment is needed, Stripe handles it safely
              </div>
              <div className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We confirm your date and time window
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
              Current visit target:{" "}
              <span className="font-semibold text-white">
                {formatFriendlyDate(form.preferredMonth, form.preferredDay)} -{" "}
                {getTimeWindowLabel(form.preferredTimeWindow)}
              </span>
            </div>
          </MobileSupportPanel>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 sm:block sm:rounded-[2rem] sm:p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              What happens next
            </p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We review the request details
              </div>
              <div className="flex gap-3">
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                If payment is needed, Stripe handles it safely
              </div>
              <div className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We confirm your date and time window
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
              Current visit target:{" "}
              <span className="font-semibold text-white">
                {formatFriendlyDate(form.preferredMonth, form.preferredDay)} -{" "}
                {getTimeWindowLabel(form.preferredTimeWindow)}
              </span>
            </div>
          </motion.section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-cyan-300/14 bg-[#02060B]/96 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-xl sm:hidden">
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
