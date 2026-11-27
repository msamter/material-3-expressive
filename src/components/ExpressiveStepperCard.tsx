import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface StepSpec {
  id: string;
  label: string;
  detail: string;
}

const STEPS: StepSpec[] = [
  { id: 'brief', label: 'Brief', detail: 'Scope & tokens' },
  { id: 'design', label: 'Design', detail: 'Shape & color' },
  { id: 'build', label: 'Build', detail: 'Spring physics' },
  { id: 'launch', label: 'Launch', detail: 'Live preview' },
];

interface ExpressiveStepperStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveStepperStage: React.FC<ExpressiveStepperStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const lastStatusRef = useRef('Step 2 / 4');

  useEffect(() => {
    const next = `Step ${activeStep + 1} / ${STEPS.length}`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [activeStep, onStatusChange]);

  // Autonomous hover choreography: advance through milestones smoothly
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 1150);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelectStep = (idx: number) => {
    claimManualControl();
    setActiveStep(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;
  const current = STEPS[activeStep];

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full max-w-[330px]">
      {/* Connected Morphing Milestone Stepper */}
      <div
        role="tablist"
        aria-label="Project progress milestones"
        className="flex items-center justify-between w-full"
      >
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <React.Fragment key={step.id}>
              {/* Fixed-width slot wrapper so neighboring step targets never shift horizontally */}
              <div className="flex flex-col items-center gap-1.5 w-[52px] shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`Step ${idx + 1}: ${step.label}`}
                  onClick={() => handleSelectStep(idx)}
                  onFocus={claimManualControl}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[48px] cursor-pointer select-none rounded-2xl"
                >
                  <motion.span
                    animate={{
                      width: isCurrent ? 48 : 38,
                      height: 38,
                      borderRadius: isCurrent ? 14 : 999,
                    }}
                    whileTap={reducedMotion ? undefined : { scale: 0.92 }}
                    transition={springTransition}
                    className={`inline-flex items-center justify-center font-display text-[13px] font-bold tabular-nums shadow-xs transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                        : isCompleted
                        ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                        : 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    <motion.span
                      key={isCompleted ? 'done' : `num-${idx}`}
                      initial={reducedMotion ? false : { scale: 0.55, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center justify-center"
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" strokeWidth={2.6} />
                      ) : (
                        idx + 1
                      )}
                    </motion.span>
                  </motion.span>
                </button>

                <span
                  className={`text-[11px] font-display transition-colors duration-150 select-none ${
                    isCurrent
                      ? 'font-bold text-[var(--md-on-surface)]'
                      : 'font-medium text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Expressive Connecting Track Segment */}
              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="relative flex-1 h-1.5 mx-1 -mt-5 rounded-full bg-[var(--md-surface-container-highest)] overflow-hidden"
                >
                  <motion.div
                    animate={{ scaleX: idx < activeStep ? 1 : 0 }}
                    transition={springTransition}
                    style={{ transformOrigin: 'left center' }}
                    className="absolute inset-0 rounded-full bg-[var(--md-primary)]"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span className="font-medium text-[var(--md-on-surface)]">{current.label}</span>
        <span aria-hidden="true">·</span>
        <span>{current.detail}</span>
      </div>
    </div>
  );
};

interface ExpressiveStepperCardProps {
  className?: string;
}

export const ExpressiveStepperCard: React.FC<ExpressiveStepperCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Step 2 / 4');

  return (
    <BentoCard
      indexLabel="22"
      title="Expressive Stepper"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveStepperStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
