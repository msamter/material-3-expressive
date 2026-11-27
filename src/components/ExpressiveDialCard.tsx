import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

const MIN_TEMP = 62;
const MAX_TEMP = 80;
const ARC_RADIUS = 58;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;
const SWEEP_RATIO = 260 / 360;
const SWEEP_LENGTH = ARC_CIRCUMFERENCE * SWEEP_RATIO;

interface ExpressiveDialStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveDialStage: React.FC<ExpressiveDialStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [temp, setTemp] = useState(71);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const lastStatusRef = useRef('71°F');

  useEffect(() => {
    const next = `${temp}°F`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [temp, onStatusChange]);

  // Autonomous hover choreography: sweep smoothly across climate setpoints
  useEffect(() => {
    if (!isDemoActive) return;

    const setpoints = [75, 68, 78, 71];
    let idx = 0;

    const interval = window.setInterval(() => {
      setTemp(setpoints[idx % setpoints.length]);
      idx += 1;
    }, 1150);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const updateTempFromPointer = useCallback((clientX: number, clientY: number) => {
    const el = dialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Angle in degrees [0, 360) where 0 = 3 o'clock, clockwise
    let deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    // Arc starts at 140° and sweeps 260° clockwise to 40° (140 -> 360 -> 40)
    let relative = (deg - 140 + 360) % 360;
    if (relative > 260) {
      // Snap dead-zone at bottom gap to nearest arc endpoint
      relative = relative > 310 ? 0 : 260;
    }
    const nextRatio = relative / 260;
    const nextTemp = Math.round(MIN_TEMP + nextRatio * (MAX_TEMP - MIN_TEMP));
    setTemp(nextTemp);
  }, []);

  const handleDialPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    claimManualControl();
    draggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateTempFromPointer(e.clientX, e.clientY);
  };

  const handleDialPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateTempFromPointer(e.clientX, e.clientY);
  };

  const handleDialPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleStep = (delta: number) => {
    claimManualControl();
    setTemp((prev) => Math.max(MIN_TEMP, Math.min(MAX_TEMP, prev + delta)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep(-1);
    }
  };

  const ratio = (temp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
  const activeLength = SWEEP_LENGTH * ratio;
  const thumbAngleDeg = 140 + ratio * 260;
  const thumbAngleRad = (thumbAngleDeg * Math.PI) / 180;
  const thumbX = 72 + Math.cos(thumbAngleRad) * ARC_RADIUS;
  const thumbY = 72 + Math.sin(thumbAngleRad) * ARC_RADIUS;

  const modeLabel = temp >= 75 ? 'Warm' : temp <= 67 ? 'Cool' : 'Balanced';
  const springTransition = reducedMotion
    ? M3_SPRINGS.instant
    : isDragging
    ? { duration: 0.05 }
    : M3_SPRINGS.defaultSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-2.5 w-full">
      {/* Interactive Wear OS 6 / Android 16 Expressive Rotary Arc Dial */}
      <div
        ref={dialRef}
        role="slider"
        tabIndex={0}
        aria-label="Climate setpoint dial"
        aria-valuemin={MIN_TEMP}
        aria-valuemax={MAX_TEMP}
        aria-valuenow={temp}
        onPointerDown={handleDialPointerDown}
        onPointerMove={handleDialPointerMove}
        onPointerUp={handleDialPointerUp}
        onPointerCancel={handleDialPointerUp}
        onKeyDown={handleKeyDown}
        onFocus={claimManualControl}
        className="relative flex h-[146px] w-[146px] items-center justify-center select-none cursor-pointer touch-none rounded-full"
      >
        <svg viewBox="0 0 144 144" className="h-full w-full overflow-visible" aria-hidden="true">
          <circle
            cx={72}
            cy={72}
            r={ARC_RADIUS}
            fill="none"
            stroke="var(--md-surface-container-highest)"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={`${SWEEP_LENGTH} ${ARC_CIRCUMFERENCE}`}
            transform="rotate(140 72 72)"
          />

          <motion.circle
            cx={72}
            cy={72}
            r={ARC_RADIUS}
            fill="none"
            stroke="var(--md-primary)"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={`${SWEEP_LENGTH} ${ARC_CIRCUMFERENCE}`}
            animate={{ strokeDashoffset: SWEEP_LENGTH - activeLength }}
            transition={springTransition}
            transform="rotate(140 72 72)"
          />

          <motion.circle
            r={isDragging ? 8.5 : 7.5}
            fill="var(--md-on-primary)"
            stroke="var(--md-primary)"
            strokeWidth={3.5}
            animate={{ cx: thumbX, cy: thumbY }}
            transition={springTransition}
          />
        </svg>

        <div className="pointer-events-none absolute flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] transition-transform duration-150">
          <span
            style={{
              fontFamily: '"Roboto Flex", system-ui, sans-serif',
              fontVariationSettings: '"wght" 780, "wdth" 110, "opsz" 48',
            }}
            className="text-[28px] leading-none tabular-nums"
          >
            {temp}°
          </span>
          <span className="text-[11px] font-medium opacity-80 mt-0.5">{modeLabel}</span>
        </div>
      </div>

      {/* Rotary Step Controls */}
      <div className="flex items-center gap-2.5">
        <motion.button
          type="button"
          onClick={() => handleStep(-2)}
          onFocus={claimManualControl}
          disabled={temp <= MIN_TEMP}
          aria-label="Decrease setpoint"
          whileTap={reducedMotion ? undefined : { scale: 0.9 }}
          transition={M3_SPRINGS.fastSpatial}
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] disabled:opacity-45 cursor-pointer"
        >
          <Minus className="h-4 w-4" strokeWidth={2.4} />
        </motion.button>

        <span className="text-[11.5px] font-medium tabular-nums text-[var(--md-on-surface-variant)] select-none min-w-[66px] text-center">
          {MIN_TEMP}°–{MAX_TEMP}°F
        </span>

        <motion.button
          type="button"
          onClick={() => handleStep(2)}
          onFocus={claimManualControl}
          disabled={temp >= MAX_TEMP}
          aria-label="Increase setpoint"
          whileTap={reducedMotion ? undefined : { scale: 0.9 }}
          transition={M3_SPRINGS.fastSpatial}
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] disabled:opacity-45 cursor-pointer"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </motion.button>
      </div>
    </div>
  );
};

interface ExpressiveDialCardProps {
  className?: string;
}

export const ExpressiveDialCard: React.FC<ExpressiveDialCardProps> = ({ className }) => {
  const [status, setStatus] = useState('71°F');

  return (
    <BentoCard
      indexLabel="30"
      title="Expressive Rotary Dial"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveDialStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
