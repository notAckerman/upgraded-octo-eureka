"use client";

/**
 * R3 · "Token Stream" — a tiny 3D scene for the bento streaming cell.
 * Particles flow left→right along a gentle CatmullRom curve, sized and
 * colored like tokens streaming out of an API. No postprocessing —
 * the glow is faked with soft point sprites + additive blending so it
 * stays cheap inside a small card.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLES = 90;
const CURVE_SAMPLES = 140;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.6, -0.28, 0),
    new THREE.Vector3(-1.4, 0.22, 0.35),
    new THREE.Vector3(-0.3, -0.18, -0.3),
    new THREE.Vector3(0.9, 0.26, 0.3),
    new THREE.Vector3(1.9, -0.12, -0.2),
    new THREE.Vector3(2.6, 0.18, 0),
  ]);
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aBright;
  uniform float uDpr;
  varying float vBright;
  void main() {
    vBright = aBright;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uDpr * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uHotColor;
  varying float vBright;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.0, d);
    // soft core + halo
    float core = smoothstep(0.22, 0.0, d);
    vec3 color = mix(uColor, uHotColor, vBright);
    float alpha = disc * (0.24 + vBright * 0.7) + core * vBright * 0.5;
    gl_FragColor = vec4(color * (0.9 + vBright), alpha);
  }
`;

function Stream({ dark }: { dark: boolean }) {
  const curve = useMemo(buildCurve, []);
  const posRef = useRef<THREE.BufferAttribute>(null);
  const brightRef = useRef<THREE.BufferAttribute>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1;

  const { positions, sizes, brights, speeds, phases, wobble, curveLine } =
    useMemo(() => {
      const rand = mulberry32(31337);
      const positions = new Float32Array(PARTICLES * 3);
      const sizes = new Float32Array(PARTICLES);
      const brights = new Float32Array(PARTICLES);
      const speeds = new Float32Array(PARTICLES);
      const phases = new Float32Array(PARTICLES);
      const wobble = new Float32Array(PARTICLES);
      for (let i = 0; i < PARTICLES; i++) {
        sizes[i] = 1.1 + rand() * 2.0;
        speeds[i] = 0.07 + rand() * 0.09;
        phases[i] = rand();
        wobble[i] = rand() * Math.PI * 2;
        brights[i] = 0;
      }
      const pts = curve.getPoints(CURVE_SAMPLES);
      const curveLine = new Float32Array(pts.length * 3);
      pts.forEach((p, i) => {
        curveLine[i * 3] = p.x;
        curveLine[i * 3 + 1] = p.y;
        curveLine[i * 3 + 2] = p.z;
      });
      return { positions, sizes, brights, speeds, phases, wobble, curveLine };
    }, [curve]);

  const uniforms = useMemo(
    () => ({
      uDpr: { value: dpr },
      uColor: {
        value: dark ? new THREE.Color("#3f8ba6") : new THREE.Color("#41708a"),
      },
      uHotColor: {
        value: dark ? new THREE.Color("#a5ecff") : new THREE.Color("#0e7fa8"),
      },
    }),
    [dark, dpr],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  const guide = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(curveLine, 3));
    const mat = new THREE.LineBasicMaterial({
      color: dark ? "#2c6076" : "#8fb0c2",
      transparent: true,
      opacity: dark ? 0.22 : 0.35,
      depthWrite: false,
    });
    return new THREE.Line(geo, mat);
  }, [curveLine, dark]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const posAttr = posRef.current;
    const brightAttr = brightRef.current;
    if (!posAttr || !brightAttr) return;
    for (let i = 0; i < PARTICLES; i++) {
      const u = (t * speeds[i] + phases[i]) % 1;
      curve.getPointAt(u, tmp);
      const w = 0.05 * Math.sin(t * 1.4 + wobble[i]);
      positions[i * 3] = tmp.x;
      positions[i * 3 + 1] = tmp.y + w;
      positions[i * 3 + 2] = tmp.z + 0.04 * Math.cos(t * 1.1 + wobble[i]);
      // brightest mid-flight, fading in/out at the ends
      const edge = Math.min(u, 1 - u);
      brights[i] = Math.min(1, edge * 8) * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + wobble[i])));
    }
    posAttr.needsUpdate = true;
    brightAttr.needsUpdate = true;
  });

  return (
    <group rotation={[0.12, 0, 0]}>
      {/* faint guide curve */}
      <primitive object={guide} />
      <points>
        <bufferGeometry>
          <bufferAttribute
            ref={posRef}
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute
            ref={brightRef}
            attach="attributes-aBright"
            args={[brights, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

export function TokenStream({ dark = true }: { dark?: boolean }) {
  return (
    <Canvas
      camera={{ fov: 30, position: [0, 0, 2.0] }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Stream dark={dark} />
    </Canvas>
  );
}

export default TokenStream;
