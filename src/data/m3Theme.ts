export type M3ThemeId = 'indigo' | 'sage' | 'terracotta';
export type M3ColorMode = 'light' | 'dark';

export interface M3ColorTokens {
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
}

export interface M3ThemeDefinition {
  id: M3ThemeId;
  name: string;
  shortName: string;
  swatch: string;
  swatchSecondary: string;
  light: M3ColorTokens;
  dark: M3ColorTokens;
}

export const M3_THEMES: Record<M3ThemeId, M3ThemeDefinition> = {
  indigo: {
    id: 'indigo',
    name: 'Tonal Indigo',
    shortName: 'Indigo',
    swatch: '#4355B9',
    swatchSecondary: '#DEE0FF',
    light: {
      surface: '#FBF8FF',
      surfaceContainerLowest: '#FFFFFF',
      surfaceContainerLow: '#F4F1FA',
      surfaceContainer: '#EEEBF5',
      surfaceContainerHigh: '#E8E5F0',
      surfaceContainerHighest: '#E2DFEA',
      onSurface: '#1A1B23',
      onSurfaceVariant: '#464655',
      primary: '#4355B9',
      onPrimary: '#FFFFFF',
      primaryContainer: '#DEE0FF',
      onPrimaryContainer: '#00105C',
      secondary: '#5A5D72',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#DFE1F9',
      onSecondaryContainer: '#171B2C',
      tertiary: '#76546E',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#FFD7F3',
      onTertiaryContainer: '#2C1228',
      outline: '#767686',
      outlineVariant: '#C7C5D6',
      inverseSurface: '#2F3038',
      inverseOnSurface: '#F2EFFA',
    },
    dark: {
      surface: '#12131A',
      surfaceContainerLowest: '#0D0E14',
      surfaceContainerLow: '#1A1B23',
      surfaceContainer: '#1E1F27',
      surfaceContainerHigh: '#292A32',
      surfaceContainerHighest: '#34353E',
      onSurface: '#E5E2EE',
      onSurfaceVariant: '#C6C5D6',
      primary: '#BAC3FF',
      onPrimary: '#092289',
      primaryContainer: '#293CA0',
      onPrimaryContainer: '#DEE0FF',
      secondary: '#C3C5DD',
      onSecondary: '#2C2F42',
      secondaryContainer: '#434659',
      onSecondaryContainer: '#DFE1F9',
      tertiary: '#E5BAD8',
      onTertiary: '#44263E',
      tertiaryContainer: '#5C3D55',
      onTertiaryContainer: '#FFD7F3',
      outline: '#908F9F',
      outlineVariant: '#464655',
      inverseSurface: '#E5E2EE',
      inverseOnSurface: '#2F3038',
    },
  },
  sage: {
    id: 'sage',
    name: 'Botanical Sage',
    shortName: 'Sage',
    swatch: '#386A20',
    swatchSecondary: '#C8F0B0',
    light: {
      surface: '#F7FBF1',
      surfaceContainerLowest: '#FFFFFF',
      surfaceContainerLow: '#F0F5E9',
      surfaceContainer: '#EAEFE3',
      surfaceContainerHigh: '#E4E9DD',
      surfaceContainerHighest: '#DFE4D7',
      onSurface: '#181D15',
      onSurfaceVariant: '#43493E',
      primary: '#386A20',
      onPrimary: '#FFFFFF',
      primaryContainer: '#C8F0B0',
      onPrimaryContainer: '#092100',
      secondary: '#54634C',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#D7E8CB',
      onSecondaryContainer: '#121F0D',
      tertiary: '#1E6768',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#BCECEB',
      onTertiaryContainer: '#002020',
      outline: '#73796D',
      outlineVariant: '#C3C8BB',
      inverseSurface: '#2D3229',
      inverseOnSurface: '#EEF3E7',
    },
    dark: {
      surface: '#11150E',
      surfaceContainerLowest: '#0C0F09',
      surfaceContainerLow: '#191D16',
      surfaceContainer: '#1D211A',
      surfaceContainerHigh: '#272C24',
      surfaceContainerHighest: '#32372E',
      onSurface: '#E1E5DA',
      onSurfaceVariant: '#C3C8BB',
      primary: '#9FD683',
      onPrimary: '#133800',
      primaryContainer: '#22510C',
      onPrimaryContainer: '#C8F0B0',
      secondary: '#BBCBB0',
      onSecondary: '#273420',
      secondaryContainer: '#3D4B36',
      onSecondaryContainer: '#D7E8CB',
      tertiary: '#A0D0CF',
      onTertiary: '#003737',
      tertiaryContainer: '#004F50',
      onTertiaryContainer: '#BCECEB',
      outline: '#8D9386',
      outlineVariant: '#43493E',
      inverseSurface: '#E1E5DA',
      inverseOnSurface: '#2D3229',
    },
  },
  terracotta: {
    id: 'terracotta',
    name: 'Terracotta',
    shortName: 'Terracotta',
    swatch: '#9C412A',
    swatchSecondary: '#FFDBD1',
    light: {
      surface: '#FFF8F6',
      surfaceContainerLowest: '#FFFFFF',
      surfaceContainerLow: '#FBF0EC',
      surfaceContainer: '#F5EAE6',
      surfaceContainerHigh: '#EFE4E0',
      surfaceContainerHighest: '#E9DEDA',
      onSurface: '#231917',
      onSurfaceVariant: '#53433F',
      primary: '#9C412A',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFDBD1',
      onPrimaryContainer: '#3B0900',
      secondary: '#77574E',
      onSecondary: '#FFFFFF',
      secondaryContainer: '#FFDBD1',
      onSecondaryContainer: '#2C150F',
      tertiary: '#6C5D2F',
      onTertiary: '#FFFFFF',
      tertiaryContainer: '#F6E1A7',
      onTertiaryContainer: '#231B00',
      outline: '#85736E',
      outlineVariant: '#D8C2BC',
      inverseSurface: '#392E2B',
      inverseOnSurface: '#FFF0EC',
    },
    dark: {
      surface: '#1A110F',
      surfaceContainerLowest: '#140C0A',
      surfaceContainerLow: '#231917',
      surfaceContainer: '#271D1B',
      surfaceContainerHigh: '#322825',
      surfaceContainerHighest: '#3E322F',
      onSurface: '#F1DFDA',
      onSurfaceVariant: '#D8C2BC',
      primary: '#FFB5A0',
      onPrimary: '#5E1605',
      primaryContainer: '#7D2B16',
      onPrimaryContainer: '#FFDBD1',
      secondary: '#E7BDB2',
      onSecondary: '#442A22',
      secondaryContainer: '#5D4038',
      onSecondaryContainer: '#FFDBD1',
      tertiary: '#D9C58D',
      onTertiary: '#3B2F05',
      tertiaryContainer: '#53461A',
      onTertiaryContainer: '#F6E1A7',
      outline: '#A08C87',
      outlineVariant: '#53433F',
      inverseSurface: '#F1DFDA',
      inverseOnSurface: '#392E2B',
    },
  },
};

