import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Layers, Sliders } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface CarouselSlide {
  id: string;
  index: string;
  title: string;
  detail: string;
  bgVar: string;
  fgVar: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const SLIDES: CarouselSlide[] = [
  {
    id: 'spatial',
    index: '01',
    title: 'Spatial Springs',
    detail: 'Elastic overshoot',
    bgVar: 'var(--md-primary-container)',
    fgVar: 'var(--md-on-primary-container)',
    icon: Compass,
  },
  {
    id: 'tonal',
    index: '02',
    title: 'Tonal Layers',
    detail: 'Dynamic surfaces',
    bgVar: 'var(--md-secondary-container)',
    fgVar: 'var(--md-on-secondary-container)',
    icon: Layers,
  },
  {
    id: 'adaptive',
    index: '03',
    title: 'Shape Tokens',
    detail: 'Fluid geometry',
    bgVar: 'var(--md-tertiary-container)',
    fgVar: 'var(--md-on-tertiary-container)',
    icon: Sliders,
  },
];

interface ExpressiveCarouselStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveCarouselStage: React.FC<ExpressiveCarouselStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastStatusRef = useRef('01 / 03');

  useEffect(() => {
    const next = `0${activeIndex + 1} / 0${SLIDES.length}`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [activeIndex, onStatusChange]);

  // Autonomous hover choreography: smoothly cycle active hero card across the carousel
  useEffect(() => {
    if (!isDemoActive) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 1450);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleSelect = (idx: number) => {
    claimManualControl();
    setActiveIndex(idx);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full max-w-[360px]">
      {/* M3 Expressive Multi-Browse Expanding Carousel */}
      <div
        role="tablist"
        aria-label="Material 3 expressive hero carousel"
        className="flex items-stretch gap-2 w-full h-[132px]"
      >
        {SLIDES.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const Icon = slide.icon;

          return (
            <motion.button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${slide.title}: ${slide.detail}`}
              onClick={() => handleSelect(idx)}
              onFocus={claimManualControl}
              animate={{
                flexGrow: isActive ? 3.5 : 0.9,
                borderRadius: isActive ? 24 : 20,
              }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
              transition={springTransition}
              style={{
                backgroundColor: slide.bgVar,
                color: slide.fgVar,
              }}
              className="relative flex flex-col justify-between p-3.5 text-left overflow-hidden cursor-pointer select-none basis-0 min-w-[52px]"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.1} />
                <motion.span
                  animate={{ opacity: isActive ? 0.75 : 0 }}
                  transition={{ duration: 0.16 }}
                  className="text-[11px] font-semibold tabular-nums shrink-0"
                >
                  {slide.index}
                </motion.span>
              </div>

              <motion.div
                animate={{
                  opacity: isActive ? 1 : 0,
                  x: isActive ? 0 : -8,
                }}
                transition={
                  reducedMotion
                    ? M3_SPRINGS.instant
                    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                }
                className="min-w-[120px]"
              >
                <p className="font-display text-[14px] font-semibold leading-tight whitespace-nowrap">
                  {slide.title}
                </p>
                <p className="text-[11.5px] opacity-80 whitespace-nowrap mt-0.5">
                  {slide.detail}
                </p>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Hero carousel</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-[var(--md-on-surface)]">
          {SLIDES[activeIndex].title}
        </span>
      </div>
    </div>
  );
};

interface ExpressiveCarouselCardProps {
  className?: string;
}

export const ExpressiveCarouselCard: React.FC<ExpressiveCarouselCardProps> = ({ className }) => {
  const [status, setStatus] = useState('01 / 03');

  return (
    <BentoCard
      indexLabel="12"
      title="Expressive Carousel"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveCarouselStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
