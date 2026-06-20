"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  DollarSign,
  Home,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { formatCurrency, formatTitle } from "@/lib/format";
import { buildQuote, type QuoteInput, type QuoteResult } from "@/lib/pricing";

const analysisSteps = [
  "Analyzing surfaces...",
  "Detecting cleaning requirements...",
  "Estimating project size...",
  "Calculating labor...",
  "Building estimate...",
];

const drivewayOptions = [
  { label: "None", value: 0 },
  { label: "1-car", value: 300 },
  { label: "2-car", value: 600 },
  { label: "3-car", value: 900 },
  { label: "Long", value: 1200 },
];

const walkwayOptions = [
  { label: "None", value: 0 },
  { label: "Small", value: 80 },
  { label: "Medium", value: 150 },
  { label: "Large", value: 250 },
];

const patioOptions = [
  { label: "None", value: 0 },
  { label: "Small", value: 150 },
  { label: "Medium", value: 300 },
  { label: "Large", value: 500 },
];

const houseOptions = [
  { label: "None", value: 0 },
  { label: "Front", value: 500 },
  { label: "Back", value: 500 },
  { label: "One side", value: 400 },
  { label: "Two sides", value: 800 },
  { label: "Full", value: 1800 },
];

const fenceOptions = [
  { label: "None", value: 0 },
  { label: "Short", value: 60 },
  { label: "Medium", value: 100 },
  { label: "Long", value: 160 },
];

const initialForm = {
  address: "123 Main St",
  zip: "30067",
  drivewaySqft: 900,
  walkwaySqft: 0,
  patioSqft: 0,
  houseSqft: 0,
  fenceLinearFeet: 0,
  binsCount: 0,
  heavyStainLevel: "moderate" as QuoteInput["heavyStainLevel"],
  photoCount: 6,
  photoUrls: [] as string[],
};

type EstimatorAnalysis = {
  estimatedMinutes: number;
  confidence: number;
  observations: string[];
  suggestedAddOns: string[];
  summary: string;
};

