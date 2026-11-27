import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface TimePreset {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
}

const DEMO_TIMES: TimePreset[] = [
  { hour: 9, minute: 30, period: 'AM' },
  { hour: 10, minute: 15, period: 'AM' },
  { hour: 2, minute: 45, period: 'PM' },
  { hour: 6, minute: 0, period: 'PM' },
];

interface RollingDigitProps {
  value: string;
  reducedMotion: boolean;
}

const RollingDigit: React.FC<RollingDigitProps> = ({ value, reducedMotion }) => {
  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <span className="relative inline-flex h-[44px] w-[54px] items-center justify-center overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reducedMotion ? false : { y: 26, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { y: -26, opacity: 0, scale: 0.85 }}
          transition={springTransition}
          style={{
            fontFamily: '"Roboto Flex", system-ui, sans-serif',
            fontVariationSettings: '"wght" 760, "wdth" 110, "opsz" 64',
          }}
          className="text-[32px] leading-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

interface ExpressiveTimePickerStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveTimePickerStage: React.FC<ExpressiveTimePickerStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [focusedField, setFocusedField] = useState<'hour' | 'minute'>('hour');
  const lastStatusRef = useRef('09:30 AM');

  const hourStr = String(hour).padStart(2, '0');
  const minStr = String(minute).padStart(2, '0');

  useEffect(() => {
    const next = `${hourStr}:${minStr} ${period}`;
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [hourStr, minStr, period, onStatusChange]);

  // Autonomous hover choreography: cycle through presets with rolling digit springs
  useEffect(() => {
    if (!isDemoActive) return;

    let step = 0;
    const interval = window.setInterval(() => {
      step = (step + 1) % DEMO_TIMES.length;
      const preset = DEMO_TIMES[step];
      setFocusedField(step % 2 === 0 ? 'hour' : 'minute');
      setHour(preset.hour);
      setMinute(preset.minute);
      setPeriod(preset.period);
    }, 1250);

    return () => clearInterval(interval);
  }, [isDemoActive]);

  const handleStepHour = () => {
    claimManualControl();
    setFocusedField('hour');
    setHour((prev) => (prev % 12) + 1);
  };

  const handleStepMinute = () => {
    claimManualControl();
    setFocusedField('minute');
    setMinute((prev) => (prev + 15) % 60);
  };

  const handleSetPeriod = (next: 'AM' | 'PM') => {
    claimManualControl();
    setPeriod(next);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex items-center justify-center gap-2">
        {/* Hour Expressive Digit Container */}
        <motion.button
          type="button"
          onClick={handleStepHour}
          onFocus={claimManualControl}
          aria-label={`Hour ${hourStr}. Click to increment hour`}
          animate={{
            borderRadius: focusedField === 'hour' ? 24 : 18,
            backgroundColor:
              focusedField === 'hour'
                ? 'var(--md-primary-container)'
                : 'var(--md-surface-container-highest)',
            color:
              focusedField === 'hour'
                ? 'var(--md-on-primary-container)'
                : 'var(--md-on-surface)',
          }}
          whileTap={reducedMotion ? undefined : { scale: 0.94 }}
          transition={springTransition}
          className="flex items-center justify-center h-[91px] lg:h-[70px] w-[74px] cursor-pointer select-none shadow-xs"
        >
          <RollingDigit value={hourStr} reducedMotion={reducedMotion} />
        </motion.button>

        <span
          aria-hidden="true"
          className="font-display text-[28px] font-bold text-[var(--md-on-surface-variant)] select-none -mt-0.5"
        >
          :
        </span>

        {/* Minute Expressive Digit Container */}
        <motion.button
          type="button"
          onClick={handleStepMinute}
          onFocus={claimManualControl}
          aria-label={`Minute ${minStr}. Click to add 15 minutes`}
          animate={{
            borderRadius: focusedField === 'minute' ? 24 : 18,
            backgroundColor:
              focusedField === 'minute'
                ? 'var(--md-primary-container)'
                : 'var(--md-surface-container-highest)',
            color:
              focusedField === 'minute'
                ? 'var(--md-on-primary-container)'
                : 'var(--md-on-surface)',
          }}
          whileTap={reducedMotion ? undefined : { scale: 0.94 }}
          transition={springTransition}
          className="flex items-center justify-center h-[91px] lg:h-[70px] w-[74px] cursor-pointer select-none shadow-xs"
        >
          <RollingDigit value={minStr} reducedMotion={reducedMotion} />
        </motion.button>

        {/* Connected Vertical AM/PM Selector */}
        <div
          role="radiogroup"
          aria-label="Time period"
          className="flex flex-col gap-[3px] ml-1"
        >
          {(['AM', 'PM'] as const).map((item) => {
            const isSelected = period === item;
            const isTop = item === 'AM';

            return (
              <motion.button
                key={item}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSetPeriod(item)}
                onFocus={claimManualControl}
                animate={{
                  borderTopLeftRadius: isSelected ? 999 : isTop ? 14 : 6,
                  borderTopRightRadius: isSelected ? 999 : isTop ? 14 : 6,
                  borderBottomLeftRadius: isSelected ? 999 : isTop ? 6 : 14,
                  borderBottomRightRadius: isSelected ? 999 : isTop ? 6 : 14,
                  backgroundColor: isSelected
                    ? 'var(--md-tertiary-container)'
                    : 'var(--md-surface-container-highest)',
                  color: isSelected
                    ? 'var(--md-on-tertiary-container)'
                    : 'var(--md-on-surface-variant)',
                }}
                whileTap={reducedMotion ? undefined : { scale: 0.93 }}
                transition={springTransition}
                className="flex items-center justify-center min-h-[44px] lg:min-h-[34px] min-w-[46px] px-2.5 font-display text-[12px] font-bold cursor-pointer select-none"
              >
                {item}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-[var(--md-on-surface-variant)] select-none">
        <span>Rolling numerals</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-[var(--md-on-surface)]">Tap digits to step</span>
      </div>
    </div>
  );
};

interface ExpressiveTimePickerCardProps {
  className?: string;
}

export const ExpressiveTimePickerCard: React.FC<ExpressiveTimePickerCardProps> = ({
  className,
}) => {
  const [status, setStatus] = useState('09:30 AM');

  return (
    <BentoCard
      indexLabel="19"
      title="Expressive Time Picker"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveTimePickerStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
