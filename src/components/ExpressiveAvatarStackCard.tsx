import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface Collaborator {
  id: string;
  initials: string;
  name: string;
  role: string;
  bgVar: string;
  fgVar: string;
}

const COLLABORATORS: Collaborator[] = [
  {
    id: 'am',
    initials: 'AM',
    name: 'Alex Morgan',
    role: 'Motion Lead',
    bgVar: 'var(--md-primary-container)',
    fgVar: 'var(--md-on-primary-container)',
  },
  {
    id: 'kl',
    initials: 'KL',
    name: 'Kira Lin',
    role: 'Systems UI',
    bgVar: 'var(--md-secondary-container)',
    fgVar: 'var(--md-on-secondary-container)',
  },
  {
    id: 'sr',
    initials: 'SR',
    name: 'Sam Rivera',
    role: 'Color Tokens',
    bgVar: 'var(--md-tertiary-container)',
    fgVar: 'var(--md-on-tertiary-container)',
  },
  {
    id: 'jt',
    initials: 'JT',
    name: 'Jordan Tate',
    role: 'Compose Eng',
    bgVar: 'var(--md-primary)',
    fgVar: 'var(--md-on-primary)',
  },
];

interface ExpressiveAvatarStackStageProps {
  isDemoActive: boolean;
  isHovered: boolean;
  isManualActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveAvatarStackStage: React.FC<ExpressiveAvatarStackStageProps> = ({
  isDemoActive,
  isHovered,
  isManualActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [hasSelected, setHasSelected] = useState(false);
  const lastStatusRef = useRef('4 active');

  const isFanned = isHovered || isManualActive || hasSelected;
  const activePerson = COLLABORATORS[focusedIndex];

  useEffect(() => {
    const next = isFanned ? activePerson.name.split(' ')[0] : '4 active';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isFanned, activePerson.name, onStatusChange]);

  // Autonomous hover choreography: walk focus across fanned avatars with squircle lift
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setFocusedIndex((prev) => (prev + 1) % COLLABORATORS.length);
    }, 1050);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelectAvatar = (idx: number) => {
    claimManualControl();
    setHasSelected(true);
    setFocusedIndex(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      {/* Overlapping Circle -> Fanned Squircle Avatar Stack */}
      <div
        role="radiogroup"
        aria-label="Active collaborators"
        className="flex items-center justify-center min-h-[68px]"
      >
        {COLLABORATORS.map((person, idx) => {
          const isFocused = idx === focusedIndex && isFanned;
          const overlapMargin = idx === 0 ? 0 : isFanned ? 10 : -10;

          return (
            <motion.button
              key={person.id}
              type="button"
              role="radio"
              aria-checked={idx === focusedIndex}
              aria-label={`${person.name}, ${person.role}`}
              onClick={() => handleSelectAvatar(idx)}
              onFocus={claimManualControl}
              animate={{
                marginLeft: overlapMargin,
                borderRadius: isFocused ? 16 : 999,
                y: isFocused ? -7 : 0,
                scale: isFocused ? 1.12 : 1,
              }}
              whileTap={reducedMotion ? undefined : { scale: 0.93 }}
              transition={springTransition}
              style={{
                backgroundColor: person.bgVar,
                color: person.fgVar,
                zIndex: isFocused ? 20 : COLLABORATORS.length - idx,
              }}
              className={`relative flex h-[50px] w-[50px] items-center justify-center font-display text-[14px] font-bold cursor-pointer select-none shadow-xs transition-[box-shadow,filter] duration-150 ${
                isFocused
                  ? 'ring-[3px] ring-[var(--md-primary)] ring-offset-2 ring-offset-[var(--bento-card-bg,var(--md-surface-container))]'
                  : 'ring-[3px] ring-[var(--bento-card-bg,var(--md-surface-container))] hover:brightness-95'
              }`}
            >
              {person.initials}
            </motion.button>
          );
        })}
      </div>

      {/* Instant Non-Blocking Collaborator Caption */}
      <div className="h-5 flex items-center justify-center text-[12px] text-[var(--md-on-surface-variant)] select-none overflow-hidden">
        <motion.div
          key={activePerson.id}
          initial={reducedMotion ? false : { y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <span className="font-medium text-[var(--md-on-surface)]">{activePerson.name}</span>
          <span aria-hidden="true">·</span>
          <span>{activePerson.role}</span>
        </motion.div>
      </div>
    </div>
  );
};

interface ExpressiveAvatarStackCardProps {
  className?: string;
}

export const ExpressiveAvatarStackCard: React.FC<ExpressiveAvatarStackCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('4 active');

  return (
    <BentoCard
      indexLabel="28"
      title="Expressive Avatar Stack"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, isHovered, isManualActive, claimManualControl, reducedMotion }) => (
        <ExpressiveAvatarStackStage
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
