import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface TabSpec {
  id: string;
  label: string;
  metric: string;
  summary: string;
}

const TABS: TabSpec[] = [
  {
    id: 'overview',
    label: 'Overview',
    metric: '1.5.0',
    summary: 'Spring-driven state transitions replace rigid linear eases.',
  },
  {
    id: 'motion',
    label: 'Motion',
    metric: '380 N/m',
    summary: 'Spatial stiffness tunes overshoot for fluid tab gliding.',
  },
  {
    id: 'tokens',
    label: 'Tokens',
    metric: '24 roles',
    summary: 'Tonal surface roles adapt automatically across themes.',
  },
];

interface ExpressiveTabsStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveTabsStage: React.FC<ExpressiveTabsStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const lastStatusRef = useRef('Overview');

  useEffect(() => {
    const next = TABS[activeIndex].label;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [activeIndex, onStatusChange]);

  // Autonomous hover choreography
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % TABS.length);
    }, 1350);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelect = (idx: number) => {
    claimManualControl();
    setDirection(idx >= activeIndex ? 1 : -1);
    setActiveIndex(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;
  const activeTab = TABS[activeIndex];

  return (
    <div className="flex flex-col gap-3 w-full max-w-[310px]">
      {/* M3 Expressive Tab Strip with GPU Spring Gliding Indicator */}
      <div
        role="tablist"
        aria-label="Expressive specification tabs"
        className="relative grid grid-cols-3 border-b border-[var(--md-outline-variant)]/70"
      >
        {TABS.map((tab, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(idx)}
              onFocus={claimManualControl}
              className={`relative flex items-center justify-center min-h-[44px] lg:min-h-[40px] px-2 font-display text-[13px] cursor-pointer select-none whitespace-nowrap transition-colors duration-150 ${
                isActive
                  ? 'font-bold text-[var(--md-primary)]'
                  : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Pure GPU Transform Spring Indicator (zero layoutId projection stalls) */}
        <motion.div
          aria-hidden="true"
          animate={{ x: `${activeIndex * 100}%` }}
          transition={springTransition}
          className="pointer-events-none absolute bottom-0 left-0 w-1/3 flex justify-center"
        >
          <span className="h-[3.5px] w-[72%] rounded-t-full bg-[var(--md-primary)]" />
        </motion.div>
      </div>

      {/* Instant Directional Sliding Content Panel (zero mode=wait lag) */}
      <div className="relative overflow-hidden rounded-[18px] bg-[var(--md-surface-container-high)] px-4 py-3 min-h-[78px] flex items-center">
        <motion.div
          key={activeTab.id}
          initial={reducedMotion ? false : { x: direction * 18, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={
            reducedMotion
              ? M3_SPRINGS.instant
              : { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
          }
          className="w-full space-y-1"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-[13px] font-semibold text-[var(--md-on-surface)]">
              {activeTab.label}
            </span>
            <span className="text-[11.5px] font-semibold tabular-nums text-[var(--md-primary)]">
              {activeTab.metric}
            </span>
          </div>
          <p className="text-[12px] leading-snug text-[var(--md-on-surface-variant)]">
            {activeTab.summary}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

interface ExpressiveTabsCardProps {
  className?: string;
}

export const ExpressiveTabsCard: React.FC<ExpressiveTabsCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Overview');

  return (
    <BentoCard
      indexLabel="27"
      title="Expressive Tabs"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveTabsStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
