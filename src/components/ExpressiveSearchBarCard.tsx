import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface SuggestionItem {
  id: string;
  query: string;
  category: string;
}

const SUGGESTIONS: SuggestionItem[] = [
  { id: 'springs', query: 'Spatial spring physics', category: 'Motion' },
  { id: 'tokens', query: 'Dynamic tonal roles', category: 'Color' },
  { id: 'shapes', query: 'Expressive shape morph', category: 'Geometry' },
];

interface ExpressiveSearchBarStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveSearchBarStage: React.FC<ExpressiveSearchBarStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [manualOpen, setManualOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const focusTimerRef = useRef<number | null>(null);
  const lastStatusRef = useRef('Collapsed');

  const isOpen = manualOpen || demoOpen;

  useEffect(() => {
    const next = isOpen ? 'Expanded' : query ? 'Filtered' : 'Collapsed';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isOpen, query, onStatusChange]);

  // Autonomous hover choreography isolated to demoOpen
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

      setDemoOpen(true);
      setHighlightedIndex(null);

      timers.push(window.setTimeout(() => setHighlightedIndex(0), 650));
      timers.push(window.setTimeout(() => setHighlightedIndex(1), 1250));
      timers.push(
        window.setTimeout(() => {
          setDemoOpen(false);
          setHighlightedIndex(null);
        }, 2150)
      );
    };

    runCycle();
    const interval = window.setInterval(runCycle, 3050);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      setDemoOpen(false);
      setHighlightedIndex(null);
    };
  }, [isDemoActive]);

  const filteredSuggestions = query.trim()
    ? SUGGESTIONS.filter(
        (item) =>
          item.query.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS;

  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const handleOpenManual = () => {
    claimManualControl();
    setDemoOpen(false);
    setManualOpen(true);
    if (focusTimerRef.current !== null) {
      window.clearTimeout(focusTimerRef.current);
    }
    focusTimerRef.current = window.setTimeout(() => {
      inputRef.current?.focus();
      focusTimerRef.current = null;
    }, 40);
  };

  const handleCloseManual = () => {
    claimManualControl();
    setManualOpen(false);
    setDemoOpen(false);
    setHighlightedIndex(null);
  };

  const handlePickSuggestion = (text: string) => {
    claimManualControl();
    setQuery(text);
    setManualOpen(false);
    setDemoOpen(false);
    setHighlightedIndex(null);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="w-full max-w-[290px] flex flex-col items-center justify-start min-h-[188px] pt-1">
      <motion.div
        layout={!reducedMotion}
        animate={{
          borderRadius: isOpen ? 22 : 999,
          backgroundColor: isOpen
            ? 'var(--md-surface-container-high)'
            : 'var(--md-surface-container-highest)',
        }}
        transition={springTransition}
        className="w-full border border-[var(--md-outline-variant)]/75 overflow-hidden shadow-xs"
      >
        {/* Top Input Bar */}
        <div className="flex items-center gap-2 px-2 min-h-[48px]">
          <button
            type="button"
            onClick={isOpen ? handleCloseManual : handleOpenManual}
            onFocus={claimManualControl}
            aria-label={isOpen ? 'Close search' : 'Open search'}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] cursor-pointer shrink-0"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="back"
                  initial={reducedMotion ? false : { rotate: -60, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={reducedMotion ? undefined : { rotate: 45, opacity: 0, scale: 0.7 }}
                  transition={springTransition}
                >
                  <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </motion.span>
              ) : (
                <motion.span
                  key="search"
                  initial={reducedMotion ? false : { rotate: 45, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={reducedMotion ? undefined : { rotate: -45, opacity: 0, scale: 0.7 }}
                  transition={springTransition}
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={2.1} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={handleOpenManual}
            onChange={(e) => {
              claimManualControl();
              setManualOpen(true);
              setQuery(e.target.value);
            }}
            placeholder="Search tokens..."
            aria-label="Search Material 3 tokens"
            className="w-full min-w-0 bg-transparent text-[13.5px] font-medium text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)]/80 focus:outline-none py-2"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                claimManualControl();
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[36px] lg:min-w-[36px] rounded-full text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Expanding Staggered Suggestions Drawer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="suggestions"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={springTransition}
              className="overflow-hidden border-t border-[var(--md-outline-variant)]/60"
            >
              <div className="p-1.5 space-y-0.5">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, idx) => {
                    const isHighlighted = highlightedIndex === idx;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={
                          reducedMotion
                            ? M3_SPRINGS.instant
                            : { ...M3_SPRINGS.fastSpatial, delay: idx * 0.04 }
                        }
                        onClick={() => handlePickSuggestion(item.query)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                        className={`w-full flex items-center justify-between gap-2 min-h-[44px] lg:min-h-[38px] px-3 rounded-[14px] text-left text-[12.5px] cursor-pointer transition-colors duration-150 ${
                          isHighlighted
                            ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)] font-semibold'
                            : 'text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)]'
                        }`}
                      >
                        <span className="truncate">{item.query}</span>
                        <span className="text-[11px] opacity-70 shrink-0">{item.category}</span>
                      </motion.button>
                    );
                  })
                ) : (
                  <p className="px-3 py-3 text-[12px] text-[var(--md-on-surface-variant)] text-center">
                    No matching tokens
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!isOpen && (
        <p className="mt-8 text-[12px] text-[var(--md-on-surface-variant)] select-none text-center">
          {query ? `Selected · ${query}` : 'Pill bar → R22 container morph'}
        </p>
      )}
    </div>
  );
};

interface ExpressiveSearchBarCardProps {
  className?: string;
}

export const ExpressiveSearchBarCard: React.FC<ExpressiveSearchBarCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Collapsed');

  return (
    <BentoCard
      indexLabel="13"
      title="Morphing Search Bar"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveSearchBarStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
