import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface TypeState {
  id: string;
  word: string;
  label: string;
  wght: number;
  wdth: number;
  opsz: number;
  tracking: string;
}

const TYPE_STATES: TypeState[] = [
  {
    id: 'expressive',
    word: 'Expressive',
    label: 'Bold',
    wght: 780,
    wdth: 112,
    opsz: 64,
    tracking: '-0.025em',
  },
  {
    id: 'tactile',
    word: 'Tactile',
    label: 'Wide',
    wght: 860,
    wdth: 136,
    opsz: 96,
    tracking: '-0.03em',
  },
  {
    id: 'elastic',
    word: 'Elastic',
    label: 'Light',
    wght: 430,
    wdth: 86,
    opsz: 36,
    tracking: '0.01em',
  },
  {
    id: 'fluid',
    word: 'Fluid',
    label: 'Heavy',
    wght: 900,
    wdth: 126,
    opsz: 110,
    tracking: '-0.035em',
  },
];

interface ExpressiveTextStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveTextStage: React.FC<ExpressiveTextStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [stateIndex, setStateIndex] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const lastStatusRef = useRef('');

  const active = TYPE_STATES[stateIndex];
  const displayWght = isPressed ? Math.min(900, active.wght + 90) : active.wght;
  const displayWdth = isPressed ? Math.min(148, active.wdth + 14) : active.wdth;

  useEffect(() => {
    const next = `wght ${active.wght} · wdth ${active.wdth}`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [active.wght, active.wdth, onStatusChange]);

  // Autonomous hover choreography: cycle through kinetic variable-font words
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setStateIndex((prev) => (prev + 1) % TYPE_STATES.length);
    }, 1550);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleCycleWord = () => {
    claimManualControl();
    setStateIndex((prev) => (prev + 1) % TYPE_STATES.length);
  };

  const handleSelectState = (idx: number) => {
    claimManualControl();
    setStateIndex(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;
  const letters = active.word.split('');

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full">
      {/* Interactive Kinetic Variable Typography Stage */}
      <button
        type="button"
        onClick={handleCycleWord}
        onPointerDown={() => {
          claimManualControl();
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onFocus={claimManualControl}
        aria-label={`Variable font animation showing ${active.word}. Click to cycle typography style`}
        className="relative flex items-center justify-center min-h-[76px] w-full px-3 rounded-[20px] cursor-pointer select-none overflow-hidden hover:bg-[var(--md-surface-container)]/65 transition-colors duration-200"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active.id}
            style={{
              fontFamily: '"Roboto Flex", system-ui, sans-serif',
              fontVariationSettings: `"wght" ${displayWght}, "wdth" ${displayWdth}, "opsz" ${active.opsz}`,
              letterSpacing: active.tracking,
            }}
            className="inline-flex items-baseline justify-center text-[34px] sm:text-[40px] leading-none text-[var(--md-on-surface)] transition-[font-variation-settings,letter-spacing] duration-500 m3-spring whitespace-nowrap"
          >
            {letters.map((char, idx) => (
              <motion.span
                key={`${active.id}-${idx}`}
                initial={
                  reducedMotion
                    ? false
                    : {
                        y: 18,
                        opacity: 0,
                        scale: 0.84,
                      }
                }
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  color:
                    idx === 0 ? 'var(--md-primary)' : 'var(--md-on-surface)',
                }}
                exit={
                  reducedMotion
                    ? undefined
                    : {
                        y: -14,
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.14, delay: idx * 0.015 },
                      }
                }
                transition={
                  reducedMotion
                    ? M3_SPRINGS.instant
                    : { ...springTransition, delay: idx * 0.028 }
                }
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Interactive Variable Axis Presets */}
      <div
        role="radiogroup"
        aria-label="Typography animation presets"
        className="inline-flex items-center gap-1 rounded-full bg-[var(--md-surface-container)] p-1 border border-[var(--md-outline-variant)]/65"
      >
        {TYPE_STATES.map((item, idx) => {
          const isSelected = idx === stateIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelectState(idx)}
              onFocus={claimManualControl}
              className={`min-h-[44px] lg:min-h-[34px] px-3 rounded-full text-[12px] font-medium cursor-pointer select-none whitespace-nowrap transition-colors duration-150 ${
                isSelected
                  ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-semibold'
                  : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ExpressiveTextCardProps {
  className?: string;
}

export const ExpressiveTextCard: React.FC<ExpressiveTextCardProps> = ({ className }) => {
  const [status, setStatus] = useState('wght 780 · wdth 112');

  return (
    <BentoCard
      indexLabel="07"
      title="Expressive Text"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveTextStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
