
import type { Dealer, Client, LoadixUnit, MethanisationSite, AppEntity } from '@/types';

export const mockDealers: Dealer[] = [
  {
    id: 'dealer-1',
    name: 'AgriTech Solutions Paris',
    entityType: 'dealer',
    address: '123 Rue de Rivoli',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    phone: '+33 1 23 45 67 89',
    email: 'contact@agritechparis.fr',
    website: 'https://agritechparis.fr',
    contactPerson: 'Jean Dupont',
    servicesOffered: ['Sales', 'Maintenance', 'Consulting'],
    geoLocation: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dealer-2',
    name: 'Lyon Machines Agricoles',
    entityType: 'dealer',
    address: '45 Avenue Berthelot',
    city: 'Lyon',
    postalCode: '69007',
    country: 'France',
    phone: '+33 4 56 78 90 12',
    email: 'info@lyonagri.com',
    website: 'https://lyonagri.com',
    contactPerson: 'Sophie Martin',
    servicesOffered: ['Sales', 'Repairs'],
    geoLocation: { lat: 45.7640, lng: 4.8357 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Ferme de la Vallée Verte',
    entityType: 'client',
    address: 'Lieu-dit La Vallée',
    city: 'Chartres',
    postalCode: '28000',
    country: 'France',
    contactName: 'Pierre Dubois',
    contactEmail: 'pierre.dubois@valleeverte.com',
    contactPhone: '+33 2 34 56 78 90',
    industry: 'Agriculture',
    geoLocation: { lat: 48.4470, lng: 1.4839 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'client-2',
    name: 'BioÉnergie Ouest',
    entityType: 'client',
    address: 'Zone Industrielle Sud',
    city: 'Nantes',
    postalCode: '44200',
    country: 'France',
    contactName: 'Isabelle Moreau',
    contactEmail: 'i.moreau@bioenergieouest.fr',
    industry: 'Méthanisation',
    geoLocation: { lat: 47.2184, lng: -1.5536 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockLoadixUnits: LoadixUnit[] = [
  {
    id: 'unit-1',
    name: 'LOADIX #SN001',
    entityType: 'loadix-unit',
    address: 'Chez Ferme de la Vallée Verte', // Could be an address or linked to a client/site
    city: 'Chartres',
    postalCode: '28000',
    country: 'France',
    serialNumber: 'LDX-2023-001',
    model: 'LOADIX Pro v2',
    status: 'active',
    geoLocation: { lat: 48.4475, lng: 1.4845 }, // Slightly different from client for map
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockMethanisationSites: MethanisationSite[] = [
  {
    id: 'site-1',
    name: 'Site de Méthanisation Valorem',
    entityType: 'methanisation-site',
    address: 'Route de la Biomasse',
    city: 'Rennes',
    postalCode: '35000',
    country: 'France',
    capacity: '5000 tons/year',
    operator: 'Valorem SAS',
    geoLocation: { lat: 48.1173, lng: -1.6778 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const allMockEntities: AppEntity[] = [
  ...mockDealers,
  ...mockClients,
  ...mockLoadixUnits,
  ...mockMethanisationSites,
];

export function findEntityByIdAndType(entityType: EntityType, id: string): AppEntity | undefined {
  return allMockEntities.find(entity => entity.entityType === entityType && entity.id === id);
}
