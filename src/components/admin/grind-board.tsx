"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardList,
  DoorOpen,
  Flame,
  MapPinned,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

const grinds = [
  {
    title: "Apartment Leasing Office Walk-In",
    channel: "In person",
    target: "Apartments",
    effort: "High",
    link: "/apartments",
    icon: Building2,
    pitch: "Hi, I’m Emerson with CURBSIDE EXTERIOR CO. We’re licensed and insured, and we clean apartment sidewalks, breezeways, dumpster pads, entries, and high-traffic concrete.",
    steps: [
      "Walk in clean, calm, and quick.",
      "Ask for the property manager or maintenance lead.",
      "Show /apartments and point to licensed and insured.",
      "Offer to photo-estimate one ugly area first.",
      "Ask for the email where vendor estimates should go.",
    ],
  },
  {
    title: "Apartment Dumpster Pad Photo Hunt",
    channel: "Field",
    target: "Apartments",
    effort: "Medium",
    link: "/admin/estimator",
    icon: Camera,
    pitch: "I noticed the dumpster pad could be cleaned up. I can send a photo estimate for that one section so you can approve it without a full property walk.",
    steps: ["Find visible pads from public/allowed areas.", "Take notes, not trespassing.", "Use the estimator.", "Send a clean one-area proposal.", "Follow up in 48 hours."],
  },
  {
    title: "Property Manager Email Sprint",
    channel: "Email",
    target: "Property Managers",
    effort: "Medium",
    link: "/property-managers",
    icon: MessageSquare,
    pitch: "I help property managers get rentals and listings exterior-cleaned fast. Licensed and insured, photo estimates, before/after proof.",
    steps: ["Search Marietta property management companies.", "Find owner/maintenance email.", "Send /property-managers.", "Offer photo estimates.", "Track replies in admin notes."],
  },
  {
    title: "Realtor Listing Prep Calls",
    channel: "Phone",
    target: "Realtors",
    effort: "High",
    link: "/property-managers",
    icon: Phone,
    pitch: "When a listing has dirty concrete or a green patio, I can usually help it photograph better before showings.",
    steps: ["Call 10 agents.", "Ask if they have upcoming exterior photo shoots.", "Offer driveway/walkway/listing prep.", "Text the property-manager page.", "Ask for one address to estimate."],
  },
  {
    title: "HOA Board DM",
    channel: "Social",
    target: "HOA",
    effort: "Low",
    link: "/book",
    icon: Users,
    pitch: "If your neighborhood wants cleaner curbs, sidewalks, or trash cans, I can quote a small bundle for a few homes at once.",
    steps: ["Find neighborhood Facebook groups where allowed.", "Do not spam.", "Offer a simple bundle.", "Link /book.", "Suggest 3-neighbor route pricing."],
  },
  {
    title: "Door Knock Driveway Cluster",
    channel: "In person",
    target: "Homeowners",
    effort: "High",
    link: "/book",
    icon: DoorOpen,
    pitch: "I’m cleaning in the area and can quote the driveway from the sidewalk. If you want, I can send a booking link with the price.",
    steps: ["Pick one street with visibly dirty concrete.", "Knock 12 doors.", "Use Field Quote if they are interested.", "Send /book for self-service.", "Write down objections."],
  },
  {
    title: "Trash Can Cleaning Route Builder",
    channel: "Field",
    target: "Homeowners",
    effort: "Medium",
    link: "/services/trash-can-cleaning-marietta-ga",
    icon: MapPinned,
    pitch: "I clean trash cans for $20 for one bin, $35 for two, $50 for three, and $10 for each additional bin. I’m building a route in this area.",
    steps: ["Go after trash pickup day.", "Look for bins near curb.", "Leave a clean note or talk directly.", "Offer neighbor bundle.", "Book through /book."],
  },
  {
    title: "Before/After Proof Day",
    channel: "Content",
    target: "All",
    effort: "Medium",
    link: "/testimonial",
    icon: Sparkles,
    pitch: "Today’s goal is proof: before photos, after photos, customer quote, and one testimonial request.",
    steps: ["Take the same angle before/after.", "Ask customer for one sentence.", "Send /testimonial.", "Post story with service area.", "Save best photos for future landing pages."],
  },
  {
    title: "Maintenance Company Partner List",
    channel: "Phone",
    target: "Partners",
    effort: "Medium",
    link: "/property-managers",
    icon: ClipboardList,
    pitch: "If you ever need exterior cleaning as part of a turnover or repair job, I can be the pressure washing/trash can cleaning contact.",
    steps: ["Call handymen, lawn care, cleaners.", "Offer referral swap.", "Send /property-managers.", "Ask what jobs they see weekly.", "Follow up monthly."],
  },
  {
    title: "Church And Daycare Sidewalk Calls",
    channel: "Phone",
    target: "Commercial",
    effort: "Medium",
    link: "/book",
    icon: Phone,
    pitch: "We’re licensed and insured and can quote sidewalks, entrances, and high-traffic concrete from photos.",
    steps: ["Call 10 churches/daycares.", "Ask who handles facilities.", "Offer photo estimate.", "Mention low-disruption scheduling.", "Send /book or request photos."],
  },
  {
    title: "Apartment Follow-Up Loop",
    channel: "Email",
    target: "Apartments",
    effort: "Low",
    link: "/apartments",
    icon: CheckCircle2,
    pitch: "Just following up. If you send photos of one dirty area, I can return a simple estimate for that section first.",
    steps: ["Follow up after 2 days.", "Keep it short.", "Attach /apartments.", "Ask for one photo.", "Log the next date."],
  },
  {
    title: "Estimator Demo Walkthrough",
    channel: "In person",
    target: "Any lead",
    effort: "Medium",
    link: "/admin/estimator",
    icon: Flame,
    pitch: "I can build the estimate from photos right here so you can see how we price it.",
    steps: ["Open /admin/estimator.", "Upload photos.", "Show price breakdown.", "Explain deposit/payment mode.", "Send booking link."],
  },
];

