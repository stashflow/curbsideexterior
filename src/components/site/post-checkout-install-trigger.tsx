"use client";

import { useEffect } from "react";

const COMPLETED_CHECKOUT_KEY = "curbside-install-prompt-post-checkout";

export function PostCheckoutInstallTrigger() {
  useEffect(() => {
    localStorage.setItem(COMPLETED_CHECKOUT_KEY, "true");
  }, []);

  return null;
}
