import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Archive, RotateCcw } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExpressiveSnackbarStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveSnackbarStage: React.FC<ExpressiveSnackbarStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [manualVisible, setManualVisible] = useState(false);
  const [demoVisible, setDemoVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Draft archived');
  const [undoAvailable, setUndoAvailable] = useState(true);
  const [toastKey, setToastKey] = useState(0);

  const dismissTimerRef = useRef<number | null>(null);
  const lastStatusRef = useRef('Ready');

  const isVisible = manualVisible || demoVisible;

  useEffect(() => {
    const next = isVisible ? (undoAvailable ? 'Toast active' : 'Restored') : 'Ready';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isVisible, undoAvailable, onStatusChange]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Autonomous hover choreography isolated to demoVisible
  useEffect(() => {
    if (!isDemoActive) {
      setDemoVisible(false);
      return;
    }

    let hideTimer: number | null = null;
    const runCycle = () => {
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      setSnackbarMessage('Draft archived');
      setUndoAvailable(true);
      setToastKey((prev) => prev + 1);
      setDemoVisible(true);
      hideTimer = window.setTimeout(() => {
        setDemoVisible(false);
      }, 2150);
    };

    runCycle();
    const interval = window.setInterval(runCycle, 3050);

    return () => {
      clearInterval(interval);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      setDemoVisible(false);
    };
  }, [isDemoActive]);

  const handleArchive = useCallback(() => {
    claimManualControl();
    setDemoVisible(false);
    setSnackbarMessage('Draft archived');
    setUndoAvailable(true);
    setToastKey((prev) => prev + 1);
    setManualVisible(true);

    if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = window.setTimeout(() => {
      setManualVisible(false);
      dismissTimerRef.current = null;
    }, 3200);
  }, [claimManualControl]);

  const handleUndo = useCallback(() => {
    claimManualControl();
    setDemoVisible(false);
    setSnackbarMessage('Archive undone');
    setUndoAvailable(false);
    setToastKey((prev) => prev + 1);
    setManualVisible(true);

    if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = window.setTimeout(() => {
      setManualVisible(false);
      dismissTimerRef.current = null;
    }, 1600);
  }, [claimManualControl]);

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="relative flex flex-col items-center justify-between w-full max-w-[300px] min-h-[126px] pt-1">
      {/* Trigger Action */}
      <motion.button
        type="button"
        onClick={handleArchive}
        onFocus={claimManualControl}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        transition={springTransition}
        className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] font-display text-[13px] font-semibold cursor-pointer select-none whitespace-nowrap hover:brightness-95 transition-all"
      >
        <Archive className="h-4 w-4 shrink-0" strokeWidth={2.1} />
        <span>Archive draft</span>
      </motion.button>

      {/* Spring Floating Pill Snackbar with Countdown Bar */}
      <div className="relative w-full min-h-[58px] flex items-end justify-center mt-3">
        <AnimatePresence mode="wait">
          {isVisible ? (
            <motion.div
              key={toastKey}
              role="status"
              aria-live="polite"
              initial={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 22, scale: 0.92 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 14, scale: 0.94 }
              }
              transition={springTransition}
              className="relative w-full overflow-hidden rounded-[18px] bg-[var(--md-inverse-surface)] text-[var(--md-inverse-on-surface)] px-4 py-2 shadow-md flex items-center justify-between gap-3"
            >
              <span className="font-display text-[13px] font-medium truncate">
                {snackbarMessage}
              </span>

              {undoAvailable && (
                <button
                  type="button"
                  onClick={handleUndo}
                  onFocus={claimManualControl}
                  className="inline-flex items-center gap-1 min-h-[44px] lg:min-h-[36px] px-2.5 rounded-full text-[12.5px] font-semibold text-[var(--md-primary-container)] dark:text-[var(--md-primary)] hover:bg-white/10 cursor-pointer select-none whitespace-nowrap shrink-0 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.3} />
                  <span>Undo</span>
                </button>
              )}

              {/* Smooth Countdown Progress Strip */}
              {!reducedMotion && (
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    duration: demoVisible ? 2.1 : undoAvailable ? 3.1 : 1.5,
                    ease: 'linear',
                  }}
                  style={{ transformOrigin: 'left center' }}
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[var(--md-primary-container)] dark:bg-[var(--md-primary)] opacity-85"
                />
              )}
            </motion.div>
          ) : (
            <motion.p
              key="idle-note"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              className="text-[12px] text-[var(--md-on-surface-variant)] pb-2 select-none"
            >
              Inverse pill toast · Timed undo
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ExpressiveSnackbarCardProps {
  className?: string;
}

export const ExpressiveSnackbarCard: React.FC<ExpressiveSnackbarCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Ready');

  return (
    <BentoCard
      indexLabel="20"
      title="Expressive Snackbar"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveSnackbarStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
