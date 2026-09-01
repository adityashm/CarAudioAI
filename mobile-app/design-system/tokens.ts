/**
 * CarAudioAI — Precision Design System Tokens
 * Source of truth for hardware/laboratory instrument dark UI aesthetic.
 * 
 * Rules:
 * 1. Base Environment: Near-black studio background (#0A0B0D) with layered flat panels (#12151B, #181C24).
 * 2. Signal Color Discipline: Cyan (#22D3EE) and Purple (#A78BFA) are strictly reserved
 *    for live waveforms, EQ curves, FFT spectrum traces, and phase meters. Never for buttons or decorative cards.
 * 3. Chrome & Structure: Flat panels with hairline borders (#1E222A, #2A2F3A). Zero soft blurry drop-shadows.
 * 4. Typography Matrix: Sans for UI chrome/labels, Monospace for ALL numeric measurements (dB, Hz, ms, Ω, V AC, cm).
 */

export const tokens = {
  colors: {
    bg: {
      base: '#0A0B0D',
      panel: '#12151B',
      elevated: '#181C24',
      inset: '#0E1015',
      overlay: 'rgba(10, 11, 13, 0.88)',
    },
    border: {
      hairline: '#1E222A',
      subtle: '#2A2F3A',
      active: '#3E4657',
      divider: 'rgba(255, 255, 255, 0.06)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      muted: '#475569',
      inverse: '#0A0B0D',
    },
    // Strictly for live waveforms, EQ response curves, FFT spectrum traces, phase meters
    signal: {
      primary: '#22D3EE',
      primaryDim: '#06B6D4',
      primaryGlow: 'rgba(34, 211, 238, 0.20)',
      secondary: '#A78BFA',
      secondaryDim: '#8B5CF6',
      secondaryGlow: 'rgba(167, 139, 250, 0.20)',
      tertiary: '#38BDF8',
      tertiaryDim: '#0284C7',
    },
    // Instrumentation warnings & status indicators
    status: {
      ok: '#10B981',
      okBg: 'rgba(16, 185, 129, 0.10)',
      okBorder: 'rgba(16, 185, 129, 0.30)',
      warning: '#F59E0B',
      warningBg: 'rgba(245, 158, 11, 0.10)',
      warningBorder: 'rgba(245, 158, 11, 0.30)',
      danger: '#EF4444',
      dangerBg: 'rgba(239, 68, 68, 0.10)',
      dangerBorder: 'rgba(239, 68, 68, 0.30)',
      info: '#3B82F6',
      infoBg: 'rgba(59, 130, 246, 0.10)',
      infoBorder: 'rgba(59, 130, 246, 0.30)',
    },
    // UI Chrome & Controls (Solid hardware buttons, dials, faders)
    chrome: {
      buttonBg: '#1E222A',
      buttonHover: '#2A2F3A',
      buttonActive: '#3E4657',
      border: '#2A2F3A',
      faderCap: '#2A2F3A',
      faderCapHover: '#3E4657',
      faderTrack: '#0E1015',
      knobBody: '#181C24',
      knobRim: '#2A2F3A',
      knobIndicator: '#F1F5F9',
      disabledBg: '#12151B',
      disabledBorder: '#1E222A',
      disabledText: '#475569',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  radius: {
    sm: 2,
    md: 4,
    lg: 6,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
} as const;

// Aliases for convenience and compatibility
export const colors = tokens.colors;
export const typography = tokens.typography;
export const spacing = tokens.spacing;
export const radius = tokens.radius;
export const shadows = tokens.shadows;

// Backward-compatibility alias for codebases referencing `tokens.color`
export const color = tokens.colors;

export type DesignTokens = typeof tokens;
export type ColorTokens = typeof tokens.colors;
export type TypographyTokens = typeof tokens.typography;
export type SpacingTokens = typeof tokens.spacing;
export type RadiusTokens = typeof tokens.radius;
export type ShadowTokens = typeof tokens.shadows;

export default tokens;
