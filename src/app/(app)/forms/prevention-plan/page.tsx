import type { Metadata } from 'next';
import PreventionPlanForm from './prevention-plan-form';

export const metadata: Metadata = {
  title: 'Créer un Plan de Prévention | LOADIX Manager',
  description: 'Formulaire pour la création d\'un plan de prévention par étapes.',
};

export default function PreventionPlanPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Créer un Plan de Prévention</h1>
      {/* The client component will handle the form logic */}
      <PreventionPlanForm />
    </div>
  );
}