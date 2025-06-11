'use client'

import { useState, useMemo } from 'react';
import type { AppEntity, EntityType, Dealer, MethanisationSite } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search as SearchIcon, Filter, Building, Truck, Home as SiteIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

interface DirectoryClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType | 'all', string> = {
  'all': 'Tous',
  'dealer': 'Concessionnaire',
  'loadix-unit': 'Engin LOADIX',
  'site': 'Site de Méthanisation',
};

const entityTypeBadgeColors: Record<EntityType, "default" | "secondary" | "destructive" | "outline" | "success" | null> = {
  'dealer': 'default',
  'loadix-unit': 'destructive',
  'site': 'secondary',
};

const entityCreationRoutes: Record<Exclude<EntityType, 'all'>, string> = {
  'dealer': '/dealers/create',
  'loadix-unit': '/loadix-units/create',
  'site': '/methanisation-sites/create',
};

// Column configurations per entity type
const columnConfigs: Record<EntityType | 'all', {
  key: string;
  label: string;
  className?: string;
  render?: (entity: AppEntity) => React.ReactNode;
}[]> = {
  'all': [
    { key: 'name', label: 'Nom', className: 'w-[180px] min-w-[150px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'entityType', label: 'Type', className: 'min-w-[120px] px-2 py-2 text-xs cursor-pointer',
      render: e => <Badge variant={entityTypeBadgeColors[e.entityType] || 'outline'} className="text-xs">{entityTypeTranslations[e.entityType]}</Badge>
    },
    { key: 'city', label: 'Ville', className: 'min-w-[100px] px-2 py-2 text-xs hidden sm:table-cell cursor-pointer' },
    { key: 'country', label: 'Pays', className: 'min-w-[100px] px-2 py-2 text-xs hidden md:table-cell cursor-pointer' },
    { key: 'department', label: 'Département', className: 'min-w-[120px] px-2 py-2 text-xs hidden md:table-cell cursor-pointer' },
  ],
  'dealer': [
    { key: 'name', label: 'Nom', className: 'w-[200px] min-w-[180px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'city', label: 'Ville', className: 'min-w-[150px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'country', label: 'Pays', className: 'min-w-[100px] px-2 py-2 text-xs hidden sm:table-cell cursor-pointer' },
    { key: 'department', label: 'Département', className: 'min-w-[120px] px-2 py-2 text-xs hidden md:table-cell cursor-pointer',
      render: e => {
        const dept = (e as Dealer).department;
        return dept ? dept : <span className="text-muted-foreground text-xs italic">N/A</span>;
      }
    },
    { key: 'tractorBrands', label: 'Marques Tracteurs', className: 'min-w-[150px] px-2 py-2 text-xs hidden md:table-cell',
      render: e => {
        const brands = (e as Dealer).tractorBrands;
        if (!brands?.length) return <span className="text-muted-foreground text-xs italic">N/A</span>;
        return (<>
          {brands.slice(0,2).map(b => <Badge key={b} variant="secondary" className="mr-1 mb-1 text-xs">{b}</Badge>)}
          {brands.length > 2 && <Badge variant="outline" className="text-xs">...</Badge>}
        </>);
      }
    },
    { key: 'machineTypes', label: 'Types Machines', className: 'min-w-[150px] px-2 py-2 text-xs hidden md:table-cell',
      render: e => {
        const types = (e as Dealer).machineTypes;
        if (!types?.length) return <span className="text-muted-foreground text-xs italic">N/A</span>;
        return (<>
          {types.slice(0,2).map(t => <Badge key={t} variant="secondary" className="mr-1 mb-1 text-xs">{t}</Badge>)}
          {types.length > 2 && <Badge variant="outline" className="text-xs">...</Badge>}
        </>);
      }
    },
    { key: 'brandSign', label: 'Enseigne', className: 'min-w-[120px] px-2 py-2 text-xs hidden lg:table-cell',
      render: e => (e as Dealer).brandSign || <span className="text-muted-foreground text-xs italic">N/A</span>
    },
    { key: 'branchName', label: 'Succursale', className: 'min-w-[120px] px-2 py-2 text-xs hidden xl:table-cell',
      render: e => (e as Dealer).branchName || <span className="text-muted-foreground text-xs italic">N/A</span>
    },
  ],
  'site': [
    { key: 'name', label: 'Nom du Site', className: 'w-[200px] min-w-[180px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'city', label: 'Ville', className: 'min-w-[150px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'department', label: 'Département', className: 'min-w-[120px] px-2 py-2 text-xs hidden sm:table-cell cursor-pointer',
      render: e => {
        const dept = (e as MethanisationSite).department;
        return dept ? dept : <span className="text-muted-foreground text-xs italic">N/A</span>;
      }
    },
    { key: 'productionActuelle', label: 'Production (Nm³/h)', className: 'min-w-[120px] px-2 py-2 text-xs hidden sm:table-cell' },
    { key: 'capaciteMaximale', label: 'Capacité Max', className: 'min-w-[120px] px-2 py-2 text-xs hidden md:table-cell' },
    { key: 'anneeCreation', label: 'Année Création', className: 'min-w-[100px] px-2 py-2 text-xs hidden md:table-cell' },
    { key: 'matieresInjectees', label: 'Matières Injectées', className: 'min-w-[200px] px-2 py-2 text-xs hidden lg:table-cell',
      render: e => {
        const items = (e as MethanisationSite).matieresInjectees;
        return items?.join(', ') || <span className="text-muted-foreground text-xs italic">N/A</span>;
      }
    },
    { key: 'superficieExploitation', label: 'Superficie (ha)', className: 'min-w-[100px] px-2 py-2 text-xs hidden xl:table-cell' },
  ],
  'loadix-unit': [
    { key: 'name', label: 'Nom Engin', className: 'w-[200px] min-w-[180px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'model', label: 'Modèle', className: 'min-w-[150px] px-2 py-2 text-xs cursor-pointer' },
    { key: 'year', label: 'Année', className: 'min-w-[100px] px-2 py-2 text-xs hidden sm:table-cell' },
    { key: 'dealerId', label: 'Concessionnaire ID', className: 'min-w-[150px] px-2 py-2 text-xs hidden md:table-cell' },
    { key: 'status', label: 'Statut', className: 'min-w-[120px] px-2 py-2 text-xs hidden lg:table-cell' },
  ],
};

export default function DirectoryClientContent({ initialEntities: rawInitialEntities }: DirectoryClientContentProps) {
  const initialEntities = useMemo(() => rawInitialEntities.map(e => ({
    ...e,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as any)?.toDate?.()?.toISOString() || e.createdAt,
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : (e.updatedAt as any)?.toDate?.()?.toISOString() || e.updatedAt,
  })), [rawInitialEntities]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  const filteredAndSorted = useMemo(() => {
    let filtered = initialEntities.filter(e => {
      const matchesType = selectedEntityType === 'all' || e.entityType === selectedEntityType;
      const term = searchTerm.toLowerCase();
      const baseMatch = e.name.toLowerCase().includes(term) || e.id.toLowerCase().includes(term)
        || (e.city?.toLowerCase().includes(term)) || (e.country?.toLowerCase().includes(term));
      const deptMatch = (e as any).department?.toLowerCase().includes(term);
      const dealerMatch = e.entityType === 'dealer' && ((e as Dealer).tractorBrands || []).some(b => b.toLowerCase().includes(term))
        || ((e as Dealer).machineTypes || []).some(t => t.toLowerCase().includes(term));
      const siteMatch = e.entityType === 'site' && ((e as MethanisationSite).matieresInjectees || []).join(', ').toLowerCase().includes(term);
      return matchesType && (baseMatch || deptMatch || dealerMatch || siteMatch);
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortColumn] || '';
        const bVal = (b as any)[sortColumn] || '';
        const cmp = typeof aVal === 'string' && typeof bVal === 'string'
          ? aVal.localeCompare(bVal)
          : aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return filtered;
  }, [initialEntities, searchTerm, selectedEntityType, sortColumn, sortDirection]);

  const entityTypes: (EntityType | 'all')[] = ['all', 'dealer', 'loadix-unit', 'site'];

  const onSort = (key: string) => {
    if (sortColumn === key) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(key); setSortDirection('asc'); }
  };

  const handleRowClick = (e: AppEntity) => {
    const base = e.entityType === 'site' ? 'methanisation-site' : e.entityType;
    router.push(`/item/${base}/${e.id}`);
  };

  return (
    <div className="flex flex-col h-full p-2">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center mb-3 gap-2">
        <div className="relative flex-grow bg-gradient-to-r from-primary via-accent to-primary rounded-md p-[1.5px] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card transition-all">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom, ville, département..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-card border-0 focus-visible:ring-0 h-10 text-sm rounded-[calc(var(--radius)-1.5px)] placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        <div className="flex items-center w-full sm:w-auto flex-shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground mr-2 hidden sm:block" />
          <Select value={selectedEntityType} onValueChange={v => setSelectedEntityType(v as EntityType | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 text-sm">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map(type => (
                <SelectItem key={type} value={type}>{entityTypeTranslations[type]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-10 text-sm flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une fiche
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Type de fiche</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['dealer','loadix-unit','site'] as EntityType[]).map(type => (
              <DropdownMenuItem key={type} onClick={() => router.push(entityCreationRoutes[type])}>
                {{
                  'dealer': <><Building className="mr-2 h-4 w-4"/>Concessionnaire</>,
                  'loadix-unit': <><Truck className="mr-2 h-4 w-4"/>Engin LOADIX</>,
                  'site': <><SiteIcon className="mr-2 h-4 w-4"/>Site Méthanisation</>
                }[type]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <ScrollArea className="flex-grow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columnConfigs[selectedEntityType].map(col => (
                  <TableHead
                    key={col.key}
                    className={col.className}
                    onClick={() => onSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {sortColumn === col.key && (sortDirection === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.length ? filteredAndSorted.map(entity => (
                <TableRow key={entity.id} className="cursor-pointer hover:bg-primary/10" onClick={() => handleRowClick(entity)}>
                  {columnConfigs[selectedEntityType].map(col => (
                    <TableCell key={col.key} className="px-2 py-1.5 text-xs">
                      {col.render ? col.render(entity) : ((entity as any)[col.key] ?? <span className="text-muted-foreground italic">N/A</span>)}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={columnConfigs[selectedEntityType].length} className="h-24 text-center text-muted-foreground">
                    Aucune entité trouvée. Ajustez vos filtres ou votre recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {filteredAndSorted.length > 0 && (
        <p className="text-xs text-muted-foreground text-right pt-2">
          Affichage de {filteredAndSorted.length} sur {initialEntities.length} entités.
        </p>
      )}
    </div>
  );
}
