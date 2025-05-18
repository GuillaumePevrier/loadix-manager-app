import type { SVGProps } from 'react';

// A more abstract and modern logo for LOADIX
export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Stylized 'L' shape combined with a sense of movement/autonomy */}
      <path d="M4 18V6h8" /> 
      <path d="M4 12h12l4-4-4-4" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}
