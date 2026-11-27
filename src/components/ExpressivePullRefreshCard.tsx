import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, RotateCw } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

type RefreshPhase = 'idle' | 'pulling' | 'refreshing' | 'done';

const FEED_HEADLINES = [
  'Motion tokens synced',
  'Dynamic scheme updated',
  'Shape scale refreshed',
  'Spring curve calibrated',
];

interface ExpressivePullRefreshStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressivePullRefreshStage: React.FC<ExpressivePullRefreshStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [demoPhase, setDemoPhase] = useState<RefreshPhase>('idle');
  const [manualPhase, setManualPhase] = useState<RefreshPhase>('idle');
  const [feedIndex, setFeedIndex] = useState(0);
  const demoTimersRef = useRef<number[]>([]);
  const manualTimersRef = useRef<number[]>([]);
  const lastStatusRef = useRef('Idle');

  const phase: RefreshPhase = manualPhase !== 'idle' ? manualPhase : demoPhase;

  useEffect(() => {
    const label =
      phase === 'pulling'
        ? 'Pulling'
        : phase === 'refreshing'
        ? 'Syncing'
        : phase === 'done'
        ? 'Updated'
        : 'Idle';
    if (lastStatusRef.current !== label) {
      lastStatusRef.current = label;
      onStatusChange(label);
    }
  }, [phase, onStatusChange]);

  const clearTimerList = useCallback((list: React.MutableRefObject<number[]>) => {
    list.current.forEach((id) => window.clearTimeout(id));
    list.current = [];
  }, []);

  const runSequence = useCallback(
    (
      list: React.MutableRefObject<number[]>,
      setTargetPhase: React.Dispatch<React.SetStateAction<RefreshPhase>>
    ) => {
      clearTimerList(list);
      if (reducedMotion) {
        setFeedIndex((prev) => (prev + 1) % FEED_HEADLINES.length);
        setTargetPhase('done');
        list.current.push(window.setTimeout(() => setTargetPhase('idle'), 900));
        return;
      }

      setTargetPhase('pulling');
      list.current.push(window.setTimeout(() => setTargetPhase('refreshing'), 480));
      list.current.push(
        window.setTimeout(() => {
          setFeedIndex((prev) => (prev + 1) % FEED_HEADLINES.length);
          setTargetPhase('done');
        }, 1320)
      );
      list.current.push(window.setTimeout(() => setTargetPhase('idle'), 2150));
    },
    [clearTimerList, reducedMotion]
  );

  useEffect(() => {
    return () => {
      clearTimerList(demoTimersRef);
      clearTimerList(manualTimersRef);
    };
  }, [clearTimerList]);

  // Autonomous hover choreography isolated from manual triggers
  useEffect(() => {
    if (!isDemoActive) {
      clearTimerList(demoTimersRef);
      setDemoPhase('idle');
      return;
    }

    const startDemo = () => runSequence(demoTimersRef, setDemoPhase);
    startDemo();
    const interval = window.setInterval(startDemo, 2850);

    return () => {
      clearInterval(interval);
      clearTimerList(demoTimersRef);
      setDemoPhase('idle');
    };
  }, [isDemoActive, runSequence, clearTimerList]);

  const handleManualPull = () => {
    claimManualControl();
    clearTimerList(demoTimersRef);
    setDemoPhase('idle');
    runSequence(manualTimersRef, setManualPhase);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.defaultSpatial;
  const isPulling = phase === 'pulling';
  const isRefreshing = phase === 'refreshing';
  const pullOffsetY = isPulling ? 34 : isRefreshing ? 24 : 0;

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[290px]">
      <div className="relative w-full h-[132px] overflow-hidden rounded-[20px] border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container-low)] p-3 flex flex-col justify-between">
        {/* Contained M3 Expressive Pull-to-Refresh Spinner Badge */}
        <motion.div
          aria-hidden="true"
          animate={{
            y: isPulling ? 6 : isRefreshing ? 4 : -48,
            scale: isPulling ? 0.92 : isRefreshing ? 1 : 0.65,
            opacity: isPulling || isRefreshing ? 1 : 0,
          }}
          transition={springTransition}
          className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-sm"
        >
          <motion.span
            animate={{
              rotate: isRefreshing ? 360 : isPulling ? 180 : 0,
            }}
            transition={
              isRefreshing
                ? { repeat: Infinity, duration: 0.72, ease: 'linear' }
                : springTransition
            }
            className="flex items-center justify-center"
          >
            {isRefreshing ? (
              <RotateCw className="h-4 w-4" strokeWidth={2.4} />
            ) : (
              <ArrowDown className="h-4 w-4" strokeWidth={2.4} />
            )}
          </motion.span>
        </motion.div>

        {/* Elastic Translating Feed Card */}
        <motion.button
          type="button"
          onClick={handleManualPull}
          onFocus={claimManualControl}
          animate={{
            y: pullOffsetY,
            scaleY: isPulling ? 1.03 : 1,
          }}
          transition={springTransition}
          aria-label="Pull to refresh feed preview"
          className="relative z-10 w-full flex-1 rounded-[15px] bg-[var(--md-surface-container-high)] px-3.5 py-2.5 text-left cursor-pointer select-none flex flex-col justify-between hover:bg-[var(--md-surface-container-highest)] transition-colors duration-150"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[13px] font-semibold text-[var(--md-on-surface)] truncate">
              {FEED_HEADLINES[feedIndex]}
            </span>
            <span className="text-[11px] font-medium text-[var(--md-primary)] shrink-0">
              {isRefreshing ? 'Syncing' : 'Pull'}
            </span>
          </div>
          <p className="text-[11.5px] text-[var(--md-on-surface-variant)] truncate">
            Click to trigger elastic overscroll
          </p>
        </motion.button>
      </div>
    </div>
  );
};

interface ExpressivePullRefreshCardProps {
  className?: string;
}

export const ExpressivePullRefreshCard: React.FC<ExpressivePullRefreshCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('Idle');

  return (
    <BentoCard
      indexLabel="16"
      title="Expressive Pull-to-Refresh"
      readout={status}
      surfaceVariant="default"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressivePullRefreshStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
