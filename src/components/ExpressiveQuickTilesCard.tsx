import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Bluetooth, Flashlight, MoonStar, Wifi } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface QuickTileSpec {
  id: string;
  label: string;
  sublabelOn: string;
  sublabelOff: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const QUICK_TILES: QuickTileSpec[] = [
  { id: 'wifi', label: 'Wi-Fi', sublabelOn: 'Studio 6G', sublabelOff: 'Off', icon: Wifi },
  { id: 'bt', label: 'Bluetooth', sublabelOn: 'Pixel Buds', sublabelOff: 'Off', icon: Bluetooth },
  { id: 'focus', label: 'Focus', sublabelOn: 'Active', sublabelOff: 'Paused', icon: MoonStar },
  { id: 'torch', label: 'Flashlight', sublabelOn: 'On', sublabelOff: 'Off', icon: Flashlight },
];

interface ExpressiveQuickTilesStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveQuickTilesStage: React.FC<ExpressiveQuickTilesStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [activeIds, setActiveIds] = useState<string[]>(['wifi', 'focus']);
  const lastStatusRef = useRef('2 active');

  useEffect(() => {
    const next = `${activeIds.length} active`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [activeIds.length, onStatusChange]);

  // Autonomous hover choreography: toggle tiles in sequence to showcase squircle <-> stadium morph
  useEffect(() => {
    if (!isDemoActive) return;

    const sequence = ['bt', 'focus', 'torch', 'wifi'];
    let step = 0;

    const interval = window.setInterval(() => {
      const targetId = sequence[step % sequence.length];
      step += 1;
      setActiveIds((prev) =>
        prev.includes(targetId)
          ? prev.filter((id) => id !== targetId)
          : [...prev, targetId]
      );
    }, 920);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleToggle = (id: string) => {
    claimManualControl();
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[304px]">
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {QUICK_TILES.map((tile) => {
          const isOn = activeIds.includes(tile.id);
          const Icon = tile.icon;

          return (
            <motion.button
              key={tile.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => handleToggle(tile.id)}
              onFocus={claimManualControl}
              animate={{
                borderRadius: isOn ? 999 : 20,
                backgroundColor: isOn
                  ? 'var(--md-primary)'
                  : 'var(--md-surface-container-highest)',
                color: isOn
                  ? 'var(--md-on-primary)'
                  : 'var(--md-on-surface)',
              }}
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={springTransition}
              className="flex items-center gap-2.5 min-h-[60px] px-3.5 py-2.5 text-left cursor-pointer select-none overflow-hidden shadow-xs"
            >
              <motion.span
                animate={{
                  scale: isOn ? 1.08 : 0.96,
                  rotate: isOn ? 0 : -6,
                }}
                transition={springTransition}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/8 dark:bg-white/10"
              >
                <Icon className="h-4 w-4" strokeWidth={isOn ? 2.3 : 1.9} />
              </motion.span>

              <div className="min-w-0 flex-1">
                <p className="font-display text-[12.5px] font-semibold leading-tight truncate">
                  {tile.label}
                </p>
                <p className="text-[11px] opacity-75 truncate mt-0.5">
                  {isOn ? tile.sublabelOn : tile.sublabelOff}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Quick settings</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums font-medium text-[var(--md-on-surface)]">
          R20 Off → Full Pill On
        </span>
      </div>
    </div>
  );
};

interface ExpressiveQuickTilesCardProps {
  className?: string;
}

export const ExpressiveQuickTilesCard: React.FC<ExpressiveQuickTilesCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('2 active');

  return (
    <BentoCard
      indexLabel="21"
      title="Quick Settings Tiles"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveQuickTilesStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
