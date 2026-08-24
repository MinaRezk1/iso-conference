import React from "react";

export default function FingerprintLogo({ className = "w-12 h-12 text-primary" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Fingerprint Loops */}
      <path d="M2 12C2 6.5 6.5 2 12 2s10 4.5 10 10" />
      <path d="M5 12.5C5 8.5 8 5.5 12 5.5s7 3 7 7" />
      <path d="M8 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <path d="M11 13.5a1 1 0 1 0 2 0" />
      <path d="M12 22V17" />
      <path d="M9 21.5a15.2 15.2 0 0 1-5.5-5.5" />
      <path d="M15 21.5c1.8-1.5 3.5-3.5 4.5-5.5" />
      <path d="M12 9.5v.01" />
      <path d="M16 17c.5-1.2.8-2.5.8-4 0-2.8-2.2-5-4.8-5s-4.8 2.2-4.8 5c0 1.5.3 2.8.8 4" />
      <path d="M19.5 9.5c.3.8.5 1.6.5 2.5 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-.9.2-1.7.5-2.5" />
    </svg>
  );
}
