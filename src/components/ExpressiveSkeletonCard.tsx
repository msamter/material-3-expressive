import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Palette, RefreshCw } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface SkeletonBlockProps {
  className?: string;
  reducedMotion: boolean;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '', reducedMotion }) => (
  <div
    className={`relative overflow-hidden bg-[var(--md-surface-container-highest)] ${className}`}
  >
    {!reducedMotion && (
      <div
        aria-hidden="true"
        className="m3-skeleton-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-[var(--md-surface-container-lowest)]/65 to-transparent"
      />
    )}
  </div>
);

interface ExpressiveSkeletonStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveSkeletonStage: React.FC<ExpressiveSkeletonStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [manualLoaded, setManualLoaded] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const lastStatusRef = useRef('Loading');

  const isLoaded = manualLoaded || demoLoaded;

  useEffect(() => {
    const next = isLoaded ? 'Revealed' : 'Shimmering';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isLoaded, onStatusChange]);

  // Autonomous hover choreography: shimmer -> expressive spring content reveal -> shimmer
  useEffect(() => {
    if (!isDemoActive) {
      setDemoLoaded(false);
      return;
    }

    let timer: number | null = null;
    const runCycle = () => {
      if (timer !== null) window.clearTimeout(timer);
      setDemoLoaded(false);
      timer = window.setTimeout(() => {
        setDemoLoaded(true);
      }, 1350);
    };

    runCycle();
    const interval = window.setInterval(runCycle, 3200);

    return () => {
      clearInterval(interval);
      if (timer !== null) window.clearTimeout(timer);
      setDemoLoaded(false);
    };
  }, [isDemoActive]);

  const handleToggleState = () => {
    claimManualControl();
    setManualLoaded((prev) => (demoLoaded ? false : !prev));
    setDemoLoaded(false);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[300px]">
      {/* Skeleton-to-Content Surface Stage */}
      <div
        aria-live="polite"
        className="w-full rounded-[22px] border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container-low)] p-3.5 min-h-[154px] flex flex-col justify-between"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLoaded ? (
            <motion.div
              key="loaded"
              initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
              transition={springTransition}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={reducedMotion ? false : { scale: 0.78, borderRadius: 12 }}
                  animate={{ scale: 1, borderRadius: 16 }}
                  transition={springTransition}
                  className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]"
                >
                  <Palette className="h-5 w-5" strokeWidth={2} />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[14px] font-semibold text-[var(--md-on-surface)] truncate">
                    Adaptive Palette
                  </p>
                  <p className="text-[12px] text-[var(--md-on-surface-variant)] truncate">
                    Updated just now · 24 tokens
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[12.5px] leading-snug text-[var(--md-on-surface-variant)]">
                  Tonal surface roles calibrated for high legibility across light and dark modes.
                </p>
              </div>

              <div className="flex items-center justify-between pt-0.5 text-[11.5px] font-medium text-[var(--md-primary)]">
                <span>Ready to apply</span>
                <span className="tabular-nums text-[var(--md-on-surface-variant)]">4.5:1 AA</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="skeleton"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-label="Loading preview content"
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock
                  reducedMotion={reducedMotion}
                  className="h-10 w-10 shrink-0 rounded-[16px]"
                />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock reducedMotion={reducedMotion} className="h-3.5 w-3/4 rounded-full" />
                  <SkeletonBlock reducedMotion={reducedMotion} className="h-2.5 w-1/2 rounded-full" />
                </div>
              </div>

              <div className="space-y-2 pt-0.5">
                <SkeletonBlock reducedMotion={reducedMotion} className="h-3 w-full rounded-full" />
                <SkeletonBlock reducedMotion={reducedMotion} className="h-3 w-5/6 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <SkeletonBlock reducedMotion={reducedMotion} className="h-2.5 w-20 rounded-full" />
                <SkeletonBlock reducedMotion={reducedMotion} className="h-2.5 w-12 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Toggle Control */}
      <button
        type="button"
        onClick={handleToggleState}
        onFocus={claimManualControl}
        className="inline-flex items-center justify-center gap-2 min-h-[44px] lg:min-h-[38px] px-4 rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] font-display text-[12.5px] font-semibold cursor-pointer select-none whitespace-nowrap hover:brightness-95 transition-all duration-150"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 transition-transform duration-300 m3-spring ${
            isLoaded ? 'rotate-180' : 'rotate-0'
          }`}
          strokeWidth={2.2}
        />
        <span>{isLoaded ? 'Replay skeleton' : 'Reveal content'}</span>
      </button>
    </div>
  );
};

interface ExpressiveSkeletonCardProps {
  className?: string;
}

export const ExpressiveSkeletonCard: React.FC<ExpressiveSkeletonCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Shimmering');

  return (
    <BentoCard
      indexLabel="06"
      title="Skeleton Loading"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveSkeletonStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
