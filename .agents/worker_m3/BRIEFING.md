# BRIEFING — 2026-09-01T10:45:00Z

## Mission
Build the complete precision DSP Instrumentation Dashboard components in `mobile-app/`: 14-band EQ visualizer, Web Audio engine & spectrum analyzer, Linkwitz-Riley crossover & subsonic protection, asymmetric RHD time alignment view, and multimeter gain staging calculator.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:/Users/aditya/Downloads/CarAudioAI/.agents/worker_m3
- Original parent: 0d60e438-eb2c-402a-bd98-542d002a37e5
- Milestone: M3 (Track 2: Precision DSP Instrumentation Dashboard)

## 🔒 Key Constraints
- File ownership: `mobile-app/components/dsp/*`, `mobile-app/services/webAudioEngine.ts`, `mobile-app/constants/dspConstants.ts`. Do NOT touch files owned by other tracks.
- Aesthetic & Design System: strictly import tokens from `mobile-app/design-system/tokens.ts`. Signal colors (Cyan `#22D3EE`, Purple `#A78BFA`) strictly for waveforms/EQ traces/phase. Monospace for all numeric measurements. Flat hairline borders. Amber-red strictly for warnings.
- Mandatory integrity: Genuine mathematical and Web Audio implementation. No dummy/facade implementations or hardcoded shortcuts.

## Current Parent
- Conversation ID: 0d60e438-eb2c-402a-bd98-542d002a37e5
- Updated: 2026-09-01T10:45:00Z

## Task Summary
- **What to build**:
  1. `mobile-app/constants/dspConstants.ts`
  2. `mobile-app/services/webAudioEngine.ts`
  3. `mobile-app/components/dsp/EqCurveVisualizer.tsx`
  4. `mobile-app/components/dsp/SpectrumAnalyzer.tsx`
  5. `mobile-app/components/dsp/CrossoverSubsonic.tsx`
  6. `mobile-app/components/dsp/TimeAlignmentView.tsx`
  7. `mobile-app/components/dsp/MultimeterGainStaging.tsx`
  8. `mobile-app/components/dsp/index.ts`
- **Success criteria**:
  - Full TypeScript types, zero type errors.
  - Interactive EQ with draggable nodes & Bezier spline rendering.
  - Web Audio API engine with tone generator, 14-band biquad cascade, and AnalyserNode spectrum.
  - Linkwitz-Riley 24dB dials and subsonic cone-unloading safety warning (<28Hz for 35Hz box).
  - Asymmetric RHD time-alignment with ms and cm readouts.
  - DMM target AC voltage calculator $V = \sqrt{P \times R}$ with 75% volume limit.
  - Co-located unit tests passing.
  - Clean web export check (`npx expo export --platform web`).

## Change Tracker
- **Files modified**: None yet (initial turn)
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- **Source**: `C:\Users\aditya\.gemini\config\skills\ui-ux-pro-max\SKILL.md`, `frontend-design`, `ui-styling`
- **Core methodology**: Professional mixing console / laboratory dark aesthetic; design token strictness; high precision interactive controls.
