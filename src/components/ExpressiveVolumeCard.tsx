import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useAnimate } from 'motion/react';
import { Minus, Plus, Volume1, Volume2, VolumeX } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExpressiveVolumeStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveVolumeStage: React.FC<ExpressiveVolumeStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [level, setLevel] = useState(64);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const prevLevelRef = useRef(64);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const lastStatusRef = useRef('64%');
  const [iconScope, animateIcon] = useAnimate();

  useEffect(() => {
    const next = level === 0 ? 'Muted' : `${Math.round(level)}%`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [level, onStatusChange]);

  const triggerMuteShake = useCallback(() => {
    if (reducedMotion || !iconScope.current) return;
    animateIcon(
      iconScope.current,
      { x: [0, -4, 4, -2, 0] },
      { duration: 0.32, ease: 'easeInOut' }
    );
  }, [animateIcon, iconScope, reducedMotion]);

  const applyLevel = useCallback(
    (nextRaw: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(nextRaw)));
      const wasPositive = prevLevelRef.current > 0;
      prevLevelRef.current = clamped;
      setLevel(clamped);
      if (wasPositive && clamped === 0) {
        triggerMuteShake();
      }
    },
    [triggerMuteShake]
  );

  // Autonomous hover choreography: elastic volume sweep including mute bounce
  useEffect(() => {
    if (!isDemoActive) return;

    const steps = [82, 34, 0, 68];
    let idx = 0;

    const interval = window.setInterval(() => {
      const nextVal = steps[idx % steps.length];
      applyLevel(nextVal);
      idx += 1;
    }, 1150);

    return () => clearInterval(interval);
  }, [isDemoActive, applyLevel]);

  const updateFromPointerY = useCallback(
    (clientY: number) => {
      const el = pillRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) return;
      const pct = ((rect.bottom - clientY) / rect.height) * 100;
      applyLevel(pct);
    },
    [applyLevel]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    claimManualControl();
    draggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointerY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromPointerY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleStep = (delta: number) => {
    claimManualControl();
    applyLevel(prevLevelRef.current + delta);
  };

  const handleToggleMute = () => {
    claimManualControl();
    if (prevLevelRef.current > 0) {
      applyLevel(0);
    } else {
      applyLevel(64);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleStep(8);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStep(-8);
    }
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;
  const isMuted = level === 0;
  const Icon = isMuted ? VolumeX : level < 48 ? Volume1 : Volume2;

  return (
    <div className="flex items-center justify-center gap-6 w-full">
      {/* Vertical Chunky M3 Expressive Volume Pill */}
      <div
        ref={pillRef}
        role="slider"
        tabIndex={0}
        aria-label="Media volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onFocus={claimManualControl}
        style={{ borderRadius: isMuted ? 22 : 30 }}
        className={`relative h-[168px] w-[62px] overflow-hidden bg-[var(--md-surface-container-highest)] border cursor-pointer select-none touch-none shadow-xs transition-[border-radius,border-color,box-shadow] duration-200 ${
          isDragging
            ? 'border-[var(--md-primary)] ring-2 ring-[var(--md-primary)]/30'
            : 'border-[var(--md-outline-variant)]/65'
        }`}
      >
        {/* Rising GPU-Composited Elastic Level Fill */}
        <motion.div
          aria-hidden="true"
          animate={{ scaleY: level / 100 }}
          transition={isDragging ? { duration: 0 } : springTransition}
          style={{ transformOrigin: 'bottom center' }}
          className="pointer-events-none absolute inset-0 bg-[var(--md-primary)]"
        />

        {/* Non-Remounting Speaker Icon Anchored Near Base */}
        <div
          ref={iconScope}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center transition-colors duration-150 ${
            level > 18 ? 'text-[var(--md-on-primary)]' : 'text-[var(--md-on-surface-variant)]'
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>

      {/* Companion Tactile Stepper Controls */}
      <div className="flex flex-col items-start gap-2.5">
        <div className="space-y-0.5 select-none">
          <p className="font-display text-[26px] font-bold leading-none tabular-nums text-[var(--md-on-surface)]">
            {Math.round(level)}%
          </p>
          <p className="text-[12px] text-[var(--md-on-surface-variant)]">
            {isMuted ? 'Audio muted' : 'Media output'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStep(-15)}
            onFocus={claimManualControl}
            aria-label="Decrease volume"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] hover:brightness-95 active:scale-95 cursor-pointer transition-all"
          >
            <Minus className="h-4 w-4" strokeWidth={2.4} />
          </button>

          <button
            type="button"
            onClick={() => handleStep(15)}
            onFocus={claimManualControl}
            aria-label="Increase volume"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] hover:brightness-95 active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          onFocus={claimManualControl}
          className="inline-flex items-center justify-center min-h-[44px] lg:min-h-[34px] px-3.5 rounded-full border border-[var(--md-outline-variant)]/80 text-[12px] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)] active:scale-95 cursor-pointer select-none transition-all"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
};

interface ExpressiveVolumeCardProps {
  className?: string;
}

export const ExpressiveVolumeCard: React.FC<ExpressiveVolumeCardProps> = ({ className }) => {
  const [status, setStatus] = useState('64%');

  return (
    <BentoCard
      indexLabel="25"
      title="Expressive Volume Pill"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveVolumeStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
