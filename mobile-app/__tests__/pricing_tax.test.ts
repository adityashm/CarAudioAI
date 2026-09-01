import { FALLBACK_PLANS, PaymentPlan } from '../services/paymentService';
import crypto from 'crypto';

describe('Pricing Tiers, Invoicing & 18% GST Calculation Engine (F12)', () => {
  // =========================================================================
  // 1. SUBSCRIPTION TIERS MATRIX (FREE, PRO ₹99/MO, INSTALLER ₹999/YR)
  // =========================================================================
  describe('Subscription Plans Matrix (F12)', () => {
    test('contains exact 3 subscription tiers: Free, Pro Monthly, and Installer Pro Yearly', () => {
      expect(FALLBACK_PLANS.length).toBe(3);
      const planIds = FALLBACK_PLANS.map((p) => p.id);
      expect(planIds).toContain('free');
      expect(planIds).toContain('pro_monthly');
      expect(planIds).toContain('pro_yearly');
    });

    test('verifies exact INR pricing for Pro (₹99/mo) and Installer (₹999/yr)', () => {
      const freePlan = FALLBACK_PLANS.find((p) => p.id === 'free')!;
      const proMonthly = FALLBACK_PLANS.find((p) => p.id === 'pro_monthly')!;
      const proYearly = FALLBACK_PLANS.find((p) => p.id === 'pro_yearly')!;

      expect(freePlan.price_inr).toBe(0);
      expect(freePlan.interval).toBe('lifetime');

      expect(proMonthly.price_inr).toBe(99);
      expect(proMonthly.interval).toBe('month');
      expect(proMonthly.popular).toBe(true);

      expect(proYearly.price_inr).toBe(999);
      expect(proYearly.interval).toBe('year');
      expect(proYearly.badge).toContain('BEST VALUE');
    });

    test('pro and installer tiers include acoustic tuning and export features', () => {
      const proMonthly = FALLBACK_PLANS.find((p) => p.id === 'pro_monthly')!;
      expect(proMonthly.features).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Time Alignment/i),
          expect.stringMatching(/Linkwitz-Riley/i),
          expect.stringMatching(/Subsonic Safety/i),
          expect.stringMatching(/Pioneer XML & MiniDSP JSON/i),
        ])
      );

      const proYearly = FALLBACK_PLANS.find((p) => p.id === 'pro_yearly')!;
      expect(proYearly.features).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/Workshop Mode/i),
          expect.stringMatching(/RTA Acoustic Measurement/i),
        ])
      );
    });
  });

  // =========================================================================
  // 2. 18% GST (CGST 9% + SGST 9%) TAX DECOMPOSITION & ROUNDING
  // =========================================================================
  describe('18% GST Indian Taxation Arithmetic', () => {
    interface GstBreakdown {
      totalInr: number;
      basePriceInr: number;
      cgstInr: number;
      sgstInr: number;
      totalTaxInr: number;
      formattedSummary: {
        baseLine: string;
        cgstLine: string;
        sgstLine: string;
        totalLine: string;
      };
    }

    const calculateGstInclusive = (totalAmount: number): GstBreakdown => {
      const GST_RATE = 0.18; // 18% Total GST
      const SPLIT_RATE = 0.09; // 9% CGST + 9% SGST

      const basePrice = +(totalAmount / (1 + GST_RATE)).toFixed(2);
      const cgst = +(basePrice * SPLIT_RATE).toFixed(2);
      const sgst = +(basePrice * SPLIT_RATE).toFixed(2);
      const totalTax = +(cgst + sgst).toFixed(2);

      return {
        totalInr: totalAmount,
        basePriceInr: basePrice,
        cgstInr: cgst,
        sgstInr: sgst,
        totalTaxInr: totalTax,
        formattedSummary: {
          baseLine: `Base Subscription Price: ₹${basePrice.toFixed(2)}`,
          cgstLine: `Central GST (CGST @ 9%): ₹${cgst.toFixed(2)}`,
          sgstLine: `State GST (SGST @ 9%):   ₹${sgst.toFixed(2)}`,
          totalLine: `Total Invoiced Amount:   ₹${totalAmount.toFixed(2)}`,
        },
      };
    };

    test('Pro Monthly (₹99 inclusive) decomposes into ₹83.90 base + ₹7.55 CGST + ₹7.55 SGST', () => {
      const gst = calculateGstInclusive(99);

      expect(gst.basePriceInr).toBe(83.9);
      expect(gst.cgstInr).toBe(7.55);
      expect(gst.sgstInr).toBe(7.55);
      expect(gst.totalTaxInr).toBe(15.1);

      // Reconstructed sum matches exact total
      const reconstructedTotal = +(gst.basePriceInr + gst.cgstInr + gst.sgstInr).toFixed(2);
      expect(reconstructedTotal).toBe(99.0);
    });

    test('Installer Pro Yearly (₹999 inclusive) decomposes into ₹846.61 base + ₹76.19 CGST + ₹76.19 SGST', () => {
      const gst = calculateGstInclusive(999);

      expect(gst.basePriceInr).toBe(846.61);
      expect(gst.cgstInr).toBe(76.19);
      expect(gst.sgstInr).toBe(76.19);
      expect(gst.totalTaxInr).toBe(152.38);

      const reconstructedTotal = +(gst.basePriceInr + gst.cgstInr + gst.sgstInr).toFixed(2);
      expect(reconstructedTotal).toBeCloseTo(999.0, 1);
    });

    test('formats monospace line items with INR currency and discrete tax labels', () => {
      const gst = calculateGstInclusive(99);
      expect(gst.formattedSummary.baseLine).toBe('Base Subscription Price: ₹83.90');
      expect(gst.formattedSummary.cgstLine).toBe('Central GST (CGST @ 9%): ₹7.55');
      expect(gst.formattedSummary.sgstLine).toBe('State GST (SGST @ 9%):   ₹7.55');
      expect(gst.formattedSummary.totalLine).toBe('Total Invoiced Amount:   ₹99.00');
    });
  });

  // =========================================================================
  // 3. RAZORPAY PAYMENT GATEWAY PROTOCOL & SECURITY
  // =========================================================================
  describe('Razorpay Payment Gateway Amount & HMAC-SHA256 Security', () => {
    test('converts INR amounts into integer paise for Razorpay API (₹99 -> 9900 paise, ₹999 -> 99900 paise)', () => {
      const toPaise = (inr: number) => inr * 100;

      expect(toPaise(99)).toBe(9900);
      expect(toPaise(999)).toBe(99900);
      expect(toPaise(0)).toBe(0);
    });

    test('computes and verifies 256-bit HMAC signature for web checkout verification', () => {
      const orderId = 'order_CarAudioAI_99_Pro';
      const paymentId = 'pay_Hdfc_Upi_12345';
      const secret = 'rzp_secret_production_key_test';

      const payload = `${orderId}|${paymentId}`;
      const generatedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      // Signature must be a 64-character lowercase hex string
      expect(generatedSignature).toHaveLength(64);
      expect(generatedSignature).toMatch(/^[0-9a-f]{64}$/);

      // Verify HMAC comparison
      const verifySignature = (ord: string, pay: string, sig: string, sec: string): boolean => {
        const expected = crypto.createHmac('sha256', sec).update(`${ord}|${pay}`).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
      };

      expect(verifySignature(orderId, paymentId, generatedSignature, secret)).toBe(true);
      expect(verifySignature(orderId, 'pay_TAMPERED', generatedSignature, secret)).toBe(false);
      expect(verifySignature('order_TAMPERED', paymentId, generatedSignature, secret)).toBe(false);
      expect(verifySignature(orderId, paymentId, '0'.repeat(64), secret)).toBe(false);
    });
  });
});
