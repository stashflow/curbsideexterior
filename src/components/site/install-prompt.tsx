"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEYS = {
  visitCount: "curbside-site-visit-count",
  dismissed: "curbside-install-prompt-dismissed",
  completedCheckout: "curbside-install-prompt-post-checkout",
  installed: "curbside-install-prompt-installed",
} as const;

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [visitCount, setVisitCount] = useState(0);
  const [shouldShowAfterCheckout, setShouldShowAfterCheckout] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Narrow Safari-only property for installed iOS PWAs.
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      localStorage.setItem(STORAGE_KEYS.installed, "true");
      return;
    }

    const hasDismissed = localStorage.getItem(STORAGE_KEYS.dismissed) === "true";
    const hasInstalled = localStorage.getItem(STORAGE_KEYS.installed) === "true";
    const completedCheckout = localStorage.getItem(STORAGE_KEYS.completedCheckout) === "true";
    const currentVisits = Number(localStorage.getItem(STORAGE_KEYS.visitCount) ?? "0") + 1;

    localStorage.setItem(STORAGE_KEYS.visitCount, String(currentVisits));

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setVisitCount(currentVisits);
      setShouldShowAfterCheckout(completedCheckout);
      setDismissed(hasDismissed || hasInstalled);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  const hasReachedVisitThreshold = visitCount >= 3;
  const isEligibleToShow = shouldShowAfterCheckout || hasReachedVisitThreshold;

  if (dismissed) return null;
  if (!isEligibleToShow) return null;
  if (!installEvent && !isIos) return null;

  function rememberDismissal() {
    localStorage.setItem(STORAGE_KEYS.dismissed, "true");
    setDismissed(true);
  }

  async function handleInstall() {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem(STORAGE_KEYS.installed, "true");
        localStorage.removeItem(STORAGE_KEYS.completedCheckout);
        setDismissed(true);
        return;
      }

      rememberDismissal();
      return;
    }

    rememberDismissal();
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 rounded-[1.6rem] border border-cyan-300/18 bg-[#06111D]/94 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:bottom-6 md:left-auto md:right-6 md:w-[25rem]">
      <button
        type="button"
        onClick={rememberDismissal}
        className="absolute right-3 top-3 rounded-full p-2 text-white/60 transition hover:bg-white/6 hover:text-white"
        aria-label="Dismiss install prompt"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-8">
        <div className="mt-1 inline-flex size-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-200">
          <Smartphone className="size-5" />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Save To Home Screen
          </p>
          <p className="text-sm leading-6 text-white/88">
            Add CURBSIDE to your home screen for faster booking, quick quotes, and easy return visits.
            {isIos
              ? " On iPhone: tap the share icon, then choose Add to Home Screen."
              : " Installing it makes it feel more like a real app."}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={handleInstall}>
              {installEvent ? <Download className="size-4" /> : <Share2 className="size-4" />}
              {installEvent ? "Install App" : "Got It"}
            </Button>
            {isIos ? (
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/60">
                <Share2 className="size-4" />
                Share icon -&gt; Add to Home Screen
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
