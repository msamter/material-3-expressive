import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FilePlus2, Plus, Share2, Upload } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface FabAction {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const FAB_ACTIONS: FabAction[] = [
  { id: 'note', label: 'New note', icon: FilePlus2 },
  { id: 'upload', label: 'Upload file', icon: Upload },
  { id: 'share', label: 'Share view', icon: Share2 },
];

interface ExpressiveFabMenuStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveFabMenuStage: React.FC<ExpressiveFabMenuStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [manualOpen, setManualOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string>('Ready');
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const lastStatusRef = useRef('Ready');

  const isOpen = manualOpen || demoOpen;

  useEffect(() => {
    const next = isOpen ? 'Expanded' : activeAction;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isOpen, activeAction, onStatusChange]);

  // Autonomous hover choreography isolated to demoOpen
  useEffect(() => {
    if (!isDemoActive) {
      setDemoOpen(false);
      setHighlightedIdx(null);
      return;
    }

    let timers: number[] = [];

    const runCycle = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setDemoOpen(true);
      setHighlightedIdx(null);

      timers.push(window.setTimeout(() => setHighlightedIdx(0), 550));
      timers.push(window.setTimeout(() => setHighlightedIdx(1), 1050));
      timers.push(window.setTimeout(() => setHighlightedIdx(2), 1550));
      timers.push(
        window.setTimeout(() => {
          setDemoOpen(false);
          setHighlightedIdx(null);
        }, 2150)
      );
    };

    runCycle();
    const interval = window.setInterval(runCycle, 3050);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setDemoOpen(false);
      setHighlightedIdx(null);
    };
  }, [isDemoActive]);

  const handleToggleFab = useCallback(() => {
    claimManualControl();
    setManualOpen((prev) => (demoOpen ? false : !prev));
    setDemoOpen(false);
    setHighlightedIdx(null);
  }, [claimManualControl, demoOpen]);

  const handleSelectAction = useCallback(
    (label: string) => {
      claimManualControl();
      setActiveAction(label);
      setManualOpen(false);
      setDemoOpen(false);
      setHighlightedIdx(null);
    },
    [claimManualControl]
  );

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="relative flex flex-col items-end justify-end w-full max-w-[240px] min-h-[212px] lg:min-h-[196px]">
      {/* Staggered Expressive FAB Menu Items */}
      <div className="flex flex-col items-end gap-2 mb-3 w-full">
        <AnimatePresence>
          {isOpen &&
            FAB_ACTIONS.map((action, idx) => {
              const Icon = action.icon;
              const reverseDelay = (FAB_ACTIONS.length - 1 - idx) * 0.045;
              const isHighlighted = highlightedIdx === idx;

              return (
                <motion.button
                  key={action.id}
                  type="button"
                  initial={
                    reducedMotion
                      ? { opacity: 1 }
                      : { opacity: 0, y: 16, scale: 0.85 }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isHighlighted ? 1.04 : 1,
                  }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: 12,
                          scale: 0.88,
                          transition: { duration: 0.14, delay: idx * 0.03 },
                        }
                  }
                  transition={
                    reducedMotion
                      ? M3_SPRINGS.instant
                      : { ...springTransition, delay: reverseDelay }
                  }
                  onClick={() => handleSelectAction(action.label)}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  onMouseLeave={() => setHighlightedIdx(null)}
                  className={`inline-flex items-center gap-2.5 min-h-[44px] lg:min-h-[38px] px-4 rounded-full font-display text-[13px] font-semibold cursor-pointer select-none whitespace-nowrap shadow-xs transition-colors duration-150 ${
                    isHighlighted
                      ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                      : 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2.1} />
                  <span>{action.label}</span>
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Bottom Row: Quiet Feedback + Primary Morphing FAB */}
      <div className="flex items-center justify-between gap-3 w-full">
        <span className="text-[12px] text-[var(--md-on-surface-variant)] truncate select-none">
          {isOpen ? 'Choose action' : `Last · ${activeAction}`}
        </span>

        <motion.button
          type="button"
          aria-label={isOpen ? 'Close action menu' : 'Open action menu'}
          aria-expanded={isOpen}
          onClick={handleToggleFab}
          onFocus={claimManualControl}
          animate={{
            borderRadius: isOpen ? 999 : 18,
            backgroundColor: isOpen
              ? 'var(--md-primary-container)'
              : 'var(--md-primary)',
            color: isOpen
              ? 'var(--md-on-primary-container)'
              : 'var(--md-on-primary)',
          }}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
          transition={springTransition}
          className="inline-flex items-center justify-center min-h-[54px] min-w-[54px] shadow-md cursor-pointer select-none shrink-0"
        >
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={springTransition}
            className="flex items-center justify-center"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
};

interface ExpressiveFabMenuCardProps {
  className?: string;
}

export const ExpressiveFabMenuCard: React.FC<ExpressiveFabMenuCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Ready');

  return (
    <BentoCard
      indexLabel="11"
      title="Expressive FAB Menu"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveFabMenuStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
