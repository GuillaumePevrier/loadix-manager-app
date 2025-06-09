'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  /** Liste d'options disponibles */
  options?: MultiSelectOption[];
  /** Valeurs sélectionnées (alias de `value`) */
  selected?: string[];
  /** Valeurs sélectionnées */
  value?: string[];
  /** Callback appelé à chaque changement de sélection */
  onValueChange?: (value: string[]) => void;
  /** Alias pour onValueChange, pour compatibilité */
  onChange?: (value: string[]) => void;
  /** Texte d'indication lorsque rien n'est sélectionné */
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function MultiSelect({
  options = [],
  value,
  selected,
  onValueChange,
  onChange,
  placeholder = 'Sélectionner...',
  className,
  triggerClassName,
}: MultiSelectProps) {
  const validOptions = Array.isArray(options) ? options : [];
  const [open, setOpen] = React.useState(false);

  // Combine les alias `value` et `selected`
  const current = Array.isArray(value)
    ? value
    : Array.isArray(selected)
    ? selected
    : [];

  // Choisit le handler disponible
  const handleChange = React.useCallback(
    (next: string[]) => {
      if (onValueChange) return onValueChange(next);
      if (onChange) return onChange(next);
      console.warn('MultiSelect: aucun callback onValueChange ou onChange fourni');
    },
    [onValueChange, onChange]
  );

  const handleSelect = (optionValue: string) => {
    const updated = current.includes(optionValue)
      ? current.filter((item) => item !== optionValue)
      : [...current, optionValue];
    handleChange(updated);
  };

  const selectedLabels = current
    .map((val) => validOptions.find((o) => o.value === val)?.label)
    .filter(Boolean) as string[];

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between h-auto min-h-10', triggerClassName)}
            onClick={() => setOpen(!open)}
          >
            <span className="flex flex-wrap gap-1 items-center">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label) => (
                  <Badge
                    variant="secondary"
                    key={label}
                    className="mr-1 mb-1 px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      const valueToDeselect = validOptions.find((opt) => opt.label === label)?.value;
                      if (valueToDeselect) {
                        handleSelect(valueToDeselect);
                      }
                    }}
                  >
                    {label}
                    <X className="ml-1.5 h-3 w-3 cursor-pointer hover:text-destructive" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground font-normal">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup>
                {validOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        current.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
