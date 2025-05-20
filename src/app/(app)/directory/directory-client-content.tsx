
'use client';

import { useState, useMemo } from 'react';
import type { AppEntity, EntityType } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Filter, Building, Truck, Factory as SiteIcon } from 'lucide-react'; // Added icons for dropdown
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DirectoryClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const entityTypeBadgeColors: Record<EntityType, "default" | "secondary" | "destructive" | "outline"> = {
  'dealer': 'default',
  'loadix-unit': 'destructive',
  'methanisation-site': 'outline',
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
        (entityTypeTranslations[entity.entityType] || '').toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="flex flex-col h-full p-2 md:p-3">
      <div className="flex flex-col md:flex-row items-center mb-2 md:mb-3">
        <div className="relative flex-grow w-full md:w-auto mb-2 md:mb-0 md:mr-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, ville, ID, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-input/50 border-border/70 focus:bg-input"
          />
        </div>
        <div className="flex items-center w-full md:w-auto mb-2 md:mb-0 md:mr-2">
          <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0 mr-2" />
          <Select
            value={selectedEntityType}
            onValueChange={(value) => setSelectedEntityType(value as EntityType | 'all')}
          >
            <SelectTrigger className="w-full md:w-[200px] bg-input/50 border-border/70 focus:bg-input">
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
            <Button variant="default" className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
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

      <div className="overflow-x-auto flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Pays</TableHead>
              {/* Add more common columns or adapt dynamically later */}
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
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>
                    <Badge variant={entityTypeBadgeColors[entity.entityType] || 'default'}>
                      {entityTypeTranslations[entity.entityType] || entity.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell>{entity.city}</TableCell>
                  <TableCell>{entity.country}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Aucune entité trouvée. Essayez d'ajuster vos filtres ou votre recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filteredEntities.length > 0 && (
        <p className="text-sm text-muted-foreground text-center md:text-right pt-2">
          Affichage de {filteredEntities.length} sur {initialEntities.length} entités.
        </p>
      )}
    </div>
  );
}