export const M3_THEME_ORDER: M3ThemeId[] = ['indigo', 'sage', 'terracotta'];

export function themeTokensToCssVars(tokens: M3ColorTokens): Record<string, string> {
  return {
    '--md-surface': tokens.surface,
    '--md-surface-container-lowest': tokens.surfaceContainerLowest,
    '--md-surface-container-low': tokens.surfaceContainerLow,
    '--md-surface-container': tokens.surfaceContainer,
    '--md-surface-container-high': tokens.surfaceContainerHigh,
    '--md-surface-container-highest': tokens.surfaceContainerHighest,
    '--md-on-surface': tokens.onSurface,
    '--md-on-surface-variant': tokens.onSurfaceVariant,
    '--md-primary': tokens.primary,
    '--md-on-primary': tokens.onPrimary,
    '--md-primary-container': tokens.primaryContainer,
    '--md-on-primary-container': tokens.onPrimaryContainer,
    '--md-secondary': tokens.secondary,
    '--md-on-secondary': tokens.onSecondary,
    '--md-secondary-container': tokens.secondaryContainer,
    '--md-on-secondary-container': tokens.onSecondaryContainer,
    '--md-tertiary': tokens.tertiary,
    '--md-on-tertiary': tokens.onTertiary,
    '--md-tertiary-container': tokens.tertiaryContainer,
    '--md-on-tertiary-container': tokens.onTertiaryContainer,
    '--md-outline': tokens.outline,
    '--md-outline-variant': tokens.outlineVariant,
    '--md-inverse-surface': tokens.inverseSurface,
    '--md-inverse-on-surface': tokens.inverseOnSurface,
  };
}

/**
 * Material 3 Expressive Spring Motion Tokens (Compose Material 3 1.5.0)
 * - Spatial springs: bouncy overshoot for shape, position, and scale
 * - Effects springs: critically damped for color and opacity
 */
export const M3_SPRINGS = {
  fastSpatial: { type: 'spring' as const, stiffness: 520, damping: 22, mass: 0.9 },
  defaultSpatial: { type: 'spring' as const, stiffness: 380, damping: 20, mass: 1 },
  slowSpatial: { type: 'spring' as const, stiffness: 220, damping: 18, mass: 1.05 },
  fastEffects: { type: 'spring' as const, stiffness: 600, damping: 38, mass: 0.8 },
  instant: { duration: 0.01 },
};
