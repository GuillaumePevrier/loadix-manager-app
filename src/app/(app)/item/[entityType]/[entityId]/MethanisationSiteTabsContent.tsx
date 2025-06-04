// src/components/MethanisationSiteTabsContent.tsx
import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import EditMethanisationSiteForm from '@/components/EditMethanisationSiteForm';
interface MethanisationSiteTabsContentProps {
  methanisationSite: any; // Replace 'any' with a proper type later
  onDataRefresh: () => void;
}

const MethanisationSiteTabsContent: React.FC<MethanisationSiteTabsContentProps> = ({
  methanisationSite,
  onDataRefresh,
}) => {
  // Basic structure for now, replace with actual site data later
  const site = methanisationSite || {
    id: 'placeholder-id',
    name: 'Site de Méthanisation Placeholder',
    address: '123 Rue Exemple, 75000 Paris',
 contactEmail: 'contact@placeholder.com',
 geoLocation: { lat: 48.8566, lng: 2.3522 }, // Example placeholder
  };

  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="location">Localisation</TabsTrigger>
        {/* Add more tabs as needed later */}
 <TabsTrigger value="edit">Modifier</TabsTrigger>
        <TabsTrigger value="maintenance" disabled>Maintenance (Prochainement)</TabsTrigger>
        <TabsTrigger value="production" disabled>Production (Prochainement)</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom du site</p>
              <p className="text-base">{site.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Capacité</p>
              <p className="text-base">{site.capacity}</p>
            </div>
 <div>
 <p className="text-sm font-medium text-muted-foreground">Email de contact</p>
 <p className="text-base">{site.contactEmail || 'N/A'}</p>
 </div>
            {/* Add more general fields later */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="location">
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              <p className="text-base">{site.address}</p>
            </div>
 {methanisationSite && methanisationSite.geoLocation && methanisationSite.geoLocation.lat !== undefined && methanisationSite.geoLocation.lng !== undefined && (
 <div>
 <p className="text-sm font-medium text-muted-foreground">Coordonnées Géographiques</p>
 <p className="text-base">
 Latitude: {methanisationSite.geoLocation.lat.toFixed(5)}, Longitude: {methanisationSite.geoLocation.lng.toFixed(5)}
 </p>
 </div>
 )}
            {/* Add map component here later */}
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md text-muted-foreground">
              Placeholder Carte
            </div>
          </CardContent>
        </Card>
      </TabsContent>

 <TabsContent value="edit">
 {/* Render the edit form here */}
 <EditMethanisationSiteForm siteId={methanisationSite.id} initialData={methanisationSite} onSaveSuccess={onDataRefresh} />
 </TabsContent>
      {/* Add content for other tabs here later */}
    </Tabs>
  );
};

export default MethanisationSiteTabsContent;