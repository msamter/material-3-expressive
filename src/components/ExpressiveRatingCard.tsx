import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

const RATING_LABELS = ['Needs work', 'Fair', 'Good', 'Great', 'Exceptional'];

interface ExpressiveRatingStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveRatingStage: React.FC<ExpressiveRatingStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [rating, setRating] = useState(4);
  const [burstTick, setBurstTick] = useState(0);
  const lastStatusRef = useRef('4 / 5');

  useEffect(() => {
    const next = `${rating} / 5`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [rating, onStatusChange]);

  // Autonomous hover choreography: cascade ratings across stars
  useEffect(() => {
    if (!isDemoActive) return;

    const sequence = [5, 3, 4, 5];
    let step = 0;

    const interval = window.setInterval(() => {
      setRating(sequence[step % sequence.length]);
      setBurstTick((prev) => prev + 1);
      step += 1;
    }, 1150);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelect = (nextValue: number) => {
    claimManualControl();
    setRating(nextValue);
    setBurstTick((prev) => prev + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleSelect(Math.min(5, rating + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleSelect(Math.max(1, rating - 1));
    }
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      {/* Expressive Tonal Star Burst Pill */}
      <div
        role="radiogroup"
        aria-label="Experience rating"
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] p-1.5 shadow-xs"
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= rating;
          const isSelectedTip = starValue === rating;

          return (
            <motion.button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={isSelectedTip}
              aria-label={`Rate ${starValue} out of 5`}
              onClick={() => handleSelect(starValue)}
              onFocus={claimManualControl}
              whileHover={reducedMotion ? undefined : { scale: 1.14 }}
              whileTap={reducedMotion ? undefined : { scale: 0.86 }}
              transition={springTransition}
              className="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full cursor-pointer select-none"
            >
              {/* Subtle tonal ring burst on newly selected rating tip */}
              <AnimatePresence>
                {!reducedMotion && isSelectedTip && (
                  <motion.span
                    key={`${starValue}-${burstTick}`}
                    aria-hidden="true"
                    initial={{ scale: 0.45, opacity: 0.65 }}
                    animate={{ scale: 1.35, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-none absolute inset-1 rounded-full bg-[var(--md-primary-container)]"
                  />
                )}
              </AnimatePresence>

              <motion.span
                animate={{
                  scale: isFilled ? (isSelectedTip ? 1.14 : 1.02) : 0.92,
                  rotate: isFilled ? 0 : -8,
                }}
                transition={
                  reducedMotion
                    ? M3_SPRINGS.instant
                    : { ...springTransition, delay: isFilled ? (starValue - 1) * 0.025 : 0 }
                }
                className={`relative z-10 flex items-center justify-center transition-colors duration-150 ${
                  isFilled ? 'text-[var(--md-primary)]' : 'text-[var(--md-outline)]'
                }`}
              >
                <Star
                  className={`h-[22px] w-[22px] transition-colors duration-150 ${
                    isFilled ? 'fill-current' : 'fill-transparent'
                  }`}
                  strokeWidth={2}
                />
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Instant Expressive Sentiment Caption */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none h-5 overflow-hidden">
        <span>Spring wave</span>
        <span aria-hidden="true">·</span>
        <motion.span
          key={rating}
          initial={reducedMotion ? false : { y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="font-medium text-[var(--md-on-surface)]"
        >
          {RATING_LABELS[rating - 1]}
        </motion.span>
      </div>
    </div>
  );
};

interface ExpressiveRatingCardProps {
  className?: string;
}

export const ExpressiveRatingCard: React.FC<ExpressiveRatingCardProps> = ({ className }) => {
  const [status, setStatus] = useState('4 / 5');

  return (
    <BentoCard
      indexLabel="24"
      title="Expressive Rating"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveRatingStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
