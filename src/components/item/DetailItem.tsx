// src/components/item/DetailItem.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge, BadgeProps } from '@/components/ui/badge';

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | string[] | React.ReactNode | null;
  isLink?: boolean;
  isEmail?: boolean;
  className?: string;
}

export const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value, isLink, isEmail, className }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number' && !(Array.isArray(value) && value.length > 0)) return null;

  const renderValue = () => {
    if (React.isValidElement(value)) {
        return value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">
              {v}
            </Badge>
          ))}
        </div>
      );
    }
    if (typeof value === 'string') {
      if (isLink) {
        return (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      if (isEmail) {
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      return <span className="text-foreground/90 break-words text-sm">{value}</span>;
    }
     if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
    }
    return <span className="text-foreground/90 break-words text-sm">{String(value)}</span>;
  };

  return (
    <div className={cn('flex items-start space-x-2 md:space-x-3 py-1 md:py-1.5', className)}>
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5 md:mt-1" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

export default DetailItem;