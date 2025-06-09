
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  className,
  triggerClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Add useState hook to manage selected state
  const [selected, setSelected] = React.useState<string[]>(value);

  // Update internal state when the external value prop changes
  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (optionValue: string) => {
    onValueChange(
 selected.includes(optionValue)
 ? selected.filter((item) => item !== optionValue)
 : [...selected, optionValue]
 );
  };

  const selectedLabels = selected
    .map((val) => options.find((option) => option.value === val)?.label)
    .filter(Boolean) as string[];

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-auto min-h-10", triggerClassName)}
            onClick={() => setOpen(!open)}
          > {/* Corrected line */}
            <span className="flex flex-wrap gap-1 items-center">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label) => (
                  <Badge
                    variant="secondary"
                    key={label}
                    className="mr-1 mb-1 px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent popover from opening/closing
                      const valueToDeselect = options.find(opt => opt.label === label)?.value;
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
                {options && Array.isArray(options) && options.map((option) => (
 <CommandItem
 key={option.value}
 value={option.label} // Search by label
 onSelect={() => {
 handleSelect(option.value);
 // setOpen(false); // Keep popover open for multiple selections // Corrected line
 }}
 >
 <Check
 className={cn(
 "mr-2 h-4 w-4",
 selected.includes(option.value)
 ? "opacity-100"
 : "opacity-0"
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
