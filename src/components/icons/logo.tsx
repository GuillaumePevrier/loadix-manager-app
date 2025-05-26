
import Image from 'next/image';
import type { ImageProps } from 'next/image';

// This component now expects to render a PNG logo from the /public directory.
// Ensure your logo file (e.g., logo-loadix.png) is in the public folder.
// The `className` prop will be used to control the size of the logo.
// The `alt` prop should be provided for accessibility.

interface LogoProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  alt?: string;
  className?: string;
}

export default function Logo({ alt = "LOADIX Logo", className, ...props }: LogoProps) {
  // Defaulting to a common logo name. Adjust if your filename is different.
  const logoPath = '/logo-loadix.png';

  return (
    <div className={cn("relative", className)}>
      <Image
        src={logoPath}
        alt={alt}
        fill
        sizes="(max-width: 768px) 32px, 64px" // Example sizes
        style={{ objectFit: 'contain' }} // 'contain' is often good for logos
        priority // Preload logo if it's above the fold
        {...props}
      />
    </div>
  );
}

// Helper cn function if not already available, or import from '@/lib/utils'
// For simplicity, including a basic version here if this file is standalone.
// In a real project, you'd import cn from '@/lib/utils'.
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');
