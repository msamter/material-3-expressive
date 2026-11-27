import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import { Bell, Plus, RotateCcw } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExpressiveBadgeStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveBadgeStage: React.FC<ExpressiveBadgeStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [count, setCount] = useState(3);
  const lastStatusRef = useRef('3 unread');
  const [bellScope, animateBell] = useAnimate();

  const displayCount = count > 99 ? '99+' : String(count);

  useEffect(() => {
    const next = count === 0 ? 'All read' : `${displayCount} unread`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [count, displayCount, onStatusChange]);

  const ringBell = useCallback(() => {
    if (reducedMotion || !bellScope.current) return;
    animateBell(
      bellScope.current,
      { rotate: [0, -18, 15, -10, 5, 0] },
      { duration: 0.48, ease: 'easeInOut' }
    );
  }, [animateBell, bellScope, reducedMotion]);

  // Autonomous hover choreography: increment badge through single, double, and overflow states
  useEffect(() => {
    if (!isDemoActive) return;

    const sequence = [4, 12, 100, 0, 3];
    let idx = 0;

    const interval = window.setInterval(() => {
      const next = sequence[idx % sequence.length];
      setCount(next);
      if (next > 0) ringBell();
      idx += 1;
    }, 1100);

    return () => clearInterval(interval);
  }, [isDemoActive, ringBell]);

  const handleIncrement = () => {
    claimManualControl();
    setCount((prev) => (prev >= 100 ? 1 : prev + 1));
    ringBell();
  };

  const handleClear = () => {
    claimManualControl();
    setCount(0);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      {/* Bell Squircle Surface + Morphing Expanding Counter Badge */}
      <div className="relative flex items-center justify-center">
        <motion.button
          type="button"
          onClick={handleIncrement}
          onFocus={claimManualControl}
          aria-label={`Notifications: ${count === 0 ? 'none' : displayCount}. Click to add one`}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={reducedMotion ? undefined : { scale: 0.93 }}
          transition={springTransition}
          className="relative flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] border border-[var(--md-outline-variant)]/70 cursor-pointer select-none shadow-xs"
        >
          <span
            ref={bellScope}
            style={{ transformOrigin: '50% 15%' }}
            className="flex items-center justify-center"
          >
            <Bell className="h-7 w-7" strokeWidth={2} />
          </span>
        </motion.button>

        {/* Elastic Expanding Pill Counter Badge (no nested popLayout/layout conflicts) */}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={reducedMotion ? { opacity: 1 } : { scale: 0.35, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.35, opacity: 0 }}
              transition={springTransition}
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 -right-3 inline-flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] font-display text-[12px] font-bold tabular-nums ring-[3px] ring-[var(--bento-card-bg,var(--md-surface-container-low))] shadow-sm overflow-hidden transition-[min-width,padding] duration-200"
            >
              <motion.span
                key={displayCount}
                initial={reducedMotion ? false : { y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                className="leading-none"
              >
                {displayCount}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Direct Interactive Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleIncrement}
          onFocus={claimManualControl}
          className="inline-flex items-center gap-1.5 min-h-[44px] lg:min-h-[36px] px-4 rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-display text-[12.5px] font-semibold cursor-pointer select-none whitespace-nowrap hover:brightness-95 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
          <span>Notify</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          onFocus={claimManualControl}
          disabled={count === 0}
          className="inline-flex items-center gap-1.5 min-h-[44px] lg:min-h-[36px] px-3.5 rounded-full border border-[var(--md-outline-variant)]/80 text-[var(--md-on-surface)] font-display text-[12.5px] font-medium cursor-pointer select-none whitespace-nowrap disabled:opacity-45 disabled:cursor-default hover:bg-[var(--md-surface-container-highest)] active:scale-95 transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.1} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};

interface ExpressiveBadgeCardProps {
  className?: string;
}

export const ExpressiveBadgeCard: React.FC<ExpressiveBadgeCardProps> = ({ className }) => {
  const [status, setStatus] = useState('3 unread');

  return (
    <BentoCard
      indexLabel="29"
      title="Expressive Badge Counter"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveBadgeStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
