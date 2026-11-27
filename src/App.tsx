import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
import { ExpressiveTextCard } from './components/ExpressiveTextCard';
import { ExpressiveChipsCard } from './components/ExpressiveChipsCard';
import { ExpressiveSkeletonCard } from './components/ExpressiveSkeletonCard';
import { ExpressiveSwitchCard } from './components/ExpressiveSwitchCard';
import { ExpressiveFabMenuCard } from './components/ExpressiveFabMenuCard';
import { ExpressiveCarouselCard } from './components/ExpressiveCarouselCard';
import { ExpressiveSearchBarCard } from './components/ExpressiveSearchBarCard';
import { ExpressiveNavBarCard } from './components/ExpressiveNavBarCard';
import { ExpressiveMediaCard } from './components/ExpressiveMediaCard';
import { ExpressivePullRefreshCard } from './components/ExpressivePullRefreshCard';
import { ExpressiveBottomSheetCard } from './components/ExpressiveBottomSheetCard';
import { ExpressiveNotificationCard } from './components/ExpressiveNotificationCard';
import { ExpressiveTimePickerCard } from './components/ExpressiveTimePickerCard';
import { ExpressiveSnackbarCard } from './components/ExpressiveSnackbarCard';
import { ExpressiveQuickTilesCard } from './components/ExpressiveQuickTilesCard';
import { ExpressiveStepperCard } from './components/ExpressiveStepperCard';
import { ExpressiveAccordionCard } from './components/ExpressiveAccordionCard';
import { ExpressiveRatingCard } from './components/ExpressiveRatingCard';
import { ExpressiveVolumeCard } from './components/ExpressiveVolumeCard';
import { ExpressiveChecklistCard } from './components/ExpressiveChecklistCard';
import { ExpressiveTabsCard } from './components/ExpressiveTabsCard';
import { ExpressiveAvatarStackCard } from './components/ExpressiveAvatarStackCard';
import { ExpressiveBadgeCard } from './components/ExpressiveBadgeCard';
import { ExpressiveDialCard } from './components/ExpressiveDialCard';

const STORAGE_THEME_KEY = 'm3-expressive-theme';
const STORAGE_MODE_KEY = 'm3-expressive-mode';

type ShowcasePage = 1 | 2;

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

/**
 * Memoized paginated Bento showcase grid (15 boxes on Page 1, 15 boxes on Page 2)
 * so switching dynamic color themes or light/dark mode updates purely through CSS
 * custom properties without re-rendering any Bento tiles.
 */
