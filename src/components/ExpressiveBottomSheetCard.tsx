import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, QrCode, Share, SlidersHorizontal } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface SheetAction {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const SHEET_ACTIONS: SheetAction[] = [
  { id: 'copy', label: 'Copy', icon: Copy },
  { id: 'qr', label: 'QR', icon: QrCode },
  { id: 'share', label: 'Send', icon: Share },
];

interface ExpressiveBottomSheetStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveBottomSheetStage: React.FC<ExpressiveBottomSheetStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [manualOpen, setManualOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('Copy');
  const lastStatusRef = useRef('Dismissed');

  const isOpen = manualOpen || demoOpen;

  useEffect(() => {
    const next = isOpen ? 'Raised' : 'Dismissed';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isOpen, onStatusChange]);

  // Autonomous hover choreography isolated to demoOpen
  useEffect(() => {
    if (!isDemoActive) {
      setDemoOpen(false);
      return;
    }

    let timer: number | null = null;
    const runCycle = () => {
      if (timer !== null) window.clearTimeout(timer);
      setDemoOpen(true);
      timer = window.setTimeout(() => {
        setDemoOpen(false);
      }, 1900);
    };

    runCycle();
    const interval = window.setInterval(runCycle, 2900);

    return () => {
      clearInterval(interval);
      if (timer !== null) window.clearTimeout(timer);
      setDemoOpen(false);
    };
  }, [isDemoActive]);

  const handleToggleSheet = () => {
    claimManualControl();
    setManualOpen((prev) => (demoOpen ? false : !prev));
    setDemoOpen(false);
  };

  const handleCloseSheet = () => {
    claimManualControl();
    setManualOpen(false);
    setDemoOpen(false);
  };

  const handlePickAction = (label: string) => {
    claimManualControl();
    setSelectedAction(label);
    setManualOpen(false);
    setDemoOpen(false);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;

  return (
    <div className="relative w-full max-w-[268px] h-[196px] rounded-[22px] border border-[var(--md-outline-variant)]/75 bg-[var(--md-surface-container-lowest)] overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Underlying Screen Content */}
      <div className="flex flex-col items-center gap-2.5 text-center">
        <button
          type="button"
          onClick={handleToggleSheet}
          onFocus={claimManualControl}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-display text-[13px] font-semibold cursor-pointer select-none whitespace-nowrap hover:brightness-95 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
          <span>Open sheet</span>
        </button>
        <span className="text-[11.5px] text-[var(--md-on-surface-variant)] select-none">
          Last action · {selectedAction}
        </span>
      </div>

      {/* Soft Tonal Scrim */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            key="scrim"
            type="button"
            tabIndex={-1}
            aria-label="Dismiss bottom sheet"
            onClick={handleCloseSheet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/25 dark:bg-black/45 cursor-pointer z-10"
          />
        )}
      </AnimatePresence>

      {/* Spring Rising M3 Expressive Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sheet"
            role="dialog"
            aria-label="Share options sheet"
            initial={reducedMotion ? { opacity: 1 } : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={springTransition}
            className="absolute inset-x-0 bottom-0 z-20 rounded-t-[24px] border-t border-[var(--md-outline-variant)]/75 bg-[var(--md-surface-container-high)] px-3.5 pt-2.5 pb-3.5 shadow-lg"
          >
            {/* Interactive Drag Pill Handle */}
            <button
              type="button"
              onClick={handleCloseSheet}
              aria-label="Close sheet"
              className="mx-auto mb-3 flex h-4 w-14 items-center justify-center cursor-pointer"
            >
              <span className="h-1 w-9 rounded-full bg-[var(--md-outline)]/60" />
            </button>

            <div className="grid grid-cols-3 gap-2">
              {SHEET_ACTIONS.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    type="button"
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reducedMotion
                        ? M3_SPRINGS.instant
                        : { ...M3_SPRINGS.fastSpatial, delay: 0.06 + idx * 0.045 }
                    }
                    onClick={() => handlePickAction(action.label)}
                    className="flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-[16px] bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] cursor-pointer transition-colors duration-150"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                    <span className="font-display text-[11.5px] font-semibold">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ExpressiveBottomSheetCardProps {
  className?: string;
}

export const ExpressiveBottomSheetCard: React.FC<ExpressiveBottomSheetCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('Dismissed');

  return (
    <BentoCard
      indexLabel="17"
      title="Expressive Bottom Sheet"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveBottomSheetStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
