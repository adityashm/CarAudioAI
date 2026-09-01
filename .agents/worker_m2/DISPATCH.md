## 2026-09-01T10:39:29Z

You are Worker for Milestone 2 (Track 1: Hero Scrollytelling Polish).
Your working directory is: c:/Users/aditya/Downloads/CarAudioAI/.agents/worker_m2
Workspace root: c:/Users/aditya/Downloads/CarAudioAI
Authoritative Request: c:/Users/aditya/Downloads/CarAudioAI/.agents/ORIGINAL_REQUEST.md
Project Spec: c:/Users/aditya/Downloads/CarAudioAI/PROJECT.md
Design Tokens: c:/Users/aditya/Downloads/CarAudioAI/mobile-app/design-system/tokens.ts
Survey Report: c:/Users/aditya/Downloads/CarAudioAI/.agents/survey_explorer_2/analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership: You own `HeroScrollSequence.jsx` (at root and `mobile-app/components/HeroScrollSequence.jsx`). Do NOT touch files owned by other tracks.

Task:
Refactor and polish `HeroScrollSequence.jsx` against Track 0's design tokens:
1. Import and utilize tokens and UI primitives (`tokens`, `InstrumentPanel`, `Button`, `Readout`) exclusively:
   - Base background: `#0A0B0D` (tokens.colors.bg.base).
   - Container & card borders: flat hairline `#1E222A` / `#2A2F3A`. Remove all cyan/purple/emerald glowing card borders and SaaS drop shadows.
   - Signal colors: Cyan `#22D3EE` and Purple `#A78BFA` strictly confined to live wave curves and phase coherence meters.
   - Primary CTA button: Refactor from glowing cyan button to solid chrome button (`#1E222A` bg, `#2A2F3A` border, primary text, subtle hover/pressed feedback).
2. Telemetry & HUD overlays:
   - Structure Stage 0-3 telemetry overlays into clean `InstrumentPanel` HUD cards.
   - Render all numeric measurements (dB, Hz, ms, phase coherence %, delay) strictly in monospace font (`JetBrains Mono` / tokens.typography.fontFamily.mono).
3. WebGL Shaders & Canvas:
   - Update WebGL shader uniforms and fragment color vectors to match `#22D3EE` (cyan) and `#A78BFA` (purple).
4. Native Fallback Parity:
   - Ensure the native fallback component shares the same studio `#0A0B0D` base, hairline borders, and monospace telemetry.
5. Verify syntax, TypeScript compatibility, and static export (`npx expo export --platform web`).
6. Write handoff to `c:/Users/aditya/Downloads/CarAudioAI/.agents/worker_m2/handoff.md` and send a message.
