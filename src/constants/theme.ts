export const THEME = {
  colors: {
    // Primary Architectural Palette
    obsidian: '#080909',
    background: '#0B0D12',
    backgroundSecondary: '#12151D',
    surface: '#12151D',
    elevatedSurface: '#181C26',
    softLavender: '#F0EEFA',
    lightLavender: '#DFE4F2',

    // Card & Borders
    cardBackground: '#12151D',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardBorderHighlight: 'rgba(124, 77, 255, 0.4)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',

    // Accents (Restrained & Purposeful)
    primary: '#7C4DFF',         // Accent Violet
    primaryLight: '#B388FF',
    primaryGlow: 'rgba(124, 77, 255, 0.2)',
    accentViolet: '#7C4DFF',

    secondary: '#00E5FF',       // Accent Cyan
    secondaryGlow: 'rgba(0, 229, 255, 0.2)',
    accentCyan: '#00E5FF',

    accentGreen: '#00E676',     // Accent Green (Resolved / High Upside)
    accentRose: '#F43F5E',      // Muted Red / Skip
    accentPink: '#FF2A85',
    accentAmber: '#FFB300',

    // Typography Colors
    textPrimary: '#F7F7FA',
    primaryText: '#F7F7FA',
    textSecondary: '#858997',
    textTertiary: '#646877',
    textMuted: '#505462',
    textDark: '#080909',

    // Status Colors
    success: '#00E676',
    warning: '#FFB300',
    error: '#F43F5E',
    info: '#00E5FF',

    // Scenario Colors (Branching Futures)
    scenarioA: '#00E5FF', // Cyan for A — Commit
    scenarioB: '#7C4DFF', // Violet for B — Wait
    scenarioC: '#F43F5E', // Rose for C — Skip
  },
  typography: {
    fontFamilies: {
      sans: 'System',
      display: 'System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 34,
      hero: 42,
    },
    lineHeights: {
      tight: 1.15,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    section: 48,
    hero: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    full: 9999,
  },
};
