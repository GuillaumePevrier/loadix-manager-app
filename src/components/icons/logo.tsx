import type { SVGProps } from 'react';

// New LOADIX logo based on the provided image
export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5" // Made it slightly thicker to match the new logo's style
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 19V5L12 12L19 5V19" />
    </svg>
  );
}
