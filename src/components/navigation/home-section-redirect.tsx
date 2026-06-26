"use client";

import { useEffect } from "react";

/** Sends visitors to a homepage section — keeps one-page Glam Room experience. */
export function HomeSectionRedirect({ sectionId }: { sectionId: string }) {
  useEffect(() => {
    window.location.replace(`/#${sectionId}`);
  }, [sectionId]);

  return null;
}
