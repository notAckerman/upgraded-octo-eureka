"use client";

/**
 * Lazy, isolated wrapper for the R1 hero scene.
 * - three/r3f loaded via next/dynamic ({ ssr: false }) so no 3D JS ships in the RSC payload
 * - poster is the Suspense fallback
 * - prefers-reduced-motion OR touch / <768px → poster only, no WebGL
 * - the live canvas is keyed by theme so blending/colors re-derive cleanly on toggle
 */

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Suspense, useEffect, useState } from "react";
import { HeroPoster } from "./hero-poster";

const NeuralLattice = dynamic(
  () => import("./neural-lattice").then((m) => m.NeuralLattice),
  { ssr: false, loading: () => null },
);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useIsSmallOrTouch() {
  const [small, setSmall] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    setSmall(mq.matches);
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return small;
}

export function HeroCanvas() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const small = useIsSmallOrTouch();

  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme !== "light";

  // Before mount, or when motion/size say so, show the static poster.
  const posterOnly = !mounted || reduced || small;

  return (
    <div className="absolute inset-0">
      {posterOnly ? (
        <HeroPoster dark={dark} />
      ) : (
        <Suspense fallback={<HeroPoster dark={dark} />}>
          <NeuralLattice key={dark ? "dark" : "light"} dark={dark} />
        </Suspense>
      )}
    </div>
  );
}