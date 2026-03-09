import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PaymentFrequency = "monthly" | "yearly";

export interface PricingTier {
  id: string;
  name: string;
  price: {
    monthly: number | string;
    yearly: number | string;
  };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  highlighted?: boolean;
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  frequencies: PaymentFrequency[];
  tiers: PricingTier[];
}

export function PricingSection({
  title,
  subtitle,
  frequencies,
  tiers,
}: PricingSectionProps) {
  const [frequency, setFrequency] = useState<PaymentFrequency>(
    frequencies[0] ?? "monthly"
  );

  const formatPrice = (p: number | string) =>
    typeof p === "number" ? `₹${p}` : p;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          {subtitle}
        </p>
        {frequencies.length > 1 && (
          <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            {frequencies.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
                  frequency === f
                    ? "bg-[#004fcb] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const price = tier.price[frequency];
          const isCustom =
            price === "Custom" || (typeof price === "string" && price !== "Free");
          const isFree = price === "Free" || price === 0;

          return (
            <div
              key={tier.id}
              className={cn(
                "relative rounded-2xl border-2 bg-white p-6 flex flex-col transition-all",
                tier.popular || tier.highlighted
                  ? "border-[#004fcb] shadow-lg shadow-blue-900/10"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              {(tier.popular || tier.highlighted) && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#004fcb] text-white">
                  {tier.popular ? "Popular" : "Best value"}
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{tier.description}</p>
              </div>
              <div className="mb-6">
                {isCustom ? (
                  <span className="text-2xl font-bold text-slate-900">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {formatPrice(price)}
                    </span>
                    {!isFree && (
                      <span className="text-slate-500 text-sm font-medium">
                        /{frequency === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </>
                )}
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {tier.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <Check className="w-4 h-4 text-[#004fcb] shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={cn(
                  "w-full font-semibold",
                  tier.popular || tier.highlighted
                    ? "bg-[#004fcb] hover:bg-blue-600 text-white"
                    : "bg-[#004fcb] hover:bg-blue-600 text-white"
                )}
              >
                <Link to={tier.cta === "Contact Us" ? "/plans" : "/signup"}>
                  {tier.cta}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
