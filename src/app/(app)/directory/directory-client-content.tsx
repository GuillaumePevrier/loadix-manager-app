
'use client';

import { useState, useMemo } from 'react';
import type { AppEntity, EntityType, Dealer } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search as SearchIcon, Filter, Building, Truck, Factory as SiteIcon } from 'lucide-react'; // Renamed Search to SearchIcon
import { Badge } from '@/components/ui/badge';
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

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const entityTypeBadgeColors: Record<EntityType, "default" | "secondary" | "destructive" | "outline" | "success" | null > = {
  'dealer': 'default',
  'loadix-unit': 'destructive',
  'methanisation-site': 'secondary',
};

const entityCreationRoutes: Record<EntityType, string> = {
  'dealer': '/dealers/create',
  'loadix-unit': '/loadix-units/create',
  'methanisation-site': '/methanisation-sites/create',
};

export default function DirectoryClientContent({ initialEntities }: DirectoryClientContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const router = useRouter();

  const filteredEntities = useMemo(() => {
    return initialEntities.filter(entity => {
      const typeMatch = selectedEntityType === 'all' || entity.entityType === selectedEntityType;
      const searchMatch =
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.city && entity.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entityTypeTranslations[entity.entityType] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.entityType === 'dealer' && (entity as Dealer).tractorBrands?.some((brand: string) => brand.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (entity.entityType === 'dealer' && (entity as Dealer).machineTypes?.some((type: string) => type.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (entity.entityType === 'dealer' && (entity as Dealer).brandSign?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entity.entityType === 'dealer' && (entity as Dealer).branchName?.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeMatch && searchMatch;
    });
  }, [initialEntities, searchTerm, selectedEntityType]);

  const entityTypes: EntityType[] = ['dealer', 'loadix-unit', 'methanisation-site'];

  const handleRowClick = (entity: AppEntity) => {
    router.push(`/item/${entity.entityType}/${entity.id}`);
  };

  const handleCreateNew = (type: EntityType) => {
    router.push(entityCreationRoutes[type]);
  };

  return (
    <div className="flex flex-col h-full p-1 md:p-2">
      <div className="flex flex-col sm:flex-row items-center mb-2 md:mb-3 gap-2">
        <div className="relative flex-grow w-full sm:w-auto rounded-md p-[1.5px] bg-gradient-to-r from-primary via-accent to-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card transition-all duration-300">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par nom, ville, ID, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-card border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-10 text-sm rounded-[calc(var(--radius)-1.5px)] placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        <div className="flex items-center w-full sm:w-auto flex-shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground mr-2 hidden sm:block" />
          <Select
            value={selectedEntityType}
            onValueChange={(value) => setSelectedEntityType(value as EntityType | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-input/50 border-border/70 focus:bg-input h-10 text-sm">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {entityTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {entityTypeTranslations[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="w-full sm:w-auto h-10 text-sm flex-shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une fiche
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Choisir le type de fiche</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCreateNew('dealer')}>
              <Building className="mr-2 h-4 w-4" />
              <span>Concessionnaire</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('loadix-unit')}>
              <Truck className="mr-2 h-4 w-4" />
              <span>Engin LOADIX</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('methanisation-site')}>
              <SiteIcon className="mr-2 h-4 w-4" />
              <span>Site de Méthanisation</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-grow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] min-w-[150px] px-2 py-2 text-xs">Nom</TableHead>
                <TableHead className="min-w-[120px] px-2 py-2 text-xs">Type</TableHead>
                <TableHead className="min-w-[100px] px-2 py-2 text-xs hidden sm:table-cell">Ville</TableHead>
                <TableHead className="min-w-[100px] px-2 py-2 text-xs hidden md:table-cell">Pays</TableHead>
                <TableHead className="min-w-[150px] px-2 py-2 text-xs hidden lg:table-cell">Marques Tracteurs</TableHead>
                <TableHead className="min-w-[150px] px-2 py-2 text-xs hidden lg:table-cell">Types Machines</TableHead>
                <TableHead className="min-w-[120px] px-2 py-2 text-xs hidden md:table-cell">Enseigne</TableHead>
                <TableHead className="min-w-[120px] px-2 py-2 text-xs hidden xl:table-cell">Succursale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => (
                  <TableRow
                    key={entity.id}
                    onClick={() => handleRowClick(entity)}
                    className="cursor-pointer hover:bg-primary/10"
                  >
                    <TableCell className="font-medium px-2 py-1.5 text-xs">{entity.name}</TableCell>
                    <TableCell className="px-2 py-1.5 text-xs">
                      <Badge variant={entityTypeBadgeColors[entity.entityType] || 'outline'} className="text-xs">
                        {entityTypeTranslations[entity.entityType] || entity.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden sm:table-cell">{entity.city}</TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden md:table-cell">{entity.country}</TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden lg:table-cell">
                      {entity.entityType === 'dealer' && (entity as Dealer).tractorBrands && (entity as Dealer).tractorBrands!.length > 0
                        ? (entity as Dealer).tractorBrands!.slice(0,2).map(brand => <Badge key={brand} variant="secondary" className="mr-1 mb-1 text-xs">{brand}</Badge>)
                        : entity.entityType === 'dealer' ? <span className="text-muted-foreground text-xs italic">N/A</span> : ''}
                      {(entity.entityType === 'dealer' && (entity as Dealer).tractorBrands && (entity as Dealer).tractorBrands!.length > 2) && <Badge variant="outline" className="text-xs">...</Badge>}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden lg:table-cell">
                       {entity.entityType === 'dealer' && (entity as Dealer).machineTypes && (entity as Dealer).machineTypes!.length > 0
                        ? (entity as Dealer).machineTypes!.slice(0,2).map(type => <Badge key={type} variant="secondary" className="mr-1 mb-1 text-xs">{type}</Badge>)
                        : entity.entityType === 'dealer' ? <span className="text-muted-foreground text-xs italic">N/A</span> : ''}
                      {(entity.entityType === 'dealer' && (entity as Dealer).machineTypes && (entity as Dealer).machineTypes!.length > 2) && <Badge variant="outline" className="text-xs">...</Badge>}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden md:table-cell">
                      {entity.entityType === 'dealer' ? ((entity as Dealer).brandSign || <span className="text-muted-foreground text-xs italic">N/A</span>) : ''}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-xs hidden xl:table-cell">
                      {entity.entityType === 'dealer' ? ((entity as Dealer).branchName || <span className="text-muted-foreground text-xs italic">N/A</span>) : ''}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Aucune entité trouvée. Essayez d'ajuster vos filtres ou votre recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      {filteredEntities.length > 0 && (
        <p className="text-xs text-muted-foreground text-center md:text-right pt-1.5">
          Affichage de {filteredEntities.length} sur {initialEntities.length} entités.
        </p>
      )}
    </div>
  );
}
