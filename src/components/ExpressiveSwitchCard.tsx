import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Minus } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExpressiveSwitchStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveSwitchStage: React.FC<ExpressiveSwitchStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [checked, setChecked] = useState(true);
  const [demoPressed, setDemoPressed] = useState(false);
  const [manualPressed, setManualPressed] = useState(false);
  const lastStatusRef = useRef('Enabled');

  const isPressed = manualPressed || demoPressed;

  useEffect(() => {
    const next = checked ? 'Enabled' : 'Disabled';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [checked, onStatusChange]);

  // Autonomous hover choreography: elastic press-stretch anticipation -> spring toggle
  useEffect(() => {
    if (!isDemoActive) {
      setDemoPressed(false);
      return;
    }

    let timers: number[] = [];

    const runStep = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setDemoPressed(true);
      timers.push(
        window.setTimeout(() => {
          setDemoPressed(false);
          setChecked((prev) => !prev);
        }, 280)
      );
    };

    const initialTimer = window.setTimeout(runStep, 350);
    const interval = window.setInterval(runStep, 1450);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setDemoPressed(false);
    };
  }, [isDemoActive]);

  const handleToggle = () => {
    claimManualControl();
    setChecked((prev) => !prev);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  // Authentic M3 Expressive Switch thumb geometry:
  // Unchecked = 22px, Checked = 34px, Pressed = elastic horizontal stretch (38px x 28px)
  const thumbWidth = isPressed ? 38 : checked ? 34 : 22;
  const thumbHeight = isPressed ? 28 : checked ? 34 : 22;
  const trackInnerWidth = 72; // 84px track - 12px padding
  const thumbX = checked ? trackInnerWidth - thumbWidth : 0;

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Adaptive haptics switch"
        onClick={handleToggle}
        onPointerDown={() => {
          claimManualControl();
          setManualPressed(true);
        }}
        onPointerUp={() => setManualPressed(false)}
        onPointerCancel={() => setManualPressed(false)}
        onPointerLeave={() => setManualPressed(false)}
        onFocus={claimManualControl}
        className="relative flex items-center h-[48px] w-[84px] rounded-full p-[6px] cursor-pointer select-none transition-colors duration-200 border-2"
        style={{
          backgroundColor: checked
            ? 'var(--md-primary)'
            : 'var(--md-surface-container-highest)',
          borderColor: checked ? 'var(--md-primary)' : 'var(--md-outline)',
        }}
      >
        <motion.span
          animate={{
            x: thumbX,
            width: thumbWidth,
            height: thumbHeight,
            backgroundColor: checked
              ? 'var(--md-on-primary)'
              : 'var(--md-outline)',
            color: checked
              ? 'var(--md-primary)'
              : 'var(--md-surface-container-highest)',
          }}
          transition={springTransition}
          className="flex items-center justify-center rounded-full shadow-xs"
        >
          <AnimatePresence mode="wait" initial={false}>
            {checked ? (
              <motion.span
                key="on"
                initial={reducedMotion ? false : { scale: 0.4, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={reducedMotion ? undefined : { scale: 0.4, opacity: 0 }}
                transition={springTransition}
              >
                <Check className="h-4 w-4" strokeWidth={2.7} />
              </motion.span>
            ) : (
              <motion.span
                key="off"
                initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.85 }}
                exit={reducedMotion ? undefined : { scale: 0.5, opacity: 0 }}
                transition={springTransition}
              >
                <Minus className="h-3 w-3" strokeWidth={2.6} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </button>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Elastic thumb</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums font-medium text-[var(--md-on-surface)]">
          {thumbWidth}×{thumbHeight}px
        </span>
      </div>
    </div>
  );
};

interface ExpressiveSwitchCardProps {
  className?: string;
}

export const ExpressiveSwitchCard: React.FC<ExpressiveSwitchCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Enabled');

  return (
    <BentoCard
      indexLabel="10"
      title="Expressive Switch"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveSwitchStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
