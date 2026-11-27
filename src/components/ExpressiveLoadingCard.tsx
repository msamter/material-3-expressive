import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BentoCard } from './BentoCard';

interface ExpressiveShapeSpec {
  name: string;
  radii: Float32Array;
}

const SAMPLE_COUNT = 72;
const COS_TABLE = new Float32Array(SAMPLE_COUNT);
const SIN_TABLE = new Float32Array(SAMPLE_COUNT);

for (let i = 0; i < SAMPLE_COUNT; i += 1) {
  const theta = (i / SAMPLE_COUNT) * Math.PI * 2;
  COS_TABLE[i] = Math.cos(theta);
  SIN_TABLE[i] = Math.sin(theta);
}

function precomputeShape(name: string, sampleRadius: (theta: number) => number): ExpressiveShapeSpec {
  const radii = new Float32Array(SAMPLE_COUNT);
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const theta = (i / SAMPLE_COUNT) * Math.PI * 2;
    radii[i] = sampleRadius(theta);
  }
  return { name, radii };
}

/**
 * Precomputed 72-point polar profiles for authentic Material 3 Expressive LoadingIndicator shapes.
 * Zero trigonometry per animation frame for optimal 60fps performance.
 */
const EXPRESSIVE_SHAPES: ExpressiveShapeSpec[] = [
  precomputeShape('7-Sided Scallop', (theta) => 31.5 + 5.2 * Math.cos(7 * theta)),
  precomputeShape('Soft Burst', (theta) => 30.5 + 6.3 * Math.cos(10 * theta)),
  precomputeShape('Four-Leaf Clover', (theta) => 30 + 7.4 * Math.cos(4 * theta)),
  precomputeShape('Organic Pentagon', (theta) => 32.5 + 4.1 * Math.cos(5 * theta)),
  precomputeShape(
    'Expressive Squircle',
    (theta) => 31.5 + 4.8 * Math.cos(2 * theta) + 2.1 * Math.cos(4 * theta)
  ),
];

