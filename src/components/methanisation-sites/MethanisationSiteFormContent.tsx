'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { MethanisationSite } from '@/types';

interface MethanisationSiteFormContentProps {
  site: MethanisationSite;
  isEditing: boolean;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function MethanisationSiteFormContent({
  site,
  isEditing,
  handleInputChange,
}: MethanisationSiteFormContentProps) {

  const renderField = (label: string, name: keyof MethanisationSite, type: string = 'text') => {
    const value = site[name] as string | number | boolean | string[] | undefined;

    if (isEditing) {
      // Handle specific input types
      if (type === 'textarea') {
        return (
          <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Textarea id={name} name={name} value={(value as string) || ''} onChange={handleInputChange} />
          </div>
        );
      } else if (type === 'checkbox') {
         return (
          <div className="flex items-center space-x-2">
            <Input id={name} name={name} type="checkbox" checked={!!value} onChange={(e) => handleInputChange && handleInputChange({ ...e, target: { ...e.target, value: e.target.checked } as any})} />
            <Label htmlFor={name}>{label}</Label>
          </div>
        );
      } else if (Array.isArray(value)) {
         return (
           <div className="grid gap-2">
             <Label htmlFor={name}>{label}</Label>
              {/* This should ideally be a multi-select or similar component */}
            <Input id={name} name={name} value={(value as string[]).join(',') || ''} onChange={(e) => handleInputChange && handleInputChange({ ...e, target: { ...e.target, value: e.target.value.split(',').map(id => id.trim()) } as any})} />
           </div>
         );
      }
       else {
        return (
          <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} type={type} value={value as string | number || ''} onChange={handleInputChange} />
          </div>
        );
      }
    } else {
      // Display as read-only text
       if (Array.isArray(value)) {
         return (
           <div className="grid gap-2">
             <Label>{label}</Label>
              <p className="text-sm text-muted-foreground">{(value as string[]).join(', ') || 'N/A'}</p>
           </div>
         );
       }
      return (
        <div className="grid gap-2">
          <Label>{label}</Label>
          <p className="text-sm text-muted-foreground">{value as string || 'N/A'}</p>
        </div>
      );
    }
  };

  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
         {/* Add other tabs as needed */}
      </TabsList>

      <TabsContent value="general" className="space-y-4 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Nom du site', 'name')}
            {renderField('SIRET/SIREN', 'siretSiren')}
             {renderField('Type Légal', 'legalType')}
             {renderField('Structure Légal', 'legalStructure')}
             {renderField('Type de Projet', 'projectType')}
             {renderField('Type Intrants Principale', 'mainIntrantsType')}
             {renderField('Technologies', 'technologies')}
             {renderField('Type de Valorisation', 'valorizationType')}
             {renderField('Puissance Électrique Installée (kW)', 'installedElectricalPower', 'number')}
             {renderField('Puissance Thermique Installée (kW)', 'installedThermalPower', 'number')}
              {renderField('Débit Maximal Biogaz (Nm3/h)', 'maxBiomethaneFlow', 'number')}
             {renderField('Production Annuelle Estimée (MWh)', 'estimatedAnnualProduction', 'number')}
             {renderField('Volume Autorisé (Nm3)', 'authorizedVolume', 'number')}
             {renderField('Régime ICPE', 'icpeRegime')}
             {renderField('Statut ICPE', 'icpeStatus')}
             {renderField('Zone Urbaine/Rurale', 'urbanOrRuralArea')}
              {renderField('Proximité STEP/ISDND', 'proximityToStepIsdnd')}
              {renderField('Clients du Site', 'siteClients', 'textarea')}
              {renderField('IDs Concessionnaires Associés', 'relatedDealerIds', 'array')}
              {renderField('Commentaires', 'comments', 'textarea')}
             {renderField('Statut de Prospection', 'prospectionStatus')}
              {renderField('Capital Majoritairement Agricole', 'majorityAgriculturalCapital', 'checkbox')}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4 py-4">
         <Card>
          <CardHeader>
            <CardTitle>Informations de Contact et Adresse</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {renderField('Contact Principal', 'mainContact')}
             {renderField('Téléphone', 'phone')}
             {renderField('Email', 'email', 'email')}
             {renderField('Site Web', 'website', 'url')}
              {renderField('Adresse', 'address')}
             {renderField('Ville', 'city')}
             {renderField('Code Postal', 'postalCode')}
             {renderField('Département', 'department')}
             {renderField('Pays', 'country')}
              {/* geoLocation would likely require a map input component */}
          </CardContent>
        </Card>
      </TabsContent>

       {/* Add content for other tabs */}

    </Tabs>
  );
}