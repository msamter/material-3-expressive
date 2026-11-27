import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CalendarCheck2, CheckCircle2, X } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface AlertCardData {
  uid: number;
  title: string;
  time: string;
  accent: 'primary' | 'secondary' | 'tertiary';
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const ALERT_TEMPLATES: Omit<AlertCardData, 'uid'>[] = [
  { title: 'Design review starts soon', time: '2m ago', accent: 'primary', icon: CalendarCheck2 },
  { title: 'Build deployed cleanly', time: '8m ago', accent: 'secondary', icon: CheckCircle2 },
  { title: 'New theme token added', time: '14m ago', accent: 'tertiary', icon: Bell },
];

interface ExpressiveNotificationStageProps {
  isDemoActive: boolean;
  isHovered: boolean;
  isManualActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveNotificationStage: React.FC<ExpressiveNotificationStageProps> = ({
  isDemoActive,
  isHovered,
  isManualActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const uidCounterRef = useRef(3);
  const templateCursorRef = useRef(0);
  const [cards, setCards] = useState<AlertCardData[]>(() =>
    ALERT_TEMPLATES.map((tpl, idx) => ({ ...tpl, uid: idx + 1 }))
  );
  const lastStatusRef = useRef('Stacked');

  const isFanned = isHovered || isManualActive;

  useEffect(() => {
    const next = isFanned ? 'Fanned' : 'Stacked';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isFanned, onStatusChange]);

  const cycleTopCard = useCallback(() => {
    setCards((prev) => {
      const nextTemplate =
        ALERT_TEMPLATES[templateCursorRef.current % ALERT_TEMPLATES.length];
      templateCursorRef.current += 1;
      uidCounterRef.current += 1;
      return [...prev.slice(1), { ...nextTemplate, uid: uidCounterRef.current }];
    });
  }, []);

  // Autonomous hover choreography: fan out and smoothly dismiss-cycle top card
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(cycleTopCard, 1750);
    return () => clearInterval(interval);
  }, [isDemoActive, cycleTopCard]);

  const handleDismissTop = () => {
    claimManualControl();
    cycleTopCard();
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[292px]">
      <div className="relative w-full h-[156px]">
        <AnimatePresence initial={false}>
          {cards.map((card, idx) => {
            const Icon = card.icon;
            const isTop = idx === 0;
            const yOffset = isFanned ? idx * 46 : idx * 14;
            const scaleVal = isFanned ? 1 - idx * 0.025 : 1 - idx * 0.055;
            const zIndex = cards.length - idx;

            const iconBg =
              card.accent === 'primary'
                ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                : card.accent === 'secondary'
                ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                : 'bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]';

            return (
              <motion.div
                key={card.uid}
                layout={!reducedMotion}
                initial={
                  reducedMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 86, scale: 0.88 }
                }
                animate={{
                  opacity: isFanned ? 1 : 1 - idx * 0.16,
                  y: yOffset,
                  scale: scaleVal,
                }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: 110, rotate: 4, scale: 0.94 }
                }
                transition={springTransition}
                style={{ zIndex }}
                className="absolute inset-x-0 top-0 flex items-center justify-between gap-2.5 rounded-[18px] border border-[var(--md-outline-variant)]/80 bg-[var(--md-surface-container-high)] px-3 py-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] ${iconBg}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2.1} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[12.5px] font-semibold text-[var(--md-on-surface)] truncate">
                      {card.title}
                    </p>
                    <p className="text-[11px] text-[var(--md-on-surface-variant)] tabular-nums">
                      {card.time}
                    </p>
                  </div>
                </div>

                {isTop && (
                  <button
                    type="button"
                    onClick={handleDismissTop}
                    onFocus={claimManualControl}
                    aria-label={`Dismiss notification: ${card.title}`}
                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[36px] lg:min-w-[36px] rounded-full text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)] cursor-pointer shrink-0 transition-colors"
                  >
                    <X className="h-4 w-4" strokeWidth={2.2} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ExpressiveNotificationCardProps {
  className?: string;
}

export const ExpressiveNotificationCard: React.FC<ExpressiveNotificationCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('Stacked');

  return (
    <BentoCard
      indexLabel="18"
      title="Notification Stack"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, isHovered, isManualActive, claimManualControl, reducedMotion }) => (
        <ExpressiveNotificationStage
          isDemoActive={isDemoActive}
          isHovered={isHovered}
          isManualActive={isManualActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
