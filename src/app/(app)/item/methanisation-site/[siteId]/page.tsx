'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MethanisationSite } from '@/types'; // Assuming types are defined here
import methanisationSiteService from '@/services/methanisationSiteService'; // Assuming the service exists
import MethanisationSiteTabsContent from '@/components/item/MethanisationSiteTabsContent'; // Import the new component
import DeleteButton from '@/components/item/delete-button';

// These placeholder components are no longer used as MethanisationSiteTabsContent handles the tab content
// Placeholder components for different tabs
const GeneralInfoTab = ({ site }: { site: MethanisationSite | null }) => {
  if (!site) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Informations Générales</h3>
      <p><strong>Nom:</strong> {site.name}</p>
      <p><strong>Adresse:</strong> {site.address}, {site.postalCode} {site.city}, {site.country}</p>
      {site.capacity && <p><strong>Capacité:</strong> {site.capacity}</p>}
      {site.operator && <p><strong>Opérateur:</strong> {site.operator}</p>}
      {site.startDate && <p><strong>Date de début:</strong> {new Date(site.startDate).toLocaleDateString()}</p>}
      {/* Add other relevant fields */}
    </div>
  );
};

const ProspectionFollowUpTab = ({ site }: { site: MethanisationSite | null }) => {
  if (!site) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Suivi de Prospection</h3>
      {/* Placeholder for prospection follow-up details specific to methanisation sites */}
      <p>Prospection follow-up content goes here.</p>
      {/* You will need to fetch and display relevant prospection data */}
    </div>
  );
};

export default function MethanisationSiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<MethanisationSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (siteId) {
      const fetchSite = async () => {
        try {
          setLoading(true);
          const siteData = await methanisationSiteService.getMethanisationSiteById(siteId);
          if (siteData) {
            setSite(siteData);
          } else {
            setError("Site de méthanisation introuvable.");
          }
        } catch (err) {
          console.error("Error fetching methanisation site:", err);
          setError("Erreur lors du chargement des données du site.");
        } finally {
          setLoading(false);
        }
      };
      fetchSite();
    }
  }, [siteId]);

  if (loading) {
    return <div className="container mx-auto py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">Erreur: {error}</div>;
  }

  if (!site) {
      return <div className="container mx-auto py-8">Site non trouvé.</div>;
  }

  return (<div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fiche Site de Méthanisation: {site.name}</h1>

      <div className="flex justify-end mb-6">
        {/* Example Edit button - you'll need to implement the link */}
        {/* <Button variant="outline" className="mr-2">Modifier</Button> */}

        <DeleteButton
          entityId={site.id}
          entityType="methanisation-site"
          onSuccessfulDelete={() => router.push('/methanisation-sites')} // Redirect to the list page
        />
      </div>

      {/* Render the MethanisationSiteTabsContent component */}
      <MethanisationSiteTabsContent site={site} />
    </div>
  );
}