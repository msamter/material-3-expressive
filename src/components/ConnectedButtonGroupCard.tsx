import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CalendarRange, Clock, History } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface SegmentItem {
  id: string;
  label: string;
  caption: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const SEGMENTS: SegmentItem[] = [
  { id: 'day', label: 'Day', caption: '24-hour cadence', icon: Clock },
  { id: 'week', label: 'Week', caption: '7-day sprint', icon: CalendarDays },
  { id: 'month', label: 'Month', caption: '30-day cycle', icon: CalendarRange },
  { id: 'year', label: 'Year', caption: 'Annual horizon', icon: History },
];

interface ConnectedButtonGroupStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onSelectionChange: (label: string) => void;
}

const ConnectedButtonGroupStage: React.FC<ConnectedButtonGroupStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onSelectionChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const lastLabelRef = useRef('Week');

  useEffect(() => {
    const label = SEGMENTS[selectedIndex].label;
    if (lastLabelRef.current !== label) {
      lastLabelRef.current = label;
      onSelectionChange(label);
    }
  }, [selectedIndex, onSelectionChange]);

  // Autonomous hover choreography: cycle smoothly across segments
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % SEGMENTS.length);
    }, 1050);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelect = (idx: number) => {
    claimManualControl();
    setSelectedIndex(idx);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      claimManualControl();
      setSelectedIndex((prev) => (prev + 1) % SEGMENTS.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      claimManualControl();
      setSelectedIndex((prev) => (prev - 1 + SEGMENTS.length) % SEGMENTS.length);
    }
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;
  const activeItem = SEGMENTS[selectedIndex];

  return (
    <div className="w-full max-w-[360px] flex flex-col items-center justify-center gap-5">
      {/* Compose Material 3 1.5.0 Connected Button Group */}
      <div
        role="radiogroup"
        aria-label="Timeframe view selector"
        onKeyDown={handleKeyDown}
        className="flex w-full items-center gap-[3px]"
      >
        {SEGMENTS.map((segment, idx) => {
          const isSelected = idx === selectedIndex;
          const isPressed = idx === pressedIndex;
          const isFirst = idx === 0;
          const isLast = idx === SEGMENTS.length - 1;
          const isLeftNeighbor = idx === selectedIndex - 1;
          const isRightNeighbor = idx === selectedIndex + 1;
          const Icon = segment.icon;

          const leftRadius = isSelected
            ? 999
            : isFirst
            ? 999
            : isRightNeighbor
            ? 6
            : 10;

          const rightRadius = isSelected
            ? 999
            : isLast
            ? 999
            : isLeftNeighbor
            ? 6
            : 10;

          const flexGrowValue = isPressed
            ? 1.5
            : isSelected
            ? 1.45
            : isLeftNeighbor || isRightNeighbor
            ? 0.9
            : 1;

          return (
            <motion.button
              key={segment.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(idx)}
              onPointerDown={() => {
                claimManualControl();
                setPressedIndex(idx);
              }}
              onPointerUp={() => setPressedIndex(null)}
              onPointerCancel={() => setPressedIndex(null)}
              onPointerLeave={() => setPressedIndex(null)}
              onFocus={claimManualControl}
              animate={{
                flexGrow: flexGrowValue,
                borderTopLeftRadius: leftRadius,
                borderBottomLeftRadius: leftRadius,
                borderTopRightRadius: rightRadius,
                borderBottomRightRadius: rightRadius,
                backgroundColor: isSelected
                  ? 'var(--md-primary)'
                  : 'var(--md-secondary-container)',
                color: isSelected
                  ? 'var(--md-on-primary)'
                  : 'var(--md-on-secondary-container)',
                scale: isPressed ? 0.96 : 1,
              }}
              transition={springTransition}
              className="relative flex items-center justify-center gap-1.5 min-h-[48px] px-2 sm:px-2.5 font-display text-[13px] font-semibold cursor-pointer select-none whitespace-nowrap overflow-hidden basis-0"
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 transition-opacity duration-150 ${
                  isSelected ? 'inline-block opacity-100' : 'hidden xl:inline-block opacity-75'
                }`}
                strokeWidth={isSelected ? 2.3 : 1.9}
              />
              <span>{segment.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Quiet unboxed corner-morph state readout */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span className="font-medium text-[var(--md-on-surface)]">{activeItem.caption}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">Active R999 / Adjacent R6</span>
      </div>
    </div>
  );
};

interface ConnectedButtonGroupCardProps {
  className?: string;
}

export const ConnectedButtonGroupCard: React.FC<ConnectedButtonGroupCardProps> = ({
  className,
}) => {
  const [selectedLabel, setSelectedLabel] = useState('Week');

  return (
    <BentoCard
      indexLabel="04"
      title="Connected Button Group"
      readout={selectedLabel}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ConnectedButtonGroupStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onSelectionChange={setSelectedLabel}
        />
      )}
    </BentoCard>
  );
};
