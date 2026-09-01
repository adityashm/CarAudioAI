# DISPATCH ASSIGNMENT

## 2026-09-01T09:34:50Z

Read c:/Users/aditya/Downloads/CarAudioAI/ORIGINAL_REQUEST.md carefully.
Your working directory is c:/Users/aditya/Downloads/CarAudioAI/.agents/spec_miner_reqs/
You are a read-only specification investigator.

Mine and extract all exact product specifications, requirements, and acceptance criteria:
1. R1: Multi-Step Configurator (Indian vehicle database, cabin acoustic absorption profiles, road noise at 60/100 km/h, audio gear selection, listener seat position, target sound curve).
2. R2: Acoustic Calculation & Gain Staging Engine (exact formulas: speed of sound vs temperature and relative humidity, distance calculation, time alignment delay relative to furthest speaker, crossover math with Linkwitz-Riley 24dB/oct and Butterworth 12/18/24dB/oct, gain staging with cabin gain boost and headroom safety margins, target curve EQ offsets).
3. R3: Interactive Soundfield Simulation & Bezier Equalizer (top-down 2D cabin canvas/SVG visualization, acoustic wavefronts / soundfield heatmaps, delay compensation visualization, interactive multi-band Bezier parametric EQ with draggable control points, Q-factor adjustment, real-time frequency response curve rendering).
4. R4: Complete Backend APIs, Auth, Payments & DSP Exporter (REST API endpoints, JWT authentication, user preset storage, mock Indian payment flow with Razorpay/UPI/Cards for premium tuning profiles, DSP configuration exporter generating valid biquad coefficients and file formats for miniDSP XML, Dayton Audio DSP, Helix/Brax DSP PC-Tool, Zapco DPN, generic CSV/JSON).
5. Acceptance criteria, build & verification requirements (passing all pytest backend/tests, clean web export via `npx expo export --platform web`).

Write your detailed findings to c:/Users/aditya/Downloads/CarAudioAI/.agents/spec_miner_reqs/spec_report.md and a summary handoff to c:/Users/aditya/Downloads/CarAudioAI/.agents/spec_miner_reqs/handoff.md.
When finished, send a completion message back.
