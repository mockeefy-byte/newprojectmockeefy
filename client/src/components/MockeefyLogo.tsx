import React from "react";

type Props = {
  className?: string;
  title?: string;
  /** "brand" = blue/white high-quality mark, "mono" = uses currentColor */
  variant?: "brand" | "mono";
};

/**
 * Inline SVG mark (no external image).
 * - variant="brand": blue/white high-quality mark (recommended for light backgrounds)
 * - variant="mono": uses `currentColor` (recommended for dark/colored backgrounds)
 */
export default function MockeefyLogo({ className, title = "Mockeefy", variant = "brand" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      <defs>
        <linearGradient id="mockeefy-blue" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2D7DFF" />
          <stop offset="0.55" stopColor="#004FCB" />
          <stop offset="1" stopColor="#00338A" />
        </linearGradient>
      </defs>

      {variant === "brand" ? (
        <>
          {/* Clean premium badge (no glossy white overlay) */}
          <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#mockeefy-blue)" />
          <rect x="9.5" y="9.5" width="45" height="45" rx="14.5" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="3" />

          {/* Bubble */}
          <path
            d="M18 24.5c0-3.6 2.9-6.5 6.5-6.5h15c3.6 0 6.5 2.9 6.5 6.5v8.5c0 3.6-2.9 6.5-6.5 6.5H31l-5.9 4.2c-1 .7-2.4 0-2.4-1.2V39.5c-2.8-.8-4.7-3.3-4.7-6.5v-8.5Z"
            fill="#FFFFFF"
            opacity="0.18"
          />

          {/* Monogram */}
          <path
            d="M24 38V26.8c0-1.6 1.9-2.3 3-1.2l5 5.2 5-5.2c1.1-1.1 3-.4 3 1.2V38"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Tiny highlight spark */}
          <path
            d="M45.5 18.5l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2 1.2-2.6Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </>
      ) : (
        <>
          {/* Mono badge */}
          <rect x="6" y="6" width="52" height="52" rx="16" fill="currentColor" opacity="0.10" />
          <rect x="9.5" y="9.5" width="45" height="45" rx="14.5" stroke="currentColor" strokeWidth="3" opacity="0.92" />
          <path
            d="M18 24.5c0-3.6 2.9-6.5 6.5-6.5h15c3.6 0 6.5 2.9 6.5 6.5v8.5c0 3.6-2.9 6.5-6.5 6.5H31l-5.9 4.2c-1 .7-2.4 0-2.4-1.2V39.5c-2.8-.8-4.7-3.3-4.7-6.5v-8.5Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M24 38V26.8c0-1.6 1.9-2.3 3-1.2l5 5.2 5-5.2c1.1-1.1 3-.4 3 1.2V38"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M45.5 18.5l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2 1.2-2.6Z"
            fill="currentColor"
            opacity="0.95"
          />
        </>
      )}
    </svg>
  );
}

