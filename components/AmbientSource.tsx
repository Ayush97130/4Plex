"use client";

import { useEffect } from "react";
import { publishAmbient } from "@/lib/ambient";

export default function AmbientSource({ image }: { image: string | null }) {
  useEffect(() => {
    publishAmbient(image);
  }, [image]);
  return null;
}