const filters = ["All", "Apartments", "Property Managers", "Homeowners", "Realtors", "Commercial", "HOA", "Partners"] as const;

export function GrindBoard() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<(typeof filters)[number]>("All");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return grinds.filter((grind) => {
      const targetMatch = target === "All" || grind.target === target;
      const textMatch = !normalized || [grind.title, grind.channel, grind.target, grind.pitch, grind.steps.join(" ")].join(" ").toLowerCase().includes(normalized);
      return targetMatch && textMatch;
    });
  }, [query, target]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
          <ArrowLeft className="size-4" />
          Admin
        </Link>
        <p className="mt-6 text-sm font-black uppercase italic tracking-[0.2em] text-[#0B67F0]">Owner Grind Board</p>
        <h1 className="mt-2 font-heading text-5xl font-black uppercase italic leading-none text-white sm:text-6xl">
          Daily Plays That Make Money
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          Pick a grind, follow the script, use the site as proof, and turn conversations into estimates.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3">
            <Search className="size-5 text-[#BFD7FF]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apartments, calls, walkthroughs..." className="w-full bg-transparent text-white outline-none placeholder:text-white/35" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button key={filter} type="button" onClick={() => setTarget(filter)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${target === filter ? "border-[#0B67F0]/60 bg-[#0B67F0]/16 text-white" : "border-white/10 bg-black/20 text-white/58"}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.map((grind) => {
          const Icon = grind.icon;
          return (
            <article key={grind.title} className="rounded-[1.7rem] border border-white/10 bg-black/24 p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/52">{grind.channel}</span>
                    <span className="rounded-full border border-[#0B67F0]/18 bg-[#0B67F0]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#BFD7FF]">{grind.target}</span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/52">{grind.effort}</span>
                  </div>
                  <h2 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white">{grind.title}</h2>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/44">Say This</p>
                <p className="mt-2 text-sm leading-6 text-white/82">{grind.pitch}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {grind.steps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0B67F0] text-xs font-bold text-white">{index + 1}</span>
                    <p className="text-sm leading-6 text-white/72">{step}</p>
                  </div>
                ))}
              </div>
              <Link href={grind.link} className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-4 text-xs font-black uppercase italic tracking-[0.14em] text-white">
                Open Tool / Page
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
