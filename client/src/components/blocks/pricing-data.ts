import type { PricingTier } from "./pricing-section";

export const PAYMENT_FREQUENCIES: ("monthly" | "yearly")[] = ["monthly", "yearly"];

export const TIERS: PricingTier[] = [
  {
    id: "premium-access",
    name: "Premium Access",
    price: {
      monthly: 99,
      yearly: 999,
    },
    description: "Get everything you need to excel in your interviews",
    features: [
      "3 Interview Certificates",
      "Ads Walk-in Opportunities",
      "Comprehensive Interview Guidance",
      "All Features - Completely Free Guidance",
      "Priority Expert Support",
    ],
    cta: "Get Started",
    popular: true,
  },
];