const BentoShowcaseGrid = memo(function BentoShowcaseGrid({ page }: { page: ShowcasePage }) {
  if (page === 1) {
    return (
      <main className="flex flex-col gap-3 sm:gap-4 flex-1">
        {/* Page 1 · Group A (01–06): Above-the-fold Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-12 lg:h-[calc(100dvh-92px)] lg:min-h-[600px] gap-3 sm:gap-4">
          <ExpressiveButtonCard className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-6" />
          <SplitButtonCard className="lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-7" />
          <ExpressiveSliderCard className="lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-5" />
          <ConnectedButtonGroupCard className="lg:col-start-1 lg:col-span-4 lg:row-start-7 lg:row-span-6" />
          <FloatingToolbarCard className="lg:col-start-5 lg:col-span-4 lg:row-start-8 lg:row-span-5" />
          <ExpressiveSkeletonCard className="lg:col-start-9 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
        </div>

        {/* Page 1 · Group B (07–12): Extended Expressive Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-12 lg:h-[700px] xl:h-[730px] gap-3 sm:gap-4">
          <ExpressiveTextCard className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-6" />
          <ExpressiveChipsCard className="lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-5" />
          <ExpressiveLoadingCard className="lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-7" />
          <ExpressiveSwitchCard className="lg:col-start-1 lg:col-span-4 lg:row-start-7 lg:row-span-6" />
          <ExpressiveFabMenuCard className="lg:col-start-5 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
          <ExpressiveCarouselCard className="lg:col-start-9 lg:col-span-4 lg:row-start-8 lg:row-span-5" />
        </div>

        {/* Page 1 · Group C (13–15): Search, Navigation & Media Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:h-[340px] xl:h-[360px] gap-3 sm:gap-4">
          <ExpressiveSearchBarCard className="lg:col-span-4" />
          <ExpressiveNavBarCard className="lg:col-span-4" />
          <ExpressiveMediaCard className="md:col-span-2 lg:col-span-4" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-3 sm:gap-4 flex-1">
      {/* Page 2 · Group A (16–21): Surfaces, Pickers & Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-12 lg:h-[calc(100dvh-92px)] lg:min-h-[600px] gap-3 sm:gap-4">
        <ExpressivePullRefreshCard className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-6" />
        <ExpressiveBottomSheetCard className="lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-7" />
        <ExpressiveNotificationCard className="lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-5" />
        <ExpressiveTimePickerCard className="lg:col-start-1 lg:col-span-4 lg:row-start-7 lg:row-span-6" />
        <ExpressiveSnackbarCard className="lg:col-start-5 lg:col-span-4 lg:row-start-8 lg:row-span-5" />
        <ExpressiveQuickTilesCard className="lg:col-start-9 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
      </div>

      {/* Page 2 · Group B (22–27): Steppers, Accordion, Rating, Volume, Checklist & Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-12 lg:h-[710px] xl:h-[740px] gap-3 sm:gap-4">
        <ExpressiveStepperCard className="lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-5" />
        <ExpressiveAccordionCard className="lg:col-start-5 lg:col-span-4 lg:row-start-1 lg:row-span-7" />
        <ExpressiveRatingCard className="lg:col-start-9 lg:col-span-4 lg:row-start-1 lg:row-span-5" />
        <ExpressiveVolumeCard className="lg:col-start-1 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
        <ExpressiveChecklistCard className="lg:col-start-5 lg:col-span-4 lg:row-start-8 lg:row-span-5" />
        <ExpressiveTabsCard className="lg:col-start-9 lg:col-span-4 lg:row-start-6 lg:row-span-7" />
      </div>

      {/* Page 2 · Group C (28–30): Presence, Badges & Rotary Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:h-[340px] xl:h-[360px] gap-3 sm:gap-4">
        <ExpressiveAvatarStackCard className="lg:col-span-4" />
        <ExpressiveBadgeCard className="lg:col-span-4" />
        <ExpressiveDialCard className="md:col-span-2 lg:col-span-4" />
      </div>
    </main>
  );
});

export default function App() {
  const [themeId, setThemeId] = useState<M3ThemeId>(readStoredTheme);
  const [colorMode, setColorMode] = useState<M3ColorMode>(readStoredMode);
  const [activePage, setActivePage] = useState<ShowcasePage>(1);

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

  const handlePageChange = useCallback((nextPage: ShowcasePage) => {
    setActivePage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="min-h-[100dvh] overflow-x-clip bg-[var(--md-surface)] text-[var(--md-on-surface)] transition-colors duration-300 m3-standard flex flex-col p-4 sm:p-5 gap-3 sm:gap-4"
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

      <BentoShowcaseGrid page={activePage} />

      {/* Bottom M3 Expressive Page Switcher (Page 1: 01–15, Page 2: 16–30) */}
      <nav
        aria-label="Showcase pagination"
        className="flex items-center justify-center pt-2 pb-1 shrink-0"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] p-1.5 border border-[var(--md-outline-variant)]/75 shadow-xs">
          {([1, 2] as const).map((pageNum) => {
            const isCurrent = activePage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => handlePageChange(pageNum)}
                className={`inline-flex items-center justify-center min-h-[44px] min-w-[104px] px-5 font-display text-[13.5px] font-semibold cursor-pointer select-none whitespace-nowrap transition-all duration-200 m3-spring active:scale-95 ${
                  isCurrent
                    ? 'rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-xs'
                    : 'rounded-[16px] bg-transparent text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                Page {pageNum}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
