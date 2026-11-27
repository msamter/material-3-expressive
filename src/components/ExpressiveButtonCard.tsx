import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

type DemoPhase = 'idle' | 'hover' | 'pressed' | 'released';

interface RippleWave {
  id: number;
  x: number;
  y: number;
}

interface ExpressiveButtonStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveButtonStage: React.FC<ExpressiveButtonStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');
  const [demoConfirmed, setDemoConfirmed] = useState(false);
  const [manualConfirmed, setManualConfirmed] = useState(false);
  const [isManualPressed, setIsManualPressed] = useState(false);
  const [ripples, setRipples] = useState<RippleWave[]>([]);

  const rippleCounter = useRef(0);
  const rippleTimersRef = useRef<Set<number>>(new Set());
  const confirmTimeoutRef = useRef<number | null>(null);
  const lastStatusRef = useRef('');

  const spawnRipple = useCallback((x = 50, y = 50) => {
    rippleCounter.current += 1;
    const id = rippleCounter.current;
    setRipples((prev) => [...prev.slice(-2), { id, x, y }]);
    const timerId = window.setTimeout(() => {
      rippleTimersRef.current.delete(timerId);
      setRipples((prev) => prev.filter((item) => item.id !== id));
    }, 680);
    rippleTimersRef.current.add(timerId);
  }, []);

  // Clean up all timers on unmount
  useEffect(() => {
    const timers = rippleTimersRef.current;
    return () => {
      if (confirmTimeoutRef.current !== null) {
        window.clearTimeout(confirmTimeoutRef.current);
      }
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  // Autonomous hover choreography isolated to demo-owned state so manual clicks are never clobbered
  useEffect(() => {
    if (!isDemoActive) {
      setDemoPhase('idle');
      setDemoConfirmed(false);
      return;
    }

    let timers: number[] = [];

    const runCycle = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setDemoPhase('hover');

      timers.push(
        window.setTimeout(() => {
          setDemoPhase('pressed');
          spawnRipple(50, 50);
        }, 420)
      );

      timers.push(
        window.setTimeout(() => {
          setDemoPhase('released');
          setDemoConfirmed(true);
        }, 980)
      );

      timers.push(
        window.setTimeout(() => {
          setDemoConfirmed(false);
          setDemoPhase('hover');
        }, 1950)
      );
    };

    runCycle();
    const interval = window.setInterval(runCycle, 2450);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setDemoPhase('idle');
      setDemoConfirmed(false);
    };
  }, [isDemoActive, spawnRipple]);

  const isPressed = isManualPressed || demoPhase === 'pressed';
  const isConfirmed = manualConfirmed || demoConfirmed;
  const isLifted = demoPhase === 'hover' || demoPhase === 'released';

  const currentRadius = isPressed ? 16 : isConfirmed ? 22 : 999;
  const currentScale = isPressed ? 0.94 : isLifted ? 1.03 : 1;

  useEffect(() => {
    const nextStatus = isPressed
      ? '16px · Squircle'
      : isConfirmed
      ? '22px · Active'
      : '999px · Pill';
    if (lastStatusRef.current !== nextStatus) {
      lastStatusRef.current = nextStatus;
      onStatusChange(nextStatus);
    }
  }, [isPressed, isConfirmed, onStatusChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    claimManualControl();
    setIsManualPressed(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spawnRipple(x, y);
  };

  const handlePointerUp = () => {
    setIsManualPressed(false);
  };

  const handleClick = () => {
    claimManualControl();
    if (confirmTimeoutRef.current !== null) {
      window.clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
    setManualConfirmed((prev) => {
      const next = !prev;
      if (next) {
        confirmTimeoutRef.current = window.setTimeout(() => {
          setManualConfirmed(false);
          confirmTimeoutRef.current = null;
        }, 2200);
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      claimManualControl();
      setIsManualPressed(true);
      spawnRipple(50, 50);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsManualPressed(false);
    }
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      <div className="relative flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[28px] bg-[var(--md-primary-container)]"
          animate={{
            opacity: isPressed ? 0.65 : isLifted ? 0.35 : 0,
            scale: isPressed ? 0.96 : isLifted ? 1.04 : 0.92,
            borderRadius: isPressed ? 24 : 999,
          }}
          transition={springTransition}
        />

        <motion.button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onFocus={claimManualControl}
          animate={{
            scale: currentScale,
            borderRadius: currentRadius,
            backgroundColor: isConfirmed
              ? 'var(--md-primary-container)'
              : 'var(--md-primary)',
            color: isConfirmed
              ? 'var(--md-on-primary-container)'
              : 'var(--md-on-primary)',
          }}
          whileHover={reducedMotion ? undefined : { scale: 1.03 }}
          whileTap={reducedMotion ? undefined : { scale: 0.94, borderRadius: 16 }}
          transition={springTransition}
          className="relative isolate overflow-hidden inline-flex items-center justify-center gap-3 min-h-[56px] px-7 sm:px-8 py-3.5 font-display text-[15px] sm:text-[16px] font-semibold tracking-[-0.01em] cursor-pointer select-none shadow-sm whitespace-nowrap shrink-0"
        >
          <AnimatePresence>
            {!reducedMotion &&
              ripples.map((ripple) => (
                <motion.span
                  key={ripple.id}
                  aria-hidden="true"
                  initial={{ scale: 0, opacity: 0.42 }}
                  animate={{ scale: 3.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    left: `${ripple.x}%`,
                    top: `${ripple.y}%`,
                  }}
                  className="pointer-events-none absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--md-on-primary)]/45"
                />
              ))}
          </AnimatePresence>

          <motion.span
            aria-hidden="true"
            animate={{ opacity: isPressed ? 0.14 : 0 }}
            transition={reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastEffects}
            className="pointer-events-none absolute inset-0 bg-[var(--md-on-primary)]"
          />

          <span className="relative z-10 flex h-5 w-5 items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              {isConfirmed ? (
                <motion.span
                  key="check"
                  initial={reducedMotion ? false : { scale: 0.5, rotate: -35, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={reducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                  transition={springTransition}
                >
                  <Check className="h-5 w-5" strokeWidth={2.4} />
                </motion.span>
              ) : (
                <motion.span
                  key="arrow"
                  initial={reducedMotion ? false : { scale: 0.6, rotate: 20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={reducedMotion ? undefined : { scale: 0.6, opacity: 0 }}
                  transition={springTransition}
                >
                  <ArrowUpRight className="h-5 w-5" strokeWidth={2.2} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          <span className="relative z-10">
            {isConfirmed ? 'Changes saved' : 'Save changes'}
          </span>
        </motion.button>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Shape morph</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums font-medium text-[var(--md-on-surface)]">
          {isPressed ? 'Scale 0.94 · R16' : isConfirmed ? 'Tonal · R22' : 'Scale 1.00 · Full'}
        </span>
      </div>
    </div>
  );
};

interface ExpressiveButtonCardProps {
  className?: string;
}

export const ExpressiveButtonCard: React.FC<ExpressiveButtonCardProps> = ({ className }) => {
  const [status, setStatus] = useState('999px · Pill');

  return (
    <BentoCard
      indexLabel="01"
      title="Expressive Button"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveButtonStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