function buildInterpolatedShapePath(
  fromShape: ExpressiveShapeSpec,
  toShape: ExpressiveShapeSpec,
  t: number
): string {
  const fromR = fromShape.radii;
  const toR = toShape.radii;
  let path = '';
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const r = fromR[i] + (toR[i] - fromR[i]) * t;
    const x = 50 + COS_TABLE[i] * r;
    const y = 50 + SIN_TABLE[i] * r;
    path += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${path}Z`;
}

function springEaseOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped === 0 || clamped === 1) return clamped;
  const c4 = (2 * Math.PI) / 3.2;
  return Math.pow(2, -9 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;
}

const BAR_WIDTH = 216;

function buildLinearWavePath(width: number, phase: number, amplitude: number): string {
  if (width <= 2) return 'M0 6L0 6';
  let path = '';
  for (let x = 0; x <= width; x += 3) {
    const fade = Math.min(1, x / 8, (width - x) / 8);
    const y = 6 + Math.sin((x / 20) * Math.PI * 2 - phase) * amplitude * Math.max(0, fade);
    path += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  return path;
}

const INITIAL_SHAPE_PATH = buildInterpolatedShapePath(EXPRESSIVE_SHAPES[0], EXPRESSIVE_SHAPES[1], 0);
const INITIAL_WAVE_PATH = buildLinearWavePath((64 / 100) * BAR_WIDTH, 0, 1.2);

interface ExpressiveLoadingStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveLoadingStage: React.FC<ExpressiveLoadingStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [shapeName, setShapeName] = useState(EXPRESSIVE_SHAPES[0].name);
  const [isPlayingManual, setIsPlayingManual] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const shapePathRef = useRef<SVGPathElement | null>(null);
  const rotGroupRef = useRef<SVGGElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Mutable animation state (updated at 60fps with ZERO React re-renders)
  const animStateRef = useRef({
    shapeIndex: 0,
    baseRotation: 0,
    wavePhase: 0,
    progressPct: 64,
    lastReportedPct: 64,
    lastReportedName: EXPRESSIVE_SHAPES[0].name,
  });

  const isAccelerated = (isDemoActive || isPlayingManual) && !reducedMotion;

  // High-performance DOM-driven RAF loop that pauses automatically when off-screen or hidden
  useEffect(() => {
    if (reducedMotion) {
      const s = animStateRef.current;
      const staticPath = buildInterpolatedShapePath(
        EXPRESSIVE_SHAPES[s.shapeIndex],
        EXPRESSIVE_SHAPES[s.shapeIndex],
        0
      );
      shapePathRef.current?.setAttribute('d', staticPath);
      wavePathRef.current?.setAttribute(
        'd',
        buildLinearWavePath((s.progressPct / 100) * BAR_WIDTH, 0, 0)
      );
      return;
    }

    let rafId = 0;
    let isVisible = true;
    let stepStart = performance.now();
    let lastFrameTime = stepStart;

    const stepDurationMs = isAccelerated ? 880 : 2400;
    const morphWindowRatio = 0.62;

    const tick = (now: number) => {
      if (!isVisible || document.hidden) {
        lastFrameTime = now;
        rafId = 0;
        return;
      }

      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      const elapsed = now - stepStart;
      const s = animStateRef.current;

      if (elapsed >= stepDurationMs) {
        stepStart = now;
        s.baseRotation = (s.baseRotation + 72) % 36000;
        s.shapeIndex = (s.shapeIndex + 1) % EXPRESSIVE_SHAPES.length;
      }

      const rawFraction = Math.min(1, (now - stepStart) / stepDurationMs);
      const morphRaw = Math.min(1, rawFraction / morphWindowRatio);
      const eased = springEaseOut(morphRaw);

      const nextIndex = (s.shapeIndex + 1) % EXPRESSIVE_SHAPES.length;
      const d = buildInterpolatedShapePath(
        EXPRESSIVE_SHAPES[s.shapeIndex],
        EXPRESSIVE_SHAPES[nextIndex],
        eased
      );
      const rot = s.baseRotation + eased * 72 + rawFraction * (isAccelerated ? 18 : 8);

      s.wavePhase += dt * (isAccelerated ? 6.6 : 2.1);
      s.progressPct += dt * (isAccelerated ? 22 : 3.6);
      if (s.progressPct >= 100) s.progressPct = 18;

      const activeBarWidth = (s.progressPct / 100) * BAR_WIDTH;
      const waveD = buildLinearWavePath(
        activeBarWidth,
        s.wavePhase,
        isAccelerated ? 2.4 : 1.2
      );

      // Direct DOM attribute updates — zero React reconciliations per frame
      shapePathRef.current?.setAttribute('d', d);
      rotGroupRef.current?.setAttribute('transform', `rotate(${rot.toFixed(1)} 50 50)`);
      wavePathRef.current?.setAttribute('d', waveD);

      const displayIndex = eased > 0.5 ? nextIndex : s.shapeIndex;
      const nextName = EXPRESSIVE_SHAPES[displayIndex].name;
      if (s.lastReportedName !== nextName) {
        s.lastReportedName = nextName;
        setShapeName(nextName);
      }

      const roundedPct = Math.round(s.progressPct);
      if (s.lastReportedPct !== roundedPct) {
        s.lastReportedPct = roundedPct;
        progressBarRef.current?.setAttribute('aria-valuenow', String(roundedPct));
        onStatusChange(`${roundedPct}%`);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId === 0 && isVisible && !document.hidden) {
        lastFrameTime = performance.now();
        stepStart = lastFrameTime;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
          if (isVisible) startLoop();
          else stopLoop();
        },
        { threshold: 0.05 }
      );
      intersectionObserver.observe(containerRef.current);
    }

    document.addEventListener('visibilitychange', handleVisibility);
    startLoop();

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibility);
      intersectionObserver?.disconnect();
    };
  }, [isAccelerated, reducedMotion, onStatusChange]);

  const handleManualStep = useCallback(() => {
    claimManualControl();
    if (reducedMotion) {
      const s = animStateRef.current;
      s.shapeIndex = (s.shapeIndex + 1) % EXPRESSIVE_SHAPES.length;
      s.progressPct = s.progressPct >= 90 ? 25 : s.progressPct + 18;
      const nextShape = EXPRESSIVE_SHAPES[s.shapeIndex];
      shapePathRef.current?.setAttribute(
        'd',
        buildInterpolatedShapePath(nextShape, nextShape, 0)
      );
      wavePathRef.current?.setAttribute(
        'd',
        buildLinearWavePath((s.progressPct / 100) * BAR_WIDTH, 0, 0)
      );
      setShapeName(nextShape.name);
      onStatusChange(`${Math.round(s.progressPct)}%`);
      return;
    }
    setIsPlayingManual((prev) => !prev);
  }, [claimManualControl, reducedMotion, onStatusChange]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-5 w-full">
      {/* Interactive Contained M3 Expressive Morphing Loading Badge */}
      <button
        type="button"
        onClick={handleManualStep}
        onFocus={claimManualControl}
        aria-label={`Morphing loading indicator: ${shapeName}. Click to ${
          isPlayingManual ? 'slow down' : 'accelerate'
        }`}
        className="group/loader relative flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[var(--md-primary-container)] cursor-pointer select-none transition-transform duration-300 m3-spring hover:scale-[1.05] active:scale-[0.95]"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-[80px] w-[80px] overflow-visible"
          aria-hidden="true"
        >
          <g ref={rotGroupRef}>
            <path ref={shapePathRef} d={INITIAL_SHAPE_PATH} fill="var(--md-primary)" />
          </g>
        </svg>
      </button>

      {/* Wavy M3 Expressive Linear Progress Track */}
      <div className="flex flex-col items-center gap-2.5 w-full max-w-[228px]">
        <div
          ref={progressBarRef}
          role="progressbar"
          aria-label="Expressive progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={64}
          className="relative w-[216px] max-w-full h-3 flex items-center"
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[var(--md-secondary-container)]" />

          <svg
            width="100%"
            height={12}
            viewBox={`0 0 ${BAR_WIDTH} 12`}
            preserveAspectRatio="none"
            className="relative z-10 overflow-visible block"
            aria-hidden="true"
          >
            <path
              ref={wavePathRef}
              d={INITIAL_WAVE_PATH}
              fill="none"
              stroke="var(--md-primary)"
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
          <span className="font-medium text-[var(--md-on-surface)] whitespace-nowrap">
            {shapeName}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums whitespace-nowrap">
            {isAccelerated ? 'Expressive' : 'Ambient'}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ExpressiveLoadingCardProps {
  className?: string;
}

export const ExpressiveLoadingCard: React.FC<ExpressiveLoadingCardProps> = ({ className }) => {
  const [progressText, setProgressText] = useState('64%');

  return (
    <BentoCard
      indexLabel="06"
      title="Expressive Loading & Progress"
      readout={progressText}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveLoadingStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setProgressText}
        />
      )}
    </BentoCard>
  );
};
