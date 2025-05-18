
'use client';

import { useState, useMemo } from 'react';
import type { AppEntity, EntityType } from '@/types';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DirectoryClientContentProps {
  initialEntities: AppEntity[];
}

const entityTypeTranslations: Record<EntityType, string> = {
  'dealer': 'Concessionnaire',
  'client': 'Client',
  'loadix-unit': 'Engin LOADIX',
  'methanisation-site': 'Site de Méthanisation',
};

const entityTypeBadgeColors: Record<EntityType, "default" | "secondary" | "destructive" | "outline"> = {
  'dealer': 'default',
  'client': 'secondary',
  'loadix-unit': 'destructive',
  'methanisation-site': 'outline',
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
        entity.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entityTypeTranslations[entity.entityType] || '').toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [initialEntities, searchTerm, selectedEntityType]);

  const entityTypes: EntityType[] = ['dealer', 'client', 'loadix-unit', 'methanisation-site'];

  const handleRowClick = (entity: AppEntity) => {
    router.push(`/item/${entity.entityType}/${entity.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, ville, ID, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-input/50 border-border/70 focus:bg-input"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
        <Button variant="outline" className="w-full md:w-auto" disabled>
          <PlusCircle className="mr-2 h-5 w-5" />
          Créer une fiche
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50 bg-card/50 backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Pays</TableHead>
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
         <p className="text-sm text-muted-foreground text-center md:text-right">
            Affichage de {filteredEntities.length} sur {initialEntities.length} entités.
        </p>
      )}
    </div>
  );
}
