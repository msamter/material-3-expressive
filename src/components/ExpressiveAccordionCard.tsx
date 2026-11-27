import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface AccordionItemSpec {
  id: string;
  title: string;
  body: string;
}

const ACCORDION_ITEMS: AccordionItemSpec[] = [
  {
    id: 'spatial',
    title: 'Spatial Springs',
    body: 'Gentle overshoot makes layout and corner transitions feel tactile.',
  },
  {
    id: 'grouping',
    title: 'Segmented Grouping',
    body: 'Expanded cards separate cleanly with rounded corners on all sides.',
  },
  {
    id: 'contrast',
    title: 'Tonal Elevation',
    body: 'Surface container steps preserve crisp contrast in light and dark modes.',
  },
];

interface ExpressiveAccordionStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveAccordionStage: React.FC<ExpressiveAccordionStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const lastStatusRef = useRef('Item 1');

  useEffect(() => {
    const next = openIndex === null ? 'Collapsed' : `Item ${openIndex + 1}`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [openIndex, onStatusChange]);

  // Autonomous hover choreography: expand each grouped row sequentially
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setOpenIndex((prev) =>
        prev === null ? 0 : (prev + 1) % ACCORDION_ITEMS.length
      );
    }, 1550);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleToggle = (idx: number) => {
    claimManualControl();
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const chevronTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col justify-center w-full max-w-[300px]">
      <div className="flex flex-col w-full">
        {ACCORDION_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          const isFirst = idx === 0;
          const isLast = idx === ACCORDION_ITEMS.length - 1;
          const prevIsOpen = openIndex === idx - 1;
          const nextIsOpen = openIndex === idx + 1;

          // Authentic Compose M3 1.5.0 grouped list corner morphing:
          // Expanded card breaks out with full R20 corners + clean vertical separation
          const topRadius = isOpen || isFirst || prevIsOpen ? 20 : 6;
          const bottomRadius = isOpen || isLast || nextIsOpen ? 20 : 6;
          const marginTop = isFirst ? 0 : isOpen || prevIsOpen ? 8 : 3;

          return (
            <div
              key={item.id}
              style={{
                borderTopLeftRadius: `${topRadius}px`,
                borderTopRightRadius: `${topRadius}px`,
                borderBottomLeftRadius: `${bottomRadius}px`,
                borderBottomRightRadius: `${bottomRadius}px`,
                marginTop: `${marginTop}px`,
              }}
              className={`overflow-hidden border border-[var(--md-outline-variant)]/60 transition-[border-radius,margin-top,background-color] duration-300 m3-standard ${
                isOpen
                  ? 'bg-[var(--md-surface-container-high)]'
                  : 'bg-[var(--md-surface-container-highest)]'
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => handleToggle(idx)}
                onFocus={claimManualControl}
                className="w-full flex items-center justify-between gap-2 min-h-[46px] lg:min-h-[42px] px-4 py-2 text-left cursor-pointer select-none"
              >
                <span
                  className={`font-display text-[13px] truncate transition-colors duration-150 ${
                    isOpen
                      ? 'font-bold text-[var(--md-primary)]'
                      : 'font-semibold text-[var(--md-on-surface)]'
                  }`}
                >
                  {item.title}
                </span>

                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={chevronTransition}
                  className="flex h-5 w-5 items-center justify-center text-[var(--md-on-surface-variant)] shrink-0"
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
                </motion.span>
              </button>

              {/* Smooth critically-damped grid-row reveal (zero bouncy height overshoot or layout FLIP jitter) */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 m3-standard ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-4 pb-3.5 text-[12px] leading-relaxed text-[var(--md-on-surface-variant)]">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ExpressiveAccordionCardProps {
  className?: string;
}

export const ExpressiveAccordionCard: React.FC<ExpressiveAccordionCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('Item 1');

  return (
    <BentoCard
      indexLabel="23"
      title="Expressive Accordion"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveAccordionStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
