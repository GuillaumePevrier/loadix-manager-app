'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, MapPinned, BotMessageSquare, Building, Tractor, Wrench } from 'lucide-react';
import { getDealers } from '@/services/dealerService';
import { getAllMethanisationSites, MethanisationSite } from '@/services/methanisationSiteService';
import { Dealer } from '@/types';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [sites, setSites] = useState<MethanisationSite[]>([]);
  const [dealersByDepartment, setDealersByDepartment] = useState<Record<string, number>>({});
  const [sitesByDepartment, setSitesByDepartment] = useState<Record<string, number>>({});
  const [sitesPerDealer, setSitesPerDealer] = useState<Record<string, number>>({});
  const [dealersByBrand, setDealersByBrand] = useState<Record<string, number>>({});
  const [dealersByMachineType, setDealersByMachineType] = useState<Record<string, number>>({});
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Effet pour récupérer et traiter les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealersData, sitesData] = await Promise.all([
 getDealers(),
          getAllMethanisationSites(),
        ]);

        setDealers(dealersData);
        setSites(sitesData);

        // 1. Comptage des dealers par département
        const dealersDeptCount: Record<string, number> = {};
        dealersData.forEach((dealer) => {
          const department = dealer.department || 'Département Inconnu';
          dealersDeptCount[department] = (dealersDeptCount[department] || 0) + 1;
        });
        setDealersByDepartment(dealersDeptCount);

        // 2. Comptage des sites par département
        const sitesDeptCount: Record<string, number> = {};
        sitesData.forEach((site) => {
          const department = site.department || 'Département Inconnu';
          sitesDeptCount[department] = (sitesDeptCount[department] || 0) + 1;
        });
        setSitesByDepartment(sitesDeptCount);

        // 3. Nombre de sites par dealer
        const sitesDealerCount: Record<string, number> = {};
        dealersData.forEach((dealer) => {
          sitesDealerCount[dealer.id] = dealer.relatedSiteIds?.length || 0;
        });
        setSitesPerDealer(sitesDealerCount);

        // 4. Comptage des dealers par marque de tracteur
        const dealersBrandCount: Record<string, number> = {};
        dealersData.forEach((dealer) => {
          dealer.tractorBrands?.forEach((brand) => {
            dealersBrandCount[brand] = (dealersBrandCount[brand] || 0) + 1;
          });
        });
        setDealersByBrand(dealersBrandCount);

        // 5. Comptage des dealers par type de machine
        const dealersMachineTypeCount: Record<string, number> = {};
        dealersData.forEach((dealer) => {
          dealer.machineTypes?.forEach((type) => {
            dealersMachineTypeCount[type] = (dealersMachineTypeCount[type] || 0) + 1;
          });
        });
        setDealersByMachineType(dealersMachineTypeCount);
      } catch (error) {
        console.error('Erreur lors de la récupération ou du traitement des données :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // [] : exécution une seule fois au montage

  // Effet pour mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto py-6 md:py-8 px-3 md:px-4">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-futura mb-2 md:mb-3">
          Gestionnaire ManuRob
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-bebas-neue tracking-wider">
          Plateforme de Gestion des Unités Autonomes
        </p>
        <div className="mt-4 text-md text-muted-foreground">
          {currentDateTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} {currentDateTime.toLocaleTimeString('fr-FR')}
        </div>
      </header>

      {loading ? (
        <div className="text-center text-xl">Loading data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {/* Dealers by Department */}
          <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-y-auto max-h-64">
            {/* Dealers by Department */}
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bebas-neue">Concessionnaires par Département</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(dealersByDepartment).map(([dept, count]) => (
                  <li key={dept}>
                    {dept}: {count}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Sites by Department */}
          <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-y-auto max-h-64">
            {/* Sites by Department */}
            <CardHeader>
               <div className="flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bebas-neue">Sites de Méthanisation par Département</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(sitesByDepartment).map(([dept, count]) => (
                  <li key={dept}>
                    {dept}: {count}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Sites per Dealer (displaying dealer ID and count) */}
          <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-y-auto max-h-64">
            <CardHeader>
              <div className="flex items-center gap-2">
                 <Building className="w-5 h-5 text-primary" /> {/* Using building for dealer context */}
                <CardTitle className="text-lg font-bebas-neue">Sites de Méthanisation par Concessionnaire</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(sitesPerDealer).map(([dealerId, count]) => (
                  <li key={dealerId}>
                    Dealer ID {dealerId}: {count} sites
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Dealers by Tractor Brand */}
          <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-y-auto max-h-64">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tractor className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bebas-neue">Concessionnaires par Marque de Tracteur</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(dealersByBrand).map(([brand, count]) => (
                  <li key={brand}>
                    {brand}: {count} dealers
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Dealers by Machine Type */}
          <Card className="bg-card/70 backdrop-blur-md border-border/50 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 overflow-y-auto max-h-64">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bebas-neue">Concessionnaires par Type de Machine</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul>
                {Object.entries(dealersByMachineType).map(([type, count]) => (
                  <li key={type}>
                    {type}: {count} dealers
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-xl">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-2xl md:text-3xl font-futura">
            À Propos du Gestionnaire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-sm md:text-base text-muted-foreground" style={{ lineHeight: 1.6 }}>
            Cette application est conçue pour optimiser la gestion des unités autonomes de manutention ManuRob.
            Du suivi du statut et de la localisation des machines à la gestion des concessionnaires et des sites clients,
            le Gestionnaire fournit une suite complète d'outils pour une efficacité opérationnelle optimale.
            L'outil de support IA intégré exploite la GenAI pour fournir une assistance rapide et pertinente, améliorant le service et la maintenance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}