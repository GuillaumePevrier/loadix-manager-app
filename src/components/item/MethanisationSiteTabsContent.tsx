'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MethanisationSite } from "@/types"; // Adjust import path as needed
import MethanisationSiteActivitiesTab from "./MethanisationSiteActivitiesTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MethanisationSiteLoadixUnitsTab from "./MethanisationSiteLoadixUnitsTab";
import MethanisationSiteDocumentsTab from "./MethanisationSiteDocumentsTab";

interface MethanisationSiteTabsContentProps {
  site: MethanisationSite;
}

const MethanisationSiteTabsContent: React.FC<MethanisationSiteTabsContentProps> = ({ site }) => {
  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6"> {/* Adjust grid-cols as needed */}
        <TabsTrigger value="general">Informations Générales</TabsTrigger>
        <TabsTrigger value="activities">Suivi / Activités</TabsTrigger>
        {/* Add triggers for other tabs here */}
        <TabsTrigger value="units">Unités Loadix</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales du Site</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <strong>Nom du Site:</strong> {site.name}
            </div>
            <div>
              <strong>Adresse:</strong> {site.address}, {site.postalCode} {site.city}, {site.country}
            </div>
            {site.capacity && (
              <div>
                <strong>Capacité:</strong> {site.capacity}
              </div>
            )}
            {site.operator && (
              <div>
                <strong>Opérateur:</strong> {site.operator}
              </div>
            )}
            {site.startDate && (
              <div>
                <strong>Date de début:</strong> {new Date(site.startDate).toLocaleDateString()}
              </div>
            )}
            {site.technologies && site.technologies.length > 0 && (
              <div>
                <strong>Technologies:</strong> {site.technologies.join(', ')}
              </div>
            )}
            {site.siteClients && site.siteClients.length > 0 && (
              <div>
                <strong>Clients:</strong> {site.siteClients.map(client => client.name).join(', ')}
              </div>
            )}
            {/* Add other relevant general information fields here */}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="activities">
        <Card>
          <CardHeader>
            <CardTitle>Suivi / Activités</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 w-full">
 <MethanisationSiteActivitiesTab site={site} /> {/* Pass site data */}
 </CardContent>
        </Card>
      </TabsContent>
 <TabsContent value="units">
        <Card>
          <CardHeader>
            <CardTitle>Unités Loadix Associées</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
 <MethanisationSiteLoadixUnitsTab site={site} /> {/* Pass site data */}
          </CardContent>
        </Card>
 </TabsContent>
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
 <MethanisationSiteDocumentsTab site={site} /> {/* Pass site data */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MethanisationSiteTabsContent;