import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Download, FileCode2, FileText, Link2 } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface ExportOption {
  id: string;
  label: string;
  format: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'png', label: 'Export PNG', format: '2x Raster', icon: Download },
  { id: 'svg', label: 'Export SVG', format: 'Vector', icon: FileCode2 },
  { id: 'pdf', label: 'Export PDF', format: 'Print', icon: FileText },
  { id: 'link', label: 'Copy Link', format: 'Share URL', icon: Link2 },
];

interface SplitButtonStageProps {
  isDemoActive: boolean;
  isHovered: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const SplitButtonStage: React.FC<SplitButtonStageProps> = ({
  isDemoActive,
  isHovered,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [justTriggered, setJustTriggered] = useState(false);

  const triggerTimerRef = useRef<number | null>(null);
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;
  const lastStatusRef = useRef('');

  const isOpen = manualOpen || demoOpen;
  const currentOption = EXPORT_OPTIONS[selectedIndex];

  useEffect(() => {
    const nextStatus = isOpen ? 'Menu open' : currentOption.format;
    if (lastStatusRef.current !== nextStatus) {
      lastStatusRef.current = nextStatus;
      onStatusChange(nextStatus);
    }
  }, [isOpen, currentOption.format, onStatusChange]);

  useEffect(() => {
    return () => {
      if (triggerTimerRef.current !== null) window.clearTimeout(triggerTimerRef.current);
    };
  }, []);

  // Close manually opened menu cleanly when pointer leaves the tile on desktop
  useEffect(() => {
    if (!isHovered && demoOpen) {
      setDemoOpen(false);
      setHighlightedIndex(null);
    }
  }, [isHovered, demoOpen]);

  // Autonomous hover choreography isolated to demoOpen so manual toggles are never slammed shut
  useEffect(() => {
    if (!isDemoActive) {
      setDemoOpen(false);
      setHighlightedIndex(null);
      return;
    }

    let timers: number[] = [];

    const runCycle = () => {
      timers.forEach(clearTimeout);
      timers = [];

      const nextIndex = (selectedRef.current + 1) % EXPORT_OPTIONS.length;
      const previewIndex = (selectedRef.current + 2) % EXPORT_OPTIONS.length;

      setDemoOpen(true);
      setHighlightedIndex(selectedRef.current);

      timers.push(
        window.setTimeout(() => {
          setHighlightedIndex(previewIndex);
        }, 620)
      );

      timers.push(
        window.setTimeout(() => {
          setHighlightedIndex(nextIndex);
        }, 1180)
      );

      timers.push(
        window.setTimeout(() => {
          setSelectedIndex(nextIndex);
        }, 1620)
      );

      timers.push(
        window.setTimeout(() => {
          setDemoOpen(false);
          setHighlightedIndex(null);
        }, 2120)
      );
    };

    runCycle();
    const interval = window.setInterval(runCycle, 3100);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setDemoOpen(false);
      setHighlightedIndex(null);
    };
  }, [isDemoActive]);

  const handlePrimaryAction = useCallback(() => {
    claimManualControl();
    setManualOpen(false);
    setDemoOpen(false);
    setJustTriggered(true);
    if (triggerTimerRef.current !== null) window.clearTimeout(triggerTimerRef.current);
    triggerTimerRef.current = window.setTimeout(() => {
      setJustTriggered(false);
      triggerTimerRef.current = null;
    }, 1400);
  }, [claimManualControl]);

  const handleToggleMenu = useCallback(() => {
    claimManualControl();
    // If demo had menu open when user clicked chevron, transition cleanly to closed (or open if closed)
    setManualOpen((prev) => (demoOpen ? false : !prev));
    setDemoOpen(false);
    setHighlightedIndex(null);
  }, [claimManualControl, demoOpen]);

  const handleSelectOption = useCallback(
    (index: number) => {
      claimManualControl();
      setSelectedIndex(index);
      setManualOpen(false);
      setDemoOpen(false);
      setHighlightedIndex(null);
    },
    [claimManualControl]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setManualOpen(false);
      setDemoOpen(false);
      setHighlightedIndex(null);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      claimManualControl();
      setManualOpen(true);
      setHighlightedIndex((prev) => (prev === null ? 0 : (prev + 1) % EXPORT_OPTIONS.length));
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      claimManualControl();
      setManualOpen(true);
      setHighlightedIndex((prev) =>
        prev === null
          ? EXPORT_OPTIONS.length - 1
          : (prev - 1 + EXPORT_OPTIONS.length) % EXPORT_OPTIONS.length
      );
    } else if (e.key === 'Enter' && isOpen && highlightedIndex !== null) {
      e.preventDefault();
      handleSelectOption(highlightedIndex);
    }
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;
  const ActiveIcon = currentOption.icon;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full max-w-[260px]"
      onKeyDown={handleKeyDown}
    >
      {/* M3 Expressive Split Button Layout */}
      <div className="inline-flex items-center gap-[3px] z-20 shrink-0">
        <motion.button
          type="button"
          onClick={handlePrimaryAction}
          onFocus={claimManualControl}
          whileTap={reducedMotion ? undefined : { scale: 0.96, borderRadius: 14 }}
          transition={springTransition}
          className="inline-flex items-center gap-2.5 min-h-[46px] pl-5 pr-4 rounded-l-full rounded-r-[8px] bg-[var(--md-primary)] text-[var(--md-on-primary)] font-display text-[14px] font-semibold tracking-[-0.01em] cursor-pointer select-none whitespace-nowrap shrink-0 hover:brightness-105 transition-[filter] duration-150"
        >
          <span className="flex h-4 w-4 items-center justify-center shrink-0">
            {justTriggered ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <ActiveIcon className="h-4 w-4" strokeWidth={2.1} />
            )}
          </span>
          <span>{justTriggered ? 'Done' : currentOption.label}</span>
        </motion.button>

        <motion.button
          type="button"
          aria-label="More export options"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={handleToggleMenu}
          onFocus={claimManualControl}
          animate={{
            borderTopLeftRadius: isOpen ? 999 : 8,
            borderBottomLeftRadius: isOpen ? 999 : 8,
            borderTopRightRadius: 999,
            borderBottomRightRadius: 999,
            backgroundColor: isOpen
              ? 'var(--md-primary-container)'
              : 'var(--md-primary)',
            color: isOpen
              ? 'var(--md-on-primary-container)'
              : 'var(--md-on-primary)',
          }}
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
          transition={springTransition}
          className="inline-flex items-center justify-center min-h-[46px] min-w-[46px] px-3 cursor-pointer select-none shrink-0"
        >
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={springTransition}
            className="flex items-center justify-center"
          >
            <ChevronDown className="h-[18px] w-[18px]" strokeWidth={2.3} />
          </motion.span>
        </motion.button>
      </div>

      {/* Expressive Dropdown Menu with compact desktop vertical budget so it never clips */}
      <div className="relative w-full mt-2 min-h-[184px] lg:min-h-[164px] flex items-start justify-center">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              key="menu"
              role="menu"
              aria-label="Export options"
              initial={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: -10, scale: 0.94, originY: 0 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.95 }
              }
              transition={springTransition}
              className="w-full rounded-[20px] border border-[var(--md-outline-variant)]/80 bg-[var(--md-surface-container-high)] p-1.5 shadow-md z-10"
            >
              {EXPORT_OPTIONS.map((option, idx) => {
                const Icon = option.icon;
                const isSelected = idx === selectedIndex;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reducedMotion
                        ? M3_SPRINGS.instant
                        : { ...M3_SPRINGS.fastSpatial, delay: idx * 0.04 }
                    }
                    onClick={() => handleSelectOption(idx)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-2 min-h-[44px] lg:min-h-[37px] px-3 py-1.5 rounded-[13px] text-left text-[13px] font-medium cursor-pointer transition-colors duration-150 ${
                      isSelected
                        ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] font-semibold'
                        : isHighlighted
                        ? 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)]'
                        : 'text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 whitespace-nowrap truncate">
                      <Icon className="h-4 w-4 shrink-0 opacity-85" strokeWidth={2} />
                      <span>{option.label}</span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] opacity-70">{option.format}</span>
                      {isSelected && (
                        <Check
                          className="h-4 w-4 text-[var(--md-primary)]"
                          strokeWidth={2.5}
                        />
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-9 text-center text-[12px] text-[var(--md-on-surface-variant)] select-none"
            >
              Active action ·{' '}
              <span className="font-medium text-[var(--md-on-surface)]">{currentOption.label}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface SplitButtonCardProps {
  className?: string;
}

export const SplitButtonCard: React.FC<SplitButtonCardProps> = ({ className }) => {
  const [status, setStatus] = useState('2x Raster');

  return (
    <BentoCard
      indexLabel="02"
      title="Split Button & Dropdown"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, isHovered, claimManualControl, reducedMotion }) => (
        <SplitButtonStage
          isDemoActive={isDemoActive}
          isHovered={isHovered}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
