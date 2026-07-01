"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  Home,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";

const analysisSteps = [
  "Analyzing surfaces...",
  "Detecting cleaning requirements...",
  "Estimating project size...",
  "Calculating labor...",
  "Building estimate...",
];

const observations = [
  "Moderate algae growth detected",
  "Concrete surface identified",
  "Easy equipment access",
];

const addOns = ["+$75 Sidewalk Cleaning", "+$20 Trash Can Cleaning"];

const historyItems = [
  { address: "123 Main St", service: "Driveway Cleaning", price: "$285", confidence: "88%" },
  { address: "74 Roswell St", service: "Patio + Walkway", price: "$240", confidence: "84%" },
  { address: "18 Whitlock Ave", service: "Trash Can Cleaning", price: "$35", confidence: "96%" },
];

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">{label}</p>
      <p className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">{value}</p>
    </div>
  );
}

export function CurbsideEstimator() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= analysisSteps.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setIsAnalyzing(false);
            setIsComplete(true);
          }, 550);
          return current;
        }

        return current + 1;
      });
    }, 850);

    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  function buildEstimate() {
    setIsComplete(false);
    setStepIndex(0);
    setIsAnalyzing(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
        <Link
          href="/admin"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Admin
        </Link>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase italic tracking-[0.24em] text-[#0B67F0]">
              Curbside Exterior Co.
            </p>
            <h1 className="mt-3 font-heading text-5xl font-black uppercase italic leading-none text-white sm:text-6xl">
              Curbside Estimator
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Estimate jobs from photos in seconds.
            </p>
          </div>
          <div className="grid gap-2 rounded-[1.5rem] border border-[#0B67F0]/18 bg-black/24 p-4 text-sm text-white/82">
            <div className="flex items-center gap-3">
              <Camera className="size-4 text-[#BFD7FF]" />
              <span>6 Photos Captured</span>
            </div>
            <div className="flex items-center gap-3">
              <Home className="size-4 text-[#BFD7FF]" />
              <span>Driveway Cleaning</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-[#BFD7FF]" />
              <span>123 Main St</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Job Photos</p>
              <p className="mt-2 text-sm leading-6 text-white/62">Capture or review the exterior surfaces before pricing.</p>
            </div>
            <button className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white" type="button">
              <Plus className="size-5" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="flex aspect-square items-center justify-center rounded-[1.1rem] border border-white/8 bg-[linear-gradient(145deg,rgba(11,103,240,0.18),rgba(255,255,255,0.04))]"
              >
                <Camera className="size-6 text-white/55" />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={buildEstimate}
            disabled={isAnalyzing}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#0B67F0]/80 bg-[#0B67F0] px-5 text-sm font-black uppercase italic tracking-[0.18em] text-white transition hover:bg-[#075BE6] disabled:opacity-70"
          >
            <Sparkles className="size-4" />
            {isAnalyzing ? "Analyzing" : "Build Estimate"}
          </button>
        </section>

        <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
          {isAnalyzing ? (
            <div className="flex min-h-[25rem] flex-col justify-center">
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Estimating Engine</p>
              <div className="mt-5 grid gap-3">
                {analysisSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      index <= stepIndex
                        ? "border-[#0B67F0]/24 bg-[#0B67F0]/10 text-white"
                        : "border-white/8 bg-black/20 text-white/36"
                    }`}
                  >
                    {index < stepIndex ? (
                      <CheckCircle2 className="size-4 text-emerald-200" />
                    ) : (
                      <Clock3 className="size-4 text-[#BFD7FF]" />
                    )}
                    {step}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Results</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Recommended Price" value={isComplete ? "$285" : "--"} />
                <MetricCard label="Estimated Time" value={isComplete ? "1.5 Hours" : "--"} />
                <MetricCard label="Confidence" value={isComplete ? "88%" : "--"} />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-xs font-black uppercase italic tracking-[0.16em] text-white/64">Observations</p>
                  <div className="mt-3 grid gap-2">
                    {(isComplete ? observations : ["Run analysis to generate surface observations."]).map((item) => (
                      <p key={item} className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2 text-sm text-white/78">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-xs font-black uppercase italic tracking-[0.16em] text-white/64">Suggested Add-Ons</p>
                  <div className="mt-3 grid gap-2">
                    {(isComplete ? addOns : ["Build estimate to see add-ons."]).map((item) => (
                      <p key={item} className="rounded-2xl border border-[#0B67F0]/16 bg-[#0B67F0]/8 px-3 py-2 text-sm font-semibold text-[#BFD7FF]">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Estimate History</p>
        <div className="mt-4 grid gap-3">
          {historyItems.map((item) => (
            <article key={item.address} className="grid gap-3 rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <div>
                <p className="font-semibold text-white">{item.address}</p>
                <p className="mt-1 text-sm text-white/56">{item.service}</p>
              </div>
              <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">{item.price}</p>
              <p className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/66">
                {item.confidence}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
