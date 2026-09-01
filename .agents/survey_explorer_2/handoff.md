# Handoff Report — UI/UX Component & Design System Survey

**From**: Survey Explorer 2  
**To**: Orchestrator / Lead Architect  
**Date**: 2026-09-01  
**Status**: Hard Handoff (Investigation Complete)

---

## 1. Observation

Direct code observations from inspected files in the workspace:

1. **`HeroScrollSequence.jsx` (Root & `mobile-app/components/HeroScrollSequence.jsx`)**:
   - Backgrounds: Hardcoded `#020617` (L277, L296, L611).
   - Colored Borders: `border: '1px solid rgba(6, 182, 212, 0.3)'` (L295, L445, L501), `border: '1px solid rgba(168, 85, 247, 0.4)'` (L473), `border: '1px solid rgba(16, 185, 129, 0.6)'` (L531).
   - Cyan Button: CTA button uses `backgroundColor: '#06b6d4'` and `boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'` (L555-564).
   - Emerald Background: Stage 3 HUD card uses `backgroundColor: 'rgba(6, 78, 59, 0.90)'` (L529).
   - WebGL Shaders: Shaders in L220-222 use hardcoded color vectors `vec3(0.024, 0.714, 0.831)` and `vec3(0.545, 0.361, 0.965)`.
   - Native Fallback: `NativeFallbackSlideshow` (L581-645) uses hardcoded `#020617` background and lacks rich telemetry readouts.

2. **`mobile-app/app/(tabs)/index.tsx`**:
   - Contains 2,317 lines mixing landing, wizard, 6 tuning studio sub-tabs, and modals in a single monolithic file.
   - Widespread hardcoded hex colors and cyan fills on action buttons: `primaryGlowBtn` (L928, `#06b6d4`), `selectModelBtnActive` (L1781, `#06b6d4`), `makeCardActive` (L1652, `#06b6d4`), `modelCardActive` (L1712, `#06b6d4`).
   - Blurry glow elements: `glowBlob1` (L866), `glowBlob2` (L876) with `filter: 'blur(50px)'`.
   - Sliders (L1024-1060): Hardcoded custom vertical bar views instead of standardized fader primitives.

3. **`mobile-app/app/(tabs)/explore.tsx` & Modals**:
   - `explore.tsx`: Blue button `backgroundColor: '#2563eb'` (L259).
   - `AuthModal.tsx`: Cyan submit button `#06b6d4` (L390).
   - `PaymentModal.tsx`: Cyan and Gold action buttons `#06b6d4` (L429) and `#f59e0b` (L435).
   - `RtaMeasurementModal.tsx`: Cyan trigger button `#06b6d4` (L388).

4. **`mobile-app/constants/theme.ts` & `mobile-app/design-system/`**:
   - `mobile-app/constants/theme.ts` contains only standard template colors (`#0a7ea4`, `#fff`, `#151718`).
   - `mobile-app/design-system/` directory does not yet exist.

---

## 2. Logic Chain

1. **Premise 1 (Design Mandate)**: The platform must project the precision and functional discipline of professional audio test instruments and automotive mixing consoles.
2. **Premise 2 (Rule Violations Identified)**:
   - Observation 1 & 2 show that buttons across the app are styled in cyan (`#06b6d4`) with blurry SaaS drop shadows (`boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'`), violating the mandate that signal colors (`#22D3EE` / `#A78BFA`) are strictly reserved for live waveforms/EQ splines.
   - Observation 1 & 2 show container borders and cards tinted in colored glows (`rgba(6, 182, 212, 0.3)`), violating the requirement for neutral hairline borders (`#1E222A`, `#2A2F3A`).
   - Observation 1 & 2 show numeric measurements (dB, Hz, ms, V AC, cm) rendered in unstructured strings rather than distinct tabular monospace readouts with decoupled unit labeling.
3. **Inference**: A centralized design token repository (`mobile-app/design-system/tokens.ts`) and a suite of reusable UI primitives (`InstrumentPanel`, `Button`, `Readout`, `SliderControl`, `DialControl`) must be created first (Track 0) to provide authoritative styling for all other tracks.
4. **Resolution**: `HeroScrollSequence.jsx` and the subsequent screens can then cleanly import all styles from Track 0, eliminating every hardcoded hex value, blurry glow shadow, and signal-color-button violation.

---

## 3. Caveats

- **WebGL Shader Platform Compatibility**: WebGL shaders run on React Native Web. Native fallback uses React Native `View`/`Image`/`Text` elements. Both must share the same design tokens and HUD telemetry layout.
- **AudioContext Autoplay Policies**: Web Audio API requires user gesture interaction before playing sound effects or test tones.
- No backend code changes were surveyed in this track as backend API and acoustic engines are handled by Survey Explorer 1 / Backend Tracks.

---

## 4. Conclusion

1. **Design System (Track 0)** must establish:
   - Surface palette: `#0A0B0D` (base), `#12151B` (panel), `#181C24` (elevated), `#0E1015` (inset).
   - Hairline borders: `#1E222A` (hairline), `#2A2F3A` (subtle).
   - Signal colors: `#22D3EE` (cyan trace), `#A78BFA` (purple phase).
   - Warnings: `#F59E0B` (amber warning), `#EF4444` (red clip danger).
   - Typography: Geometric Sans for UI chrome, Tabular Monospace for all measurements.
   - Primitives: `InstrumentPanel`, `Button` (solid chrome vs outline), `Readout`, `SliderControl`, `DialControl`.
2. **`HeroScrollSequence.jsx` (Track 1)** refactoring is ready for implementation:
   - De-cyanify container border, stage borders, and CTA button.
   - Structure HUD overlays using `InstrumentPanel` and `Readout`.
   - Update WebGL shader constants to match `#22D3EE` and `#A78BFA`.
   - Upgrade Native fallback slideshow with matching HUD telemetry.
3. **Comprehensive Survey Report** is published at `.agents/survey_explorer_2/analysis.md`.

---

## 5. Verification Method

1. **File Inspection**:
   - Inspect `.agents/survey_explorer_2/analysis.md` for full component specifications.
   - Inspect `.agents/survey_explorer_2/BRIEFING.md` and `progress.md` for survey state.
2. **Build and Export Command**:
   - Test frontend compilation and web bundling:
     ```bash
     cd c:/Users/aditya/Downloads/CarAudioAI/mobile-app
     npx expo export --platform web
     ```
3. **Token Compliance Verification**:
   - Run grep search to verify zero forbidden hardcoded hex strings (`#06b6d4`, `#2563eb`) outside `tokens.ts`.
