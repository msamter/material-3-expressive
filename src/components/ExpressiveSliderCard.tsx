import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExpressiveSliderStageProps {
  isDemoActive: boolean;
  isHovered: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onValueChange: (val: number) => void;
}

/**
 * Generates an SVG wavy path for the active M3 Expressive slider track
 */
function buildWavyPath(width: number, amplitude: number, wavelength: number, phase: number): string {
  if (width <= 2) return 'M 0 8 L 0 8';
  const step = 3;
  const centerY = 8;
  const points: string[] = [];
  for (let x = 0; x <= width; x += step) {
    const edgeFade = Math.min(1, x / 10, (width - x) / 10);
    const y =
      centerY +
      Math.sin((x / wavelength) * Math.PI * 2 - phase) * amplitude * Math.max(0, edgeFade);
    points.push(`${x === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`);
  }
  return points.join(' ');
}

const ExpressiveSliderStage: React.FC<ExpressiveSliderStageProps> = ({
  isDemoActive,
  isHovered,
  claimManualControl,
  reducedMotion,
  onValueChange,
}) => {
  const [value, setValue] = useState(58);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const [wavePhase, setWavePhase] = useState(0);
  const [trackWidth, setTrackWidth] = useState(260);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const lastReportedRef = useRef(58);
  const labelId = useId();

  // Only notify parent when rounded integer percentage changes
  useEffect(() => {
    const rounded = Math.round(value);
    if (lastReportedRef.current !== rounded) {
      lastReportedRef.current = rounded;
      onValueChange(rounded);
    }
  }, [value, onValueChange]);

  // Measure track width before paint to avoid initial layout flash
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const updateWidth = () => {
      const next = el.getBoundingClientRect().width;
      if (next > 0) setTrackWidth(next);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autonomous hover choreography: smoothly glide across values + animate wavy track phase
  useEffect(() => {
    if (!isDemoActive) return;

    const waypoints = [30, 82, 52, 92, 30];
    const segmentDuration = 1250;
    let rafId = 0;
    let startTime: number | null = null;
    const initialValue = valueRef.current;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const totalCycle = segmentDuration * (waypoints.length - 1);
      const cyclePos = elapsed % totalCycle;
      const segIndex = Math.floor(cyclePos / segmentDuration);
      const localT = (cyclePos % segmentDuration) / segmentDuration;

      const from = elapsed < segmentDuration ? initialValue : waypoints[segIndex];
      const to = waypoints[segIndex + 1];
      const nextVal = from + (to - from) * easeInOutCubic(localT);

      setValue(nextVal);
      setWavePhase((elapsed / 1000) * 5.2);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isDemoActive]);

  // Gentle wave flow while manually dragging
  useEffect(() => {
    if (!isDragging || reducedMotion) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setWavePhase((prev) => prev + dt * 5.5);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isDragging, reducedMotion]);

  const updateValueFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, pct));
    setValue(clamped);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    claimManualControl();
    draggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateValueFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateValueFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 2;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -2;
    else if (e.key === 'PageUp') delta = 10;
    else if (e.key === 'PageDown') delta = -10;
    else if (e.key === 'Home') {
      e.preventDefault();
      claimManualControl();
      setValue(0);
      return;
    } else if (e.key === 'End') {
      e.preventDefault();
      claimManualControl();
      setValue(100);
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      claimManualControl();
      setValue((prev) => Math.max(0, Math.min(100, Math.round(prev + delta))));
    }
  };

  const roundedValue = Math.round(value);
  const thumbX = (value / 100) * trackWidth;
  const thumbGap = 9;
  const activeWidth = Math.max(0, thumbX - thumbGap);
  const inactiveStart = Math.min(trackWidth, thumbX + thumbGap);
  const inactiveWidth = Math.max(0, trackWidth - inactiveStart);
  const showIndicator = isDragging || isDemoActive || isHovered;
  const waveAmp = reducedMotion ? 0 : isDragging || isDemoActive ? 2.6 : 1.4;
  const activeWavePath = buildWavyPath(activeWidth, waveAmp, 28, wavePhase);

  // Clamp tooltip center inside track bounds so 0% and 100% never clip on narrow screens
  const indicatorLeftPx = Math.max(22, Math.min(trackWidth - 22, thumbX));
  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="w-full max-w-[360px] px-2 pt-8 pb-1 flex flex-col gap-3">
      <span id={labelId} className="sr-only">
        Expressive Slider Value
      </span>

      {/* Interactive Slider Track Region (touch-none prevents mobile scroll hijacking while dragging) */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={roundedValue}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onFocus={claimManualControl}
        className="relative flex items-center h-12 w-full cursor-pointer select-none touch-none rounded-xl"
      >
        {/* Floating Value Indicator Pill */}
        <motion.div
          aria-hidden="true"
          style={{ left: `${indicatorLeftPx}px` }}
          animate={{
            opacity: showIndicator ? 1 : 0.92,
            y: showIndicator ? -38 : -33,
            scale: isDragging || isDemoActive ? 1.06 : 0.98,
          }}
          transition={springTransition}
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--md-inverse-surface)] text-[var(--md-inverse-on-surface)] px-3 py-1 text-[12px] font-semibold tabular-nums shadow-sm whitespace-nowrap"
        >
          {roundedValue}%
        </motion.div>

        {/* Active Thick / Wavy Track (Left of Handle) */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 overflow-visible"
          style={{ width: `${activeWidth}px` }}
        >
          {activeWidth > 4 && (
            <svg
              width={activeWidth}
              height={16}
              viewBox={`0 0 ${activeWidth} 16`}
              className="overflow-visible block"
            >
              <path
                d={activeWavePath}
                fill="none"
                stroke="var(--md-primary)"
                strokeWidth={11}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Inactive Thick Rounded Track (Right of Handle) */}
        <div
          aria-hidden="true"
          style={{
            left: `${inactiveStart}px`,
            width: `${inactiveWidth}px`,
          }}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 rounded-l-[4px] rounded-r-full bg-[var(--md-secondary-container)] flex items-center justify-end pr-1.5 transition-colors duration-200"
        >
          {inactiveWidth > 16 && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--md-primary)]/80" />
          )}
        </div>

        {/* M3 Expressive Tall Vertical Pill Thumb Handle */}
        <motion.div
          aria-hidden="true"
          style={{ left: `${thumbX}px` }}
          animate={{
            width: isDragging || isDemoActive ? 5 : 6,
            height: isDragging || isDemoActive ? 46 : 42,
          }}
          transition={springTransition}
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--md-primary)] shadow-sm"
        />
      </div>

      {/* Quiet unboxed min / max scale markers */}
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-[var(--md-on-surface-variant)] tabular-nums select-none">
        <span className="shrink-0">0%</span>
        <span className="truncate">Wavy track · Vertical handle</span>
        <span className="shrink-0">100%</span>
      </div>
    </div>
  );
};

interface ExpressiveSliderCardProps {
  className?: string;
}

export const ExpressiveSliderCard: React.FC<ExpressiveSliderCardProps> = ({ className }) => {
  const [sliderValue, setSliderValue] = useState(58);

  return (
    <BentoCard
      indexLabel="03"
      title="Expressive Slider"
      readout={`${sliderValue}%`}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, isHovered, claimManualControl, reducedMotion }) => (
        <ExpressiveSliderStage
          isDemoActive={isDemoActive}
          isHovered={isHovered}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onValueChange={setSliderValue}
        />
      )}
    </BentoCard>
  );
};
