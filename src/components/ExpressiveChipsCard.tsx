import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ChipOption {
  id: string;
  label: string;
}

const CHIP_OPTIONS: ChipOption[] = [
  { id: 'motion', label: 'Spring' },
  { id: 'color', label: 'Dynamic color' },
  { id: 'shape', label: 'Shape morph' },
  { id: 'type', label: 'Variable type' },
  { id: 'elevation', label: 'Tonal depth' },
];

interface ExpressiveChipsStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveChipsStage: React.FC<ExpressiveChipsStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['motion', 'shape']);
  const lastStatusRef = useRef('2 selected');

  useEffect(() => {
    const next = `${selectedIds.length} selected`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [selectedIds.length, onStatusChange]);

  // Autonomous hover choreography: toggle chips sequentially with smooth layout reflow
  useEffect(() => {
    if (!isDemoActive) return;

    const sequence = ['color', 'motion', 'type', 'elevation', 'shape'];
    let step = 0;

    const interval = window.setInterval(() => {
      const targetId = sequence[step % sequence.length];
      step += 1;
      setSelectedIds((prev) =>
        prev.includes(targetId)
          ? prev.length > 1
            ? prev.filter((id) => id !== targetId)
            : [...prev, CHIP_OPTIONS[(step + 1) % CHIP_OPTIONS.length].id]
          : [...prev, targetId]
      );
    }, 820);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleToggleChip = (id: string) => {
    claimManualControl();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[336px]">
      {/* M3 Expressive Interactive Filter Chips with corner morph & spring checkmark reflow */}
      <div
        role="group"
        aria-label="Material 3 expressive filter chips"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {CHIP_OPTIONS.map((chip) => {
          const isSelected = selectedIds.includes(chip.id);

          return (
            <motion.button
              key={chip.id}
              type="button"
              layout={!reducedMotion}
              aria-pressed={isSelected}
              onClick={() => handleToggleChip(chip.id)}
              onFocus={claimManualControl}
              animate={{
                borderRadius: isSelected ? 999 : 10,
                backgroundColor: isSelected
                  ? 'var(--md-secondary-container)'
                  : 'var(--md-surface-container-lowest)',
                color: isSelected
                  ? 'var(--md-on-secondary-container)'
                  : 'var(--md-on-surface-variant)',
                borderColor: isSelected
                  ? 'transparent'
                  : 'var(--md-outline-variant)',
              }}
              whileHover={reducedMotion ? undefined : { scale: 1.03 }}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={springTransition}
              className="inline-flex items-center justify-center min-h-[44px] lg:min-h-[38px] px-3.5 border font-display text-[13px] font-medium cursor-pointer select-none whitespace-nowrap shrink-0"
            >
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span
                    key="check"
                    initial={reducedMotion ? false : { width: 0, opacity: 0, scale: 0.5, marginRight: 0 }}
                    animate={{ width: 16, opacity: 1, scale: 1, marginRight: 6 }}
                    exit={reducedMotion ? undefined : { width: 0, opacity: 0, scale: 0.5, marginRight: 0 }}
                    transition={springTransition}
                    className="inline-flex items-center justify-center overflow-hidden text-[var(--md-primary)]"
                  >
                    <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{chip.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Filter chips</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums font-medium text-[var(--md-on-surface)]">
          R10 Outline → R999 Tonal
        </span>
      </div>
    </div>
  );
};

interface ExpressiveChipsCardProps {
  className?: string;
}

export const ExpressiveChipsCard: React.FC<ExpressiveChipsCardProps> = ({ className }) => {
  const [status, setStatus] = useState('2 selected');

  return (
    <BentoCard
      indexLabel="08"
      title="Expressive Filter Chips"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveChipsStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
