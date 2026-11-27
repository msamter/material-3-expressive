import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  M3_THEMES,
  M3_THEME_ORDER,
  M3ColorMode,
  M3ThemeId,
  themeTokensToCssVars,
} from './data/m3Theme';
import { ExpressiveButtonCard } from './components/ExpressiveButtonCard';
import { SplitButtonCard } from './components/SplitButtonCard';
import { ExpressiveSliderCard } from './components/ExpressiveSliderCard';
import { ConnectedButtonGroupCard } from './components/ConnectedButtonGroupCard';
import { FloatingToolbarCard } from './components/FloatingToolbarCard';
import { ExpressiveLoadingCard } from './components/ExpressiveLoadingCard';

const STORAGE_THEME_KEY = 'm3-expressive-theme';
const STORAGE_MODE_KEY = 'm3-expressive-mode';

function readStoredTheme(): M3ThemeId {
  try {
    const saved = window.localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'indigo' || saved === 'sage' || saved === 'terracotta') {
      return saved;
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'indigo';
}

function readStoredMode(): M3ColorMode {
  try {
    const saved = window.localStorage.getItem(STORAGE_MODE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'light';
}

export default function App() {
  const [themeId, setThemeId] = useState<M3ThemeId>(readStoredTheme);
  const [colorMode, setColorMode] = useState<M3ColorMode>(readStoredMode);

  const activeTokens = useMemo(() => {
    const theme = M3_THEMES[themeId];
    return colorMode === 'dark' ? theme.dark : theme.light;
  }, [themeId, colorMode]);

  const cssVars = useMemo(() => themeTokensToCssVars(activeTokens), [activeTokens]);

  // Synchronize document root variables, dark class, mobile theme-color, and persisted preferences
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', colorMode === 'dark');
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    const themeColorMeta = document.querySelector<HTMLMetaElement>(
      `meta[name="theme-color"][media="(prefers-color-scheme: ${colorMode})"]`
    );
    if (themeColorMeta) {
      themeColorMeta.content = activeTokens.surface;
    }

    try {
      window.localStorage.setItem(STORAGE_THEME_KEY, themeId);
      window.localStorage.setItem(STORAGE_MODE_KEY, colorMode);
    } catch {
      // Ignore storage access restrictions
    }
  }, [themeId, colorMode, cssVars, activeTokens.surface]);

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden overflow-x-clip bg-[var(--md-surface)] text-[var(--md-on-surface)] transition-colors duration-300 m3-standard flex flex-col p-4 sm:p-5 gap-3 sm:gap-4"
    >
      {/* Minimal Header Strip with Dynamic Color Theme Switcher */}
      <header className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <h1 className="font-display text-[19px] sm:text-[21px] font-bold tracking-[-0.02em] text-[var(--md-on-surface)] whitespace-nowrap shrink-0">
          Material 3 Expressive
        </h1>

        <div className="flex items-center gap-2 shrink-0 max-w-full">
          {/* Dynamic Color Palette Switcher (M3 Connected Segmented Controls) */}
          <div
            role="radiogroup"
            aria-label="Dynamic color theme"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--md-surface-container)] p-1 border border-[var(--md-outline-variant)]/70"
          >
            {M3_THEME_ORDER.map((id) => {
              const theme = M3_THEMES[id];
              const isSelected = id === themeId;

              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setThemeId(id)}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] min-w-[44px] lg:min-h-[36px] px-2.5 sm:px-3.5 rounded-full text-[12px] sm:text-[13px] font-medium cursor-pointer select-none whitespace-nowrap shrink-0 transition-all duration-200 m3-spring ${
                    isSelected
                      ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-semibold shadow-xs'
                      : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: theme.swatch }}
                    className="h-3 w-3 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/20"
                  />
                  <span className="hidden md:inline">{theme.name}</span>
                  <span className="md:hidden">{theme.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Light / Dark Tonal Surface Mode Toggle */}
          <button
            type="button"
            onClick={() => setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'))}
            aria-label={
              colorMode === 'light'
                ? 'Switch to dark tonal palette'
                : 'Switch to light tonal palette'
            }
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)] cursor-pointer transition-colors duration-200 shrink-0"
          >
            {colorMode === 'light' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </button>
        </div>
      </header>

      {/* Single-Viewport Desktop Bento Box Grid -> Responsive Tablet (2-col) & Mobile (1-col) */}
      <main className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-12 gap-3 sm:gap-4">
        <ExpressiveButtonCard className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-6" />

        <SplitButtonCard className="lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-7" />

        <ExpressiveSliderCard className="lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-5" />

        <ConnectedButtonGroupCard className="lg:col-start-1 lg:col-span-4 lg:row-start-7 lg:row-span-6" />

        <FloatingToolbarCard className="lg:col-start-5 lg:col-span-4 lg:row-start-8 lg:row-span-5" />

        <ExpressiveLoadingCard className="lg:col-start-9 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
      </main>
    </div>
  );
}