type EstimatorResponse = {
  form: typeof initialForm;
  quote: QuoteResult;
  analysis: EstimatorAnalysis;
  source: "openai" | "pricing";
};

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: Array<{ label: string; value: number }>;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition focus:border-[#0B67F0]/80"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "blue" }) {
  return (
    <div
      className={`rounded-[1.15rem] border p-4 ${
        tone === "blue" ? "border-[#0B67F0]/22 bg-[#0B67F0]/10" : "border-white/8 bg-white/[0.04]"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">{label}</p>
      <p className="mt-2 font-heading text-[2.15rem] font-black uppercase italic leading-none text-white sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

function estimateMinutes(form: typeof initialForm) {
  const minutes =
    28 +
    form.drivewaySqft * 0.055 +
    form.walkwaySqft * 0.075 +
    form.patioSqft * 0.07 +
    form.houseSqft * 0.025 +
    form.fenceLinearFeet * 0.55 +
    form.binsCount * 8;

  const stainMultiplier = form.heavyStainLevel === "heavy" ? 1.2 : form.heavyStainLevel === "moderate" ? 1.1 : 1;
  return Math.max(30, Math.round((minutes * stainMultiplier) / 15) * 15);
}

function formatHours(minutes: number) {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} Hours`;
}

function getConfidence(form: typeof initialForm, manualReview: boolean) {
  let confidence = 94;
  if (form.photoUrls.length < 4) confidence -= 8;
  if (form.heavyStainLevel === "moderate") confidence -= 4;
  if (form.heavyStainLevel === "heavy") confidence -= 10;
  if (form.houseSqft > 0 || form.fenceLinearFeet > 0) confidence -= 4;
  if (manualReview) confidence -= 10;
  return `${Math.max(70, confidence)}%`;
}

function buildObservations(form: typeof initialForm, quote: ReturnType<typeof buildQuote>) {
  const observations = [];

  if (form.drivewaySqft > 0) observations.push("Concrete driveway surface included");
  if (form.walkwaySqft > 0) observations.push("Walkway cleaning included in base estimate");
  if (form.patioSqft > 0) observations.push("Patio surface included");
  if (form.houseSqft > 0) observations.push("House wash area included");
  if (form.fenceLinearFeet > 0) observations.push("Fence linear footage included");
  if (form.heavyStainLevel === "moderate") observations.push("Moderate buildup surcharge applied");
  if (form.heavyStainLevel === "heavy") observations.push("Heavy stain treatment allowance applied");
  if (quote.serviceArea.allowed && quote.serviceArea.travelSurcharge === 0) observations.push("Inside core service area");
  if (quote.serviceArea.allowed && quote.serviceArea.travelSurcharge > 0) observations.push("Travel surcharge included");
  if (!quote.serviceArea.allowed) observations.push("Outside service area, manual review needed");

  return observations.slice(0, 5);
}

function serviceLabel(form: typeof initialForm) {
  if (form.houseSqft > 0) return "House Wash";
  if (form.patioSqft > 0) return "Patio Cleaning";
  if (form.fenceLinearFeet > 0) return "Fence Cleaning";
  if (form.binsCount > 0 && form.drivewaySqft === 0) return "Trash Can Cleaning";
  return "Driveway Cleaning";
}

export function CurbsideEstimator() {
  const [form, setForm] = useState(initialForm);
  const [analysis, setAnalysis] = useState<EstimatorAnalysis | null>(null);
  const [analysisSource, setAnalysisSource] = useState<EstimatorResponse["source"]>("pricing");
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  const [stepIndex, setStepIndex] = useState(analysisSteps.length - 1);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, startUploadTransition] = useTransition();

  const quoteInput = useMemo<QuoteInput>(() => {
    const hasPressureSurface =
      form.drivewaySqft > 0 || form.walkwaySqft > 0 || form.patioSqft > 0 || form.houseSqft > 0 || form.fenceLinearFeet > 0;
    const selectedServices: QuoteInput["selectedServices"] = [];

    if (hasPressureSurface) selectedServices.push("pressure_washing");
    if (form.binsCount > 0) selectedServices.push("trash_can_cleaning");

    return {
      selectedServices,
      frequency: "one_time",
      propertyType: "single_family",
      zip: form.zip,
      drivewaySqft: form.drivewaySqft,
      walkwaySqft: form.walkwaySqft,
      patioSqft: form.patioSqft,
      houseSqft: form.houseSqft,
      fenceLinearFeet: form.fenceLinearFeet,
      binsCount: form.binsCount,
      heavyStainLevel: form.heavyStainLevel,
    };
  }, [form]);

  const quote = useMemo(() => buildQuote(quoteInput), [quoteInput]);
  const estimatedMinutes = analysis?.estimatedMinutes ?? estimateMinutes(form);
  const confidence = `${analysis?.confidence ?? Number.parseInt(getConfidence(form, quote.manualReview), 10)}%`;
  const observations = useMemo(() => analysis?.observations ?? buildObservations(form, quote), [analysis, form, quote]);

  const suggestedAddOns = useMemo(() => {
    const addOns = [];

    if (form.walkwaySqft === 0) {
      const next = buildQuote({ ...quoteInput, selectedServices: ["pressure_washing"], walkwaySqft: 250 });
      addOns.push({ label: "Sidewalk Cleaning", amount: Math.max(0, next.total - quote.total) });
    }

    if (form.binsCount === 0) {
      const next = buildQuote({
        ...quoteInput,
        selectedServices: Array.from(new Set([...quoteInput.selectedServices, "trash_can_cleaning"])),
        binsCount: 2,
      });
      addOns.push({ label: "Trash Can Cleaning", amount: Math.max(0, next.total - quote.total) });
    }

    return addOns.filter((item) => item.amount > 0).slice(0, 2);
  }, [form.binsCount, form.walkwaySqft, quote.total, quoteInput]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setAnalysis(null);
    setIsComplete(false);
  }

  function removePhoto(url: string) {
    setForm((current) => {
      const photoUrls = current.photoUrls.filter((photoUrl) => photoUrl !== url);
      return { ...current, photoUrls, photoCount: photoUrls.length };
    });
    setAnalysis(null);
    setIsComplete(false);
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
          const blob = await upload(`estimator-photos/${Date.now()}-${safeName}`, file, {
            access: "public",
            handleUploadUrl: "/api/uploads",
            contentType: file.type,
            onUploadProgress: ({ percentage }) => setUploadProgress(Math.max(1, percentage)),
          });

          uploadedUrls.push(blob.url);
        }

        setForm((current) => {
          const photoUrls = [...current.photoUrls, ...uploadedUrls].slice(0, 8);
          return { ...current, photoUrls, photoCount: photoUrls.length };
        });
        setUploadProgress(0);
        setAnalysis(null);
        setIsComplete(false);
      } catch (uploadFailure) {
        setUploadProgress(0);
        setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Photo upload failed.");
      }
    });
  }

  async function buildEstimate() {
    if (isUploading) return;

    setIsComplete(false);
    setAnalysisError("");
    setStepIndex(0);
    setIsAnalyzing(true);

    const interval = window.setInterval(() => {
      setStepIndex((current) => Math.min(analysisSteps.length - 1, current + 1));
    }, 700);

    try {
      const response = await fetch("/api/admin/estimator/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as EstimatorResponse | { error?: string };
      if (!response.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error ?? "Could not analyze this job.");
      }
      const result = data as EstimatorResponse;

      setForm((current) => ({
        ...current,
        ...result.form,
        photoUrls: current.photoUrls,
        photoCount: current.photoUrls.length,
      }));
      setAnalysis(result.analysis);
      setAnalysisSource(result.source);
      setIsComplete(true);
      setStepIndex(analysisSteps.length - 1);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Could not analyze this job.");
    } finally {
      window.clearInterval(interval);
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:pt-6 lg:px-8">
      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Admin
          </Link>
          <span className="inline-flex h-10 items-center rounded-full border border-emerald-300/18 bg-emerald-400/10 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
            {quote.serviceArea.serviceability === "outside" ? "Manual Review" : `${formatTitle(quote.serviceArea.serviceability)} Route`}
          </span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_25rem] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase italic tracking-[0.22em] text-[#0B67F0] sm:text-sm">
              Curbside Exterior Co.
            </p>
            <h1 className="mt-2 font-heading text-[3.4rem] font-black uppercase italic leading-[0.86] text-white sm:text-6xl">
              Curbside Estimator
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
              Estimate jobs from photos in seconds.
            </p>
          </div>

          <div className="grid gap-2 rounded-[1.25rem] border border-[#0B67F0]/18 bg-black/24 p-3 text-sm text-white/82 sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Camera className="size-4 shrink-0 text-[#BFD7FF]" />
              <span className="truncate">{form.photoUrls.length} Photos Captured</span>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <Home className="size-4 shrink-0 text-[#BFD7FF]" />
              <span className="truncate">{serviceLabel(form)}</span>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <MapPin className="size-4 shrink-0 text-[#BFD7FF]" />
              <span className="truncate">
                {form.address}, ZIP {form.zip}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <aside className="grid gap-5 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Job Setup</p>
                <p className="mt-2 text-sm leading-6 text-white/62">Upload photos, confirm the address, then analyze.</p>
              </div>
              <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white">
                <Plus className="size-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={isUploading || form.photoUrls.length >= 8}
                  onChange={(event) => handlePhotoUpload(event.target.files)}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {form.photoUrls.length > 0
                ? form.photoUrls.map((url, index) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/8 bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Estimator upload ${index + 1}`} className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white opacity-100 backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))
                : Array.from({ length: 6 }, (_, index) => (
                    <label
                      key={index}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/12 bg-[linear-gradient(145deg,rgba(11,103,240,0.18),rgba(255,255,255,0.04))]"
                    >
                      <Camera className="size-5 text-white/55" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(event) => handlePhotoUpload(event.target.files)}
                      />
                    </label>
                  ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-4 text-xs font-black uppercase italic tracking-[0.14em] text-white transition hover:bg-[#075BE6]">
                <UploadCloud className="size-4" />
                Upload Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={isUploading || form.photoUrls.length >= 8}
                  onChange={(event) => handlePhotoUpload(event.target.files)}
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

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">Address</span>
                <input
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition placeholder:text-white/30 focus:border-[#0B67F0]/80"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">ZIP</span>
                <input
                  value={form.zip}
                  inputMode="numeric"
                  maxLength={5}
                  onChange={(event) => update("zip", event.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition placeholder:text-white/30 focus:border-[#0B67F0]/80"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4 sm:p-5">
            <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Surfaces</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <SelectControl label="Driveway" value={form.drivewaySqft} options={drivewayOptions} onChange={(value) => update("drivewaySqft", value)} />
              <SelectControl label="Walkway / sidewalk" value={form.walkwaySqft} options={walkwayOptions} onChange={(value) => update("walkwaySqft", value)} />
              <SelectControl label="Patio" value={form.patioSqft} options={patioOptions} onChange={(value) => update("patioSqft", value)} />
              <SelectControl label="House wash" value={form.houseSqft} options={houseOptions} onChange={(value) => update("houseSqft", value)} />
              <SelectControl label="Fence" value={form.fenceLinearFeet} options={fenceOptions} onChange={(value) => update("fenceLinearFeet", value)} />
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">Trash cans</span>
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={form.binsCount}
                  onChange={(event) => update("binsCount", Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition focus:border-[#0B67F0]/80"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">Buildup</span>
                <select
                  value={form.heavyStainLevel}
                  onChange={(event) => update("heavyStainLevel", event.target.value as QuoteInput["heavyStainLevel"])}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition focus:border-[#0B67F0]/80"
                >
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </label>
            </div>
          </section>
        </aside>

        <main className="grid min-w-0 gap-5">
          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            {isAnalyzing ? (
              <div className="flex min-h-[20rem] flex-col justify-center">
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Estimating Engine</p>
                <div className="mt-5 grid gap-3">
                  {analysisSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                        index <= stepIndex ? "border-[#0B67F0]/24 bg-[#0B67F0]/10 text-white" : "border-white/8 bg-black/20 text-white/36"
                      }`}
                    >
                      {index < stepIndex ? <CheckCircle2 className="size-4 text-emerald-200" /> : <Clock3 className="size-4 text-[#BFD7FF]" />}
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Recommendation</p>
                    <p className="mt-2 text-sm leading-6 text-white/62">{analysis?.summary ?? quote.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                  {analysisSource === "openai" && isComplete ? (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                      AI analyzed
                    </span>
                  ) : null}
                  {analysisSource === "pricing" && isComplete ? (
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/58">
                      Pricing engine
                    </span>
                  ) : null}
                  {!isComplete ? (
                    <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
                      Needs Analysis
                    </span>
                  ) : null}
                  </div>
                </div>
                {analysisError ? (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {analysisError}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <MetricCard label="Recommended Price" value={formatCurrency(quote.total)} tone="blue" />
                  <MetricCard label="Estimated Time" value={formatHours(estimatedMinutes)} />
                  <MetricCard label="Confidence" value={confidence} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.15rem] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">Upfront Due</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(quote.depositDue)}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">Payment Mode</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formatTitle(quote.paymentMode)}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/8 bg-black/20 p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">Travel Fee</p>
                    <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(quote.serviceArea.travelSurcharge)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-[1.3rem] border border-white/8 bg-black/20 p-4">
                    <p className="text-xs font-black uppercase italic tracking-[0.16em] text-white/64">Quote Breakdown</p>
                    <div className="mt-3 grid gap-2">
                      {quote.lineItems.length > 0 ? (
                        quote.lineItems.map((item) => (
                          <div key={`${item.label}-${item.amount}`} className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-sm text-white/86">{item.label}</span>
                              <span className="shrink-0 text-sm font-semibold text-[#BFD7FF]">{formatCurrency(item.amount)}</span>
                            </div>
                            {item.note ? <p className="mt-2 text-xs leading-5 text-white/48">{item.note}</p> : null}
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-amber-300/14 bg-amber-400/10 px-3 py-3 text-sm leading-6 text-amber-100">
                          Add at least one surface or trash can service to price this job.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-[1.3rem] border border-white/8 bg-black/20 p-4">
                      <p className="text-xs font-black uppercase italic tracking-[0.16em] text-white/64">Observations</p>
                      <div className="mt-3 grid gap-2">
                        {observations.map((item) => (
                          <p key={item} className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-white/78">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-black/20 p-4">
                      <p className="text-xs font-black uppercase italic tracking-[0.16em] text-white/64">Suggested Add-Ons</p>
                      <div className="mt-3 grid gap-2">
                        {(analysis?.suggestedAddOns.length ? analysis.suggestedAddOns.map((label) => ({ label, amount: null })) : suggestedAddOns).length > 0 ? (
                          (analysis?.suggestedAddOns.length ? analysis.suggestedAddOns.map((label) => ({ label, amount: null })) : suggestedAddOns).map((item) => (
                            <p key={item.label} className="rounded-2xl border border-[#0B67F0]/16 bg-[#0B67F0]/8 px-3 py-2 text-sm font-semibold text-[#BFD7FF]">
                              {item.amount === null ? item.label : `+${formatCurrency(item.amount)} ${item.label}`}
                            </p>
                          ))
                        ) : (
                          <p className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-white/58">
                            No obvious add-ons left for this setup.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Estimate History</p>
                <p className="mt-2 text-sm text-white/56">Recent field estimates using the same pricing engine.</p>
              </div>
              <DollarSign className="size-5 text-[#BFD7FF]" />
            </div>
            <div className="mt-4 grid gap-3">
              {[
                { address: form.address, service: serviceLabel(form), price: formatCurrency(quote.total), confidence },
                { address: "74 Roswell St", service: "Patio + Walkway", price: formatCurrency(buildQuote({ ...quoteInput, patioSqft: 300, walkwaySqft: 150 }).total), confidence: "86%" },
                { address: "18 Whitlock Ave", service: "Trash Can Cleaning", price: formatCurrency(buildQuote({ selectedServices: ["trash_can_cleaning"], frequency: "one_time", propertyType: "single_family", zip: "30067", binsCount: 2 }).total), confidence: "96%" },
              ].map((item) => (
                <article key={`${item.address}-${item.service}`} className="grid gap-3 rounded-[1.15rem] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{item.address}</p>
                    <p className="mt-1 text-sm text-white/56">{item.service}</p>
                  </div>
                  <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">{item.price}</p>
                  <p className="w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/66">
                    {item.confidence}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <div className="mobile-fixed-cta z-50 border-t border-white/10 bg-black/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl xl:hidden">
        <button
          type="button"
          onClick={buildEstimate}
          disabled={isAnalyzing}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#0B67F0]/80 bg-[#0B67F0] px-5 text-sm font-black uppercase italic tracking-[0.16em] text-white transition hover:bg-[#075BE6] disabled:opacity-70"
        >
          <Sparkles className="size-4" />
          {isAnalyzing ? "Analyzing" : "Analyze Job"}
        </button>
      </div>

      <button
        type="button"
        onClick={buildEstimate}
        disabled={isAnalyzing}
        className="fixed bottom-6 right-6 z-40 hidden h-13 items-center justify-center gap-2 rounded-full border border-[#0B67F0]/80 bg-[#0B67F0] px-6 text-sm font-black uppercase italic tracking-[0.16em] text-white shadow-[0_18px_44px_rgba(11,103,240,0.32)] transition hover:bg-[#075BE6] disabled:opacity-70 xl:inline-flex"
      >
        <Sparkles className="size-4" />
        {isAnalyzing ? "Analyzing" : "Analyze Job"}
      </button>
    </div>
  );
}
