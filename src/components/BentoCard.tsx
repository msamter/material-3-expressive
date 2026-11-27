import React, { useCallback, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface BentoCardRenderProps {
  /** True when the pointer is hovering the tile, reduced motion is off, and user has not taken manual control */
  isDemoActive: boolean;
  /** True when the pointer is hovering the tile */
  isHovered: boolean;
  /** True when the user has directly interacted with a control inside this tile */
  isManualActive: boolean;
  /** Call whenever the user directly clicks, drags, taps, or focuses an interactive control */
  claimManualControl: () => void;
  /** Whether prefers-reduced-motion is active */
  reducedMotion: boolean;
}

interface BentoCardProps {
  indexLabel: string;
  title: string;
  readout?: string;
  className?: string;
  surfaceVariant?: 'low' | 'default';
  children: (props: BentoCardRenderProps) => React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  indexLabel,
  title,
  readout,
  className = '',
  surfaceVariant = 'low',
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [manualActive, setManualActive] = useState(false);

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      setIsHovered(true);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setManualActive(false);
  }, []);

  const claimManualControl = useCallback(() => {
    setManualActive(true);
  }, []);

  const isDemoActive = isHovered && !manualActive && !reducedMotion;

  const surfaceBg =
    surfaceVariant === 'low'
      ? 'bg-[var(--md-surface-container-low)]'
      : 'bg-[var(--md-surface-container)]';

  return (
    <section
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-label={`${indexLabel} ${title}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[var(--md-outline-variant)]/75 ${surfaceBg} p-4 sm:p-5 transition-colors duration-300 m3-standard min-h-[244px] lg:min-h-0 ${
        isHovered ? 'border-[var(--md-outline)]/90' : ''
      } ${className}`}
    >
      {/* Top-left compact unboxed component header */}
      <div className="flex items-baseline justify-between gap-2.5 shrink-0 select-none z-10 min-w-0">
        <h2 className="font-display text-[13px] font-semibold tracking-[-0.01em] text-[var(--md-on-surface-variant)] whitespace-nowrap truncate min-w-0">
          <span className="tabular-nums text-[var(--md-primary)] font-bold">{indexLabel}</span>
          <span className="mx-1.5 opacity-55" aria-hidden="true">
            ·
          </span>
          <span className="text-[var(--md-on-surface)]">{title}</span>
        </h2>

        {readout && (
          <span className="text-[12px] font-medium text-[var(--md-on-surface-variant)] tabular-nums whitespace-nowrap shrink-0">
            {readout}
          </span>
        )}
      </div>

      {/* Main component showcase stage */}
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center py-2">
        {children({
          isDemoActive,
          isHovered,
          isManualActive: manualActive,
          claimManualControl,
          reducedMotion,
        })}
      </div>
    </section>
  );
};
