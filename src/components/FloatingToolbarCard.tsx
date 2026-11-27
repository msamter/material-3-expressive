import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, MessageSquare, Pencil, Plus, Share2 } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'comment', label: 'Note', icon: MessageSquare },
  { id: 'bookmark', label: 'Save', icon: Bookmark },
  { id: 'share', label: 'Share', icon: Share2 },
];

interface FloatingToolbarStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onActionChange: (label: string) => void;
}

const FloatingToolbarStage: React.FC<FloatingToolbarStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onActionChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [demoFabActive, setDemoFabActive] = useState(false);
  const [manualFabActive, setManualFabActive] = useState(false);
  const lastLabelRef = useRef('Edit');

  const fabActive = manualFabActive || demoFabActive;

  useEffect(() => {
    const nextLabel = fabActive ? 'New draft' : TOOLBAR_ACTIONS[activeIndex].label;
    if (lastLabelRef.current !== nextLabel) {
      lastLabelRef.current = nextLabel;
      onActionChange(nextLabel);
    }
  }, [activeIndex, fabActive, onActionChange]);

  // Autonomous hover choreography isolated to demoFabActive so manual FAB clicks are never overwritten
  useEffect(() => {
    if (!isDemoActive) {
      setDemoFabActive(false);
      return;
    }

    let step = 0;
    const interval = window.setInterval(() => {
      step = (step + 1) % (TOOLBAR_ACTIONS.length + 1);
      if (step === TOOLBAR_ACTIONS.length) {
        setDemoFabActive(true);
      } else {
        setDemoFabActive(false);
        setActiveIndex(step);
      }
    }, 950);

    return () => {
      clearInterval(interval);
      setDemoFabActive(false);
    };
  }, [isDemoActive]);

  const handleSelectAction = (idx: number) => {
    claimManualControl();
    setManualFabActive(false);
    setDemoFabActive(false);
    setActiveIndex(idx);
  };

  const handleToggleFab = () => {
    claimManualControl();
    setManualFabActive((prev) => (demoFabActive ? false : !prev));
    setDemoFabActive(false);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      {/* Expressive Floating Toolbar Pill + Companion Squircle Primary Button (sized for zero clipping down to 320px/1024px) */}
      <div className="flex items-center justify-center gap-2 max-w-full">
        <div
          role="toolbar"
          aria-label="Document floating toolbar"
          className="inline-flex items-center gap-0.5 rounded-full border border-[var(--md-outline-variant)]/75 bg-[var(--md-surface-container-highest)] p-1 shadow-md"
        >
          {TOOLBAR_ACTIONS.map((action, idx) => {
            const isActive = idx === activeIndex && !fabActive;
            const Icon = action.icon;

            return (
              <motion.button
                key={action.id}
                type="button"
                layout={!reducedMotion}
                aria-label={action.label}
                aria-pressed={isActive}
                onClick={() => handleSelectAction(idx)}
                onFocus={claimManualControl}
                transition={springTransition}
                className={`relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full cursor-pointer select-none whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] px-3 gap-1.5'
                    : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)] px-2'
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={isActive ? 2.25 : 1.9}
                />
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      key={action.id}
                      initial={reducedMotion ? false : { opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={reducedMotion ? undefined : { opacity: 0, width: 0 }}
                      transition={springTransition}
                      className="overflow-hidden font-display text-[12.5px] sm:text-[13px] font-semibold tracking-[-0.01em]"
                    >
                      {action.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Companion Expressive Primary Squircle Action Button */}
        <motion.button
          type="button"
          aria-label={fabActive ? 'Close new item action' : 'Create new item'}
          aria-pressed={fabActive}
          onClick={handleToggleFab}
          onFocus={claimManualControl}
          animate={{
            borderRadius: fabActive ? 999 : 16,
            scale: fabActive ? 1.05 : 1,
            backgroundColor: fabActive
              ? 'var(--md-tertiary)'
              : 'var(--md-primary)',
            color: fabActive
              ? 'var(--md-on-tertiary)'
              : 'var(--md-on-primary)',
          }}
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
          transition={springTransition}
          className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] sm:min-h-[52px] sm:min-w-[52px] shadow-md cursor-pointer select-none shrink-0"
        >
          <motion.span
            animate={{ rotate: fabActive ? 45 : 0 }}
            transition={springTransition}
            className="flex items-center justify-center"
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </motion.span>
        </motion.button>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Floating dock</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-[var(--md-on-surface)]">
          {fabActive ? 'FAB active · Circle' : `${TOOLBAR_ACTIONS[activeIndex].label} expanded`}
        </span>
      </div>
    </div>
  );
};

interface FloatingToolbarCardProps {
  className?: string;
}

export const FloatingToolbarCard: React.FC<FloatingToolbarCardProps> = ({ className }) => {
  const [activeAction, setActiveAction] = useState('Edit');

  return (
    <BentoCard
      indexLabel="05"
      title="Floating Toolbar"
      readout={activeAction}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <FloatingToolbarStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onActionChange={setActiveAction}
        />
      )}
    </BentoCard>
  );
};
