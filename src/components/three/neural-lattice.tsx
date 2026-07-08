"use client";

/**
 * R1 · "Neural Lattice" — the landing hero signature scene, v2.
 * A cinematic constellation:
 *  - ~1400 points on a lightly jittered Fibonacci sphere
 *  - shaderized links with traveling impulses (signals hopping between nodes)
 *  - a soft glowing nucleus at the core
 *  - a sparse outer dust shell counter-rotating for depth parallax
 *  - slow Y spin + a subtle breathing scale, pointer parallax (yaw + pitch only)
 * Depth fades the far side into --bg. `dark` re-derives blending and colors per theme.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const POINT_COUNT = 1400;
const SPHERE_RADIUS = 2.45;
const NEIGHBOR_DIST = 0.52;
const MAX_LINKS_PER_NODE = 6;
const PULSE_FRACTION = 0.05;
const IMPULSE_FRACTION = 0.3; // share of links carrying a traveling signal
const DUST_COUNT = 340;
const PARALLAX = (3.5 * Math.PI) / 180; // 3.5 degrees, pitch/yaw only

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface LatticeData {
  positions: Float32Array;
  phases: Float32Array;
  scales: Float32Array;
  pulse: Float32Array;
  linePositions: Float32Array;
  lineT: Float32Array;
  lineSeed: Float32Array;
  lineActive: Float32Array;
  dustPositions: Float32Array;
  dustPhases: Float32Array;
}

function buildLattice(): LatticeData {
  const rand = mulberry32(20260708);
  const positions = new Float32Array(POINT_COUNT * 3);
  const phases = new Float32Array(POINT_COUNT);
  const scales = new Float32Array(POINT_COUNT);
  const pulse = new Float32Array(POINT_COUNT);
  const pts: THREE.Vector3[] = [];

  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (i / (POINT_COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const j = 0.02;
    const v = new THREE.Vector3(
      (Math.cos(theta) * r + (rand() - 0.5) * j) * SPHERE_RADIUS,
      (y + (rand() - 0.5) * j) * SPHERE_RADIUS,
      (Math.sin(theta) * r + (rand() - 0.5) * j) * SPHERE_RADIUS,
    );
    pts.push(v);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
    phases[i] = rand();
    scales[i] = 0.7 + rand() * 0.7;
    pulse[i] = rand() < PULSE_FRACTION ? 1 : 0;
  }

  const linkPairs: number[] = [];
  const linkCount = new Int16Array(POINT_COUNT);
  for (let i = 0; i < POINT_COUNT; i++) {
    if (linkCount[i] >= MAX_LINKS_PER_NODE) continue;
    for (let jj = i + 1; jj < POINT_COUNT; jj++) {
      if (linkCount[i] >= MAX_LINKS_PER_NODE) break;
      if (linkCount[jj] >= MAX_LINKS_PER_NODE) continue;
      if (pts[i].distanceTo(pts[jj]) < NEIGHBOR_DIST) {
        linkPairs.push(i, jj);
        linkCount[i]++;
        linkCount[jj]++;
      }
    }
  }

  const linkTotal = linkPairs.length / 2;
  const linePositions = new Float32Array(linkPairs.length * 3);
  const lineT = new Float32Array(linkPairs.length);
  const lineSeed = new Float32Array(linkPairs.length);
  const lineActive = new Float32Array(linkPairs.length);

  for (let l = 0; l < linkTotal; l++) {
    const seed = rand();
    const active = rand() < IMPULSE_FRACTION ? 1 : 0;
    for (let e = 0; e < 2; e++) {
      const k = l * 2 + e;
      const idx = linkPairs[k];
      linePositions[k * 3] = positions[idx * 3];
      linePositions[k * 3 + 1] = positions[idx * 3 + 1];
      linePositions[k * 3 + 2] = positions[idx * 3 + 2];
      lineT[k] = e;
      lineSeed[k] = seed;
      lineActive[k] = active;
    }
  }

  // sparse outer dust shell for depth parallax
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustPhases = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const rr = Math.sqrt(1 - u * u);
    const radius = 3.3 + rand() * 2.4;
    dustPositions[i * 3] = Math.cos(t) * rr * radius;
    dustPositions[i * 3 + 1] = u * radius;
    dustPositions[i * 3 + 2] = Math.sin(t) * rr * radius;
    dustPhases[i] = rand();
  }

  return {
    positions,
    phases,
    scales,
    pulse,
    linePositions,
    lineT,
    lineSeed,
    lineActive,
    dustPositions,
    dustPhases,
  };
}

const POINT_VERT = /* glsl */ `
  attribute float aPhase;
  attribute float aScale;
  attribute float aPulse;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  varying float vGlow;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = aPulse * (0.5 + 0.5 * sin(uTime * 1.5 + aPhase * 6.2831853));
    vGlow = pulse;
    vDepth = clamp((-mv.z - 4.4) / 5.4, 0.0, 1.0);
    float size = uSize * aScale * (1.0 + pulse * 1.8);
    gl_PointSize = size * uDpr * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uPulseColor;
  uniform float uBaseAlpha;
  varying float vGlow;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColor, uPulseColor, vGlow);
    float depthFade = mix(1.0, 0.28, vDepth);
    float alpha = disc * (uBaseAlpha + vGlow * 0.6) * depthFade;
    gl_FragColor = vec4(color * (0.8 + vGlow * 0.9), alpha);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  attribute float aActive;
  varying float vT;
  varying float vSeed;
  varying float vActive;
  varying float vDepth;
  void main() {
    vT = aT;
    vSeed = aSeed;
    vActive = aActive;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = clamp((-mv.z - 4.4) / 5.4, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const LINE_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uPulseColor;
  uniform float uBaseAlpha;
  varying float vT;
  varying float vSeed;
  varying float vActive;
  varying float vDepth;
  void main() {
    // traveling impulse position along the segment (staggered per link)
    float speed = 0.14 + vSeed * 0.2;
    float head = fract(uTime * speed + vSeed * 13.7);
    float d = abs(vT - head);
    float impulse = exp(-d * d * 90.0) * vActive;
    float depthFade = mix(1.0, 0.18, vDepth);
    vec3 color = mix(uColor, uPulseColor, impulse);
    float alpha = (uBaseAlpha + impulse * 0.5) * depthFade;
    gl_FragColor = vec4(color * (1.0 + impulse * 0.7), alpha);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aPhase;
  uniform float uTime;
  uniform float uDpr;
  varying float vTwinkle;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vTwinkle = 0.5 + 0.5 * sin(uTime * 0.6 + aPhase * 6.2831853);
    vDepth = clamp((-mv.z - 3.0) / 9.0, 0.0, 1.0);
    gl_PointSize = (1.6 + aPhase * 2.2) * uDpr * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uBaseAlpha;
  varying float vTwinkle;
  varying float vDepth;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.0, d);
    float alpha = disc * uBaseAlpha * (0.35 + vTwinkle * 0.65) * mix(1.0, 0.15, vDepth);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function LatticeCloud({ dark }: { dark: boolean }) {
  const data = useMemo(buildLattice, []);
  const spin = useRef<THREE.Group>(null);
  const dustSpin = useRef<THREE.Group>(null);
  const breathe = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const pointMat = useRef<THREE.ShaderMaterial>(null);
  const lineMat = useRef<THREE.ShaderMaterial>(null);
  const dustMat = useRef<THREE.ShaderMaterial>(null);
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.75) : 1;

  const pointUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: dark ? 6.5 : 5.5 },
      uDpr: { value: dpr },
      uColor: {
        value: dark ? new THREE.Color("#6bd0e8") : new THREE.Color("#1d3d52"),
      },
      uPulseColor: {
        value: dark ? new THREE.Color("#b8f0ff") : new THREE.Color("#0e7fa8"),
      },
      uBaseAlpha: { value: dark ? 0.6 : 0.72 },
    }),
    [dark, dpr],
  );

  const lineUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: {
        value: dark ? new THREE.Color("#2c6076") : new THREE.Color("#8fb0c2"),
      },
      uPulseColor: {
        value: dark ? new THREE.Color("#a5ecff") : new THREE.Color("#0e7fa8"),
      },
      uBaseAlpha: { value: dark ? 0.14 : 0.24 },
    }),
    [dark],
  );

  const dustUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: dpr },
      uColor: {
        value: dark ? new THREE.Color("#4c9ab5") : new THREE.Color("#5b7f94"),
      },
      uBaseAlpha: { value: dark ? 0.4 : 0.45 },
    }),
    [dark, dpr],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (pointMat.current) pointMat.current.uniforms.uTime.value = t;
    if (lineMat.current) lineMat.current.uniforms.uTime.value = t;
    if (dustMat.current) dustMat.current.uniforms.uTime.value = t;
    if (spin.current) spin.current.rotation.y += delta * 0.05;
    if (dustSpin.current) dustSpin.current.rotation.y -= delta * 0.016;
    if (breathe.current) {
      const s = 1 + Math.sin(t * 0.35) * 0.015;
      breathe.current.scale.setScalar(s);
    }
    if (parallax.current) {
      // pitch (x) + yaw (y) only — no roll, so it never looks tilted
      const tx = -state.pointer.y * PARALLAX;
      const ty = state.pointer.x * PARALLAX;
      parallax.current.rotation.x += (tx - parallax.current.rotation.x) * 0.05;
      parallax.current.rotation.y += (ty - parallax.current.rotation.y) * 0.05;
    }
  });

  const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;

  return (
    <group ref={parallax}>
      {/* outer dust shell, counter-rotating for depth parallax */}
      <group ref={dustSpin}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[data.dustPositions, 3]}
            />
            <bufferAttribute
              attach="attributes-aPhase"
              args={[data.dustPhases, 1]}
            />
          </bufferGeometry>
          <shaderMaterial
            ref={dustMat}
            vertexShader={DUST_VERT}
            fragmentShader={DUST_FRAG}
            uniforms={dustUniforms}
            transparent
            depthWrite={false}
            blending={blending}
          />
        </points>
      </group>

      <group ref={breathe}>
        <group ref={spin}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[data.linePositions, 3]}
              />
              <bufferAttribute attach="attributes-aT" args={[data.lineT, 1]} />
              <bufferAttribute
                attach="attributes-aSeed"
                args={[data.lineSeed, 1]}
              />
              <bufferAttribute
                attach="attributes-aActive"
                args={[data.lineActive, 1]}
              />
            </bufferGeometry>
            <shaderMaterial
              ref={lineMat}
              vertexShader={LINE_VERT}
              fragmentShader={LINE_FRAG}
              uniforms={lineUniforms}
              transparent
              depthWrite={false}
              blending={blending}
            />
          </lineSegments>

          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[data.positions, 3]}
              />
              <bufferAttribute
                attach="attributes-aPhase"
                args={[data.phases, 1]}
              />
              <bufferAttribute
                attach="attributes-aScale"
                args={[data.scales, 1]}
              />
              <bufferAttribute
                attach="attributes-aPulse"
                args={[data.pulse, 1]}
              />
            </bufferGeometry>
            <shaderMaterial
              ref={pointMat}
              vertexShader={POINT_VERT}
              fragmentShader={POINT_FRAG}
              uniforms={pointUniforms}
              transparent
              depthWrite={false}
              blending={blending}
            />
          </points>
        </group>
      </group>
    </group>
  );
}

export function NeuralLattice({ dark = true }: { dark?: boolean }) {
  const bg = dark ? "#0a0d12" : "#f4f2ec";

  return (
    <Canvas
      camera={{ fov: 34, position: [0, 0, 7] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <fog attach="fog" args={[bg, 6, 11]} />
      <LatticeCloud dark={dark} />
      <EffectComposer>
        <Bloom
          intensity={dark ? 0.75 : 0.3}
          luminanceThreshold={dark ? 0.5 : 0.62}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.32} darkness={dark ? 0.55 : 0.25} />
      </EffectComposer>
    </Canvas>
  );
}

export default NeuralLattice;
