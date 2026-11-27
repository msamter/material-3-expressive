import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { M3_SPRINGS } from '../data/m3Theme';

interface TrackInfo {
  title: string;
  artist: string;
  durationSec: number;
}

const TRACKS: TrackInfo[] = [
  { title: 'Kinetic Glass', artist: 'Studio Nine', durationSec: 214 },
  { title: 'Tonal Drift', artist: 'M. Solis', durationSec: 188 },
  { title: 'Warm Surface', artist: 'Field Notes', durationSec: 242 },
];

const SCRUB_WIDTH = 220;

function buildSquigglePath(width: number, amplitude: number, phase: number): string {
  if (width <= 2) return 'M0 7L0 7';
  let path = '';
  for (let x = 0; x <= width; x += 3) {
    const fade = Math.min(1, x / 8, (width - x) / 8);
    const y = 7 + Math.sin((x / 22) * Math.PI * 2 - phase) * amplitude * Math.max(0, fade);
    path += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`;
  }
  return path;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface ExpressiveMediaStageProps {
  isDemoActive: boolean;
  claimManualControl: () => void;
  reducedMotion: boolean;
  onStatusChange: (status: string) => void;
}

const ExpressiveMediaStage: React.FC<ExpressiveMediaStageProps> = ({
  isDemoActive,
  claimManualControl,
  reducedMotion,
  onStatusChange,
}) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [manualPlaying, setManualPlaying] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);

  const pathRef = useRef<SVGPathElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const timeTextRef = useRef<HTMLSpanElement | null>(null);
  const animRef = useRef({
    progress: 0.42,
    phase: 0,
    amp: 0,
  });
  const lastStatusRef = useRef('Paused');

  const isPlaying = manualPlaying || demoPlaying;
  const track = TRACKS[trackIndex];

  useEffect(() => {
    const next = isPlaying ? 'Playing' : 'Paused';
    if (lastStatusRef.current !== next) {
      lastStatusRef.current = next;
      onStatusChange(next);
    }
  }, [isPlaying, onStatusChange]);

  // Autonomous hover choreography: morph circle -> squircle play/pause + wave activation
  useEffect(() => {
    if (!isDemoActive) {
      setDemoPlaying(false);
      return;
    }

    setDemoPlaying(true);
    const interval = window.setInterval(() => {
      setDemoPlaying((prev) => !prev);
    }, 2100);

    return () => {
      clearInterval(interval);
      setDemoPlaying(false);
    };
  }, [isDemoActive]);

  // Zero-rerender DOM RAF loop smoothly transitioning flat line <-> undulating audio squiggle
  useEffect(() => {
    const targetAmp = isPlaying && !reducedMotion ? 3.1 : 0;
    let rafId = 0;
    let lastTime = performance.now();

    const renderFrame = (now: number) => {
      if (document.hidden) {
        lastTime = now;
        rafId = window.requestAnimationFrame(renderFrame);
        return;
      }

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const s = animRef.current;

      // Smoothly ease amplitude toward active/flat target
      s.amp += (targetAmp - s.amp) * Math.min(1, dt * 10);

      if (isPlaying) {
        s.phase += dt * 5.8;
        s.progress += dt * 0.045;
        if (s.progress >= 0.96) s.progress = 0.08;
      }

      const activePx = s.progress * SCRUB_WIDTH;
      pathRef.current?.setAttribute('d', buildSquigglePath(activePx, s.amp, s.phase));
      if (thumbRef.current) {
        thumbRef.current.style.left = `${(s.progress * 100).toFixed(2)}%`;
      }
      if (timeTextRef.current) {
        timeTextRef.current.textContent = formatTime(s.progress * track.durationSec);
      }

      // Stop RAF once flat & paused to save 100% CPU when idle
      const stillSettling = Math.abs(targetAmp - s.amp) > 0.05;
      if (isPlaying || stillSettling) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        s.amp = targetAmp;
        pathRef.current?.setAttribute('d', buildSquigglePath(activePx, 0, s.phase));
        rafId = 0;
      }
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying, reducedMotion, track.durationSec]);

  const handleTogglePlay = () => {
    claimManualControl();
    setManualPlaying((prev) => (demoPlaying ? false : !prev));
    setDemoPlaying(false);
  };

  const handleSkip = (dir: -1 | 1) => {
    claimManualControl();
    animRef.current.progress = 0.14;
    setTrackIndex((prev) => (prev + dir + TRACKS.length) % TRACKS.length);
  };

  const springTransition = reducedMotion ? M3_SPRINGS.instant : M3_SPRINGS.fastSpatial;

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[270px]">
      {/* Track Title + Transport Controls */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-semibold text-[var(--md-on-surface)] truncate">
            {track.title}
          </p>
          <p className="text-[12px] text-[var(--md-on-surface-variant)] truncate">
            {track.artist}
          </p>
        </div>

        {/* Morphing Circle <-> Squircle Play/Pause Action */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleSkip(-1)}
            onFocus={claimManualControl}
            aria-label="Previous track"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)] cursor-pointer transition-colors"
          >
            <SkipBack className="h-4 w-4" strokeWidth={2.2} />
          </button>

          <motion.button
            type="button"
            onClick={handleTogglePlay}
            onFocus={claimManualControl}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            aria-pressed={isPlaying}
            animate={{
              borderRadius: isPlaying ? 16 : 999,
              backgroundColor: isPlaying
                ? 'var(--md-primary)'
                : 'var(--md-primary-container)',
              color: isPlaying
                ? 'var(--md-on-primary)'
                : 'var(--md-on-primary-container)',
            }}
            whileHover={reducedMotion ? undefined : { scale: 1.06 }}
            whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            transition={springTransition}
            className="inline-flex items-center justify-center min-h-[50px] min-w-[50px] shadow-sm cursor-pointer select-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <motion.span
                  key="pause"
                  initial={reducedMotion ? false : { scale: 0.55, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={reducedMotion ? undefined : { scale: 0.55, opacity: 0 }}
                  transition={springTransition}
                >
                  <Pause className="h-5 w-5 fill-current" strokeWidth={1.8} />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={reducedMotion ? false : { scale: 0.55, opacity: 0, rotate: 25 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={reducedMotion ? undefined : { scale: 0.55, opacity: 0 }}
                  transition={springTransition}
                >
                  <Play className="h-5 w-5 fill-current translate-x-[1px]" strokeWidth={1.8} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            type="button"
            onClick={() => handleSkip(1)}
            onFocus={claimManualControl}
            aria-label="Next track"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] lg:min-h-[38px] lg:min-w-[38px] rounded-full text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)] cursor-pointer transition-colors"
          >
            <SkipForward className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Android 16 Squiggly <-> Flat Audio Scrubber */}
      <div className="w-full space-y-1.5">
        <div className="relative h-4 w-full flex items-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-[var(--md-secondary-container)]" />
          <svg
            width="100%"
            height={14}
            viewBox={`0 0 ${SCRUB_WIDTH} 14`}
            preserveAspectRatio="none"
            className="relative z-10 overflow-visible block"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d={buildSquigglePath(0.42 * SCRUB_WIDTH, 0, 0)}
              fill="none"
              stroke="var(--md-primary)"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </svg>
          <div
            ref={thumbRef}
            style={{ left: '42%' }}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-1.5 rounded-full bg-[var(--md-primary)]"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--md-on-surface-variant)] tabular-nums select-none">
          <span ref={timeTextRef}>{formatTime(0.42 * track.durationSec)}</span>
          <span>{isPlaying ? 'Squiggle wave · Squircle' : 'Flat track · Circle'}</span>
          <span>{formatTime(track.durationSec)}</span>
        </div>
      </div>
    </div>
  );
};

interface ExpressiveMediaCardProps {
  className?: string;
}

export const ExpressiveMediaCard: React.FC<ExpressiveMediaCardProps> = ({ className }) => {
  const [status, setStatus] = useState('Paused');

  return (
    <BentoCard
      indexLabel="15"
      title="Expressive Media Player"
      readout={status}
      surfaceVariant="low"
      className={className}
    >
      {({ isDemoActive, claimManualControl, reducedMotion }) => (
        <ExpressiveMediaStage
          isDemoActive={isDemoActive}
          claimManualControl={claimManualControl}
          reducedMotion={reducedMotion}
          onStatusChange={setStatus}
        />
      )}
    </BentoCard>
  );
};
