import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ChecklistItem {
  id: string;
  label: string;
}

const TASKS: ChecklistItem[] = [
  { id: 'audit', label: 'Audit spring damping' },
  { id: 'contrast', label: 'Verify dark tonal pairs' },
  { id: 'ship', label: 'Publish release build' },
];

interface ExpressiveChecklistStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveChecklistStage: React.FC<ExpressiveChecklistStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [checkedIds, setCheckedIds] = useState<string[]>(['audit']);
  const lastStatusRef = useRef('1 / 3 done');

  useEffect(() => {
    const next = `${checkedIds.length} / ${TASKS.length} done`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [checkedIds.length, onStatusChange]);

  // Autonomous hover choreography: check and uncheck tasks sequentially
  useEffect(() => {
    if (!isDemoActive) return;

    const sequence = ['contrast', 'ship', 'audit', 'contrast', 'ship', 'audit'];
    let step = 0;

    const interval = window.setInterval(() => {
      const target = sequence[step % sequence.length];
      step += 1;
      setCheckedIds((prev) =>
        prev.includes(target) ? prev.filter((id) => id !== target) : [...prev, target]
      );
    }, 950);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleToggle = (id: string) => {
    claimManualControl();
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col gap-2 w-full max-w-[292px]">
      {TASKS.map((task) => {
        const isChecked = checkedIds.includes(task.id);

        return (
          <motion.button
            key={task.id}
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => handleToggle(task.id)}
            onFocus={claimManualControl}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            transition={springTransition}
            className="flex items-center gap-3 min-h-[48px] px-3.5 py-2 rounded-[18px] bg-[var(--md-surface-container-high)] hover:bg-[var(--md-surface-container-highest)] text-left cursor-pointer select-none transition-colors duration-150"
          >
            {/* Square -> Circle Morphing M3 Expressive Checkbox */}
            <motion.span
              animate={{
                borderRadius: isChecked ? 999 : 8,
                scale: isChecked ? [1, 1.15, 1] : 1,
                backgroundColor: isChecked ? 'var(--md-primary)' : 'transparent',
                borderColor: isChecked ? 'var(--md-primary)' : 'var(--md-outline)',
              }}
              transition={springTransition}
              className="flex h-6 w-6 shrink-0 items-center justify-center border-2"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 overflow-visible"
                aria-hidden="true"
              >
                <motion.path
                  d="M3.2 8.4 L6.5 11.6 L12.8 4.8"
                  fill="none"
                  stroke="var(--md-on-primary)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={{
                    pathLength: isChecked ? 1 : 0,
                    opacity: isChecked ? 1 : 0,
                  }}
                  transition={
                    reducedMotion
                      ? M3_SPRINGS.instant
                      : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
                  }
                />
              </svg>
            </motion.span>

            {/* Task Label with Animated Strikethrough */}
            <span className="relative font-display text-[13.5px] font-medium truncate">
              <span
                className={`transition-opacity duration-200 ${
                  isChecked
                    ? 'opacity-55 text-[var(--md-on-surface-variant)]'
                    : 'opacity-100 text-[var(--md-on-surface)]'
                }`}
              >
                {task.label}
              </span>
              <motion.span
                aria-hidden="true"
                animate={{ scaleX: isChecked ? 1 : 0 }}
                transition={
                  reducedMotion
                    ? M3_SPRINGS.instant
                    : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
                }
                style={{ transformOrigin: 'left center' }}
                className="pointer-events-none absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-[var(--md-on-surface-variant)]"
              />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

interface ExpressiveChecklistCardProps {
  className?: string;
}

export const ExpressiveChecklistCard: React.FC<ExpressiveChecklistCardProps> = ({ className }) => {
  const [status, setStatus] = useState('1 / 3 done');

  return (
    <BentoCard
      indexLabel="26"
      title="Expressive Checklist"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveChecklistStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
