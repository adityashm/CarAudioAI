## 2026-09-01T10:39:30Z
You are Worker for Milestone 5 (Track 4: High-Trust Payment & Checkout Screen).
Your working directory is: c:/Users/aditya/Downloads/CarAudioAI/.agents/worker_m5
Workspace root: c:/Users/aditya/Downloads/CarAudioAI
Authoritative Request: c:/Users/aditya/Downloads/CarAudioAI/.agents/ORIGINAL_REQUEST.md
Project Spec: c:/Users/aditya/Downloads/CarAudioAI/PROJECT.md
Design Tokens: c:/Users/aditya/Downloads/CarAudioAI/mobile-app/design-system/tokens.ts
Payment Service: c:/Users/aditya/Downloads/CarAudioAI/mobile-app/services/paymentService.ts

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership: You own `mobile-app/components/checkout/*` and `mobile-app/components/PaymentModal.tsx`. Do NOT touch files owned by other tracks.

Task:
Build the high-trust Payment & Checkout screen in `mobile-app/`:
1. `mobile-app/components/checkout/HighTrustCheckout.tsx`:
   - Razorpay subscription tier selection:
     - Free Enthusiast Tier (Basic EQ, standard cabin delays)
     - Pro Audio Tuner Tier: ₹99/mo (All 14 EQ bands, live RTA FFT, Pioneer XML & MiniDSP JSON export)
     - Installer Commercial Tier: ₹999/yr (Unlimited vehicle calibrations, multi-car garage, PDF installer tuning sheets, priority DMM gain calculator)
   - Monospace Line-Item Invoice Summary:
     - Base Plan Amount (e.g. ₹83.90 for Pro, ₹846.61 for Installer)
     - 18% Indian GST Breakdown (CGST 9% ₹7.55 + SGST 9% ₹7.55 for Pro; CGST 9% ₹76.19 + SGST 9% ₹76.19 for Installer)
     - Final Total Payable formatted strictly in tabular monospace numerals (₹99.00 / ₹999.00)
   - Trust & Security Indicators:
     - 256-bit SSL Encrypted, PCI-DSS Level 1 compliant, UPI / RuPay / NetBanking / Cards badge row, Instant Activation guarantee.
     - Clean solid chrome CTA button "PROCEED TO PAY ₹99.00" without distracting SaaS gradients or cyan fills.
2. Refactor `mobile-app/components/PaymentModal.tsx` to wrap `HighTrustCheckout.tsx` with Razorpay checkout triggering and success state handler.
3. `mobile-app/components/checkout/index.ts`: Barrel export.
4. Verify syntax, TypeScript, and web export (`npx expo export --platform web`).
5. Write handoff to `c:/Users/aditya/Downloads/CarAudioAI/.agents/worker_m5/handoff.md` and send a message.
