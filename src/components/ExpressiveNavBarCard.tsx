import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Home, Library, User } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface NavDestination {
  id: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const NAV_ITEMS: NavDestination[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'profile', label: 'Profile', icon: User },
];

interface ExpressiveNavBarStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveNavBarStage: React.FC<ExpressiveNavBarStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastStatusRef = useRef('Home');

  useEffect(() => {
    const next = NAV_ITEMS[activeIndex].label;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [activeIndex, onStatusChange]);

  // Autonomous hover choreography: glide shared-element active indicator across tabs
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % NAV_ITEMS.length);
    }, 950);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelect = (idx: number) => {
    claimManualControl();
    setActiveIndex(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[336px]">
      <nav
        aria-label="Expressive bottom navigation bar"
        className="relative w-full rounded-[26px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] p-1.5 shadow-sm"
      >
        <div className="relative grid grid-cols-4 w-full">
          {/* Pure GPU Transform Spring Gliding Active Pill */}
          <motion.div
            aria-hidden="true"
            animate={{ x: `${activeIndex * 100}%` }}
            transition={springTransition}
            className="pointer-events-none absolute top-[6px] left-0 w-1/4 flex justify-center"
          >
            <span className="w-12 h-7 rounded-full bg-[var(--md-secondary-container)]" />
          </motion.div>

          {NAV_ITEMS.map((item, idx) => {
            const isActive = idx === activeIndex;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleSelect(idx)}
                onFocus={claimManualControl}
                className="relative z-10 flex flex-col items-center justify-center gap-1 min-h-[54px] py-1.5 px-1 rounded-[20px] cursor-pointer select-none"
              >
                <div className="relative flex items-center justify-center w-12 h-7">
                  <motion.span
                    animate={{
                      scale: isActive ? 1.08 : 0.96,
                      y: isActive ? -0.5 : 0,
                    }}
                    transition={springTransition}
                    className={`relative z-10 flex items-center justify-center transition-colors duration-150 ${
                      isActive
                        ? 'text-[var(--md-on-secondary-container)]'
                        : 'text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.35 : 1.85} />
                  </motion.span>
                </div>

                <span
                  className={`text-[11px] font-display leading-none whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? 'font-bold text-[var(--md-on-surface)]'
                      : 'font-medium text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Shared indicator</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-[var(--md-on-surface)]">
          {NAV_ITEMS[activeIndex].label} active
        </span>
      </div>
    </div>
  );
};

interface ExpressiveNavBarCardProps {
  className?: string;
}

export const ExpressiveNavBarCard: React.FC<ExpressiveNavBarCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Home');

  return (
    <BentoCard
      indexLabel="14"
      title="Expressive Navigation Bar"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveNavBarStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
