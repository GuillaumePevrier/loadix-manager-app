'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { getDealers } from '@/services/dealerService';
import { getAllMethanisationSites } from '@/services/methanisationSiteService';
import type { Comment } from '@/types';

// Import dynamique pour que Timeline soit chargé côté client
const Timeline = dynamic(() => import('@/components/Timeline'), { ssr: false });

export default function HomePage() {
  const [dealersCount, setDealersCount] = useState(0);
  const [sitesCount, setSitesCount] = useState(0);
  const [sitesByDept, setSitesByDept] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    async function fetchData() {
      // 1) Concessionnaires et sites
      try {
        const dl = await getDealers();
        const st = await getAllMethanisationSites();
        setDealersCount(dl.length);
        setSitesCount(st.length);

        // Comptage des sites par département
        const deptCount: Record<string, number> = {};
        st.forEach(site => {
          const dept = site.department || 'Inconnu';
          deptCount[dept] = (deptCount[dept] || 0) + 1;
        });
        setSitesByDept(deptCount);
      } catch (err) {
        console.error('Erreur fetch dealers/sites :', err);
      }

      // 2) Commentaires
      try {
        const { getLatestComments } = await import('@/services/timelineService');
        const cm = await getLatestComments();
        setComments(cm);
      } catch (err) {
        console.error('Erreur fetch commentaires :', err);
        // Si erreur, on garde comments = [] et Timeline s'affichera vide
      }
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold">Dashboard ManuRob</h1>
      </header>

      {/* Compteurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white shadow rounded-md">
          <CardHeader>
            <CardTitle>Concessionnaires</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{dealersCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-md">
          <CardHeader>
            <CardTitle>Sites de Méthanisation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{sitesCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow rounded-md">
          <CardHeader>
            <CardTitle>Sites par Département</CardTitle>
          </CardHeader>
          <CardContent className="max-h-48 overflow-auto space-y-1">
            {Object.entries(sitesByDept).map(([dept, count]) => (
              <div key={dept} className="flex justify-between text-sm">
                <span>{dept}</span>
                <span>{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fil d'actualité */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Fil d'actualité</h2>
        <Timeline comments={comments} />
      </section>
    </div>
  );
}