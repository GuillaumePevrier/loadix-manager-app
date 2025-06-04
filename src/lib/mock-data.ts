
import type { Dealer, LoadixUnit, Site, AppEntity, Comment } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS } from '@/types'; // Import options

const commonAddressFrance = {
  address: '1 Rue de la Paix',
  city: 'Paris',
  postalCode: '75002',
  country: 'France',
  geoLocation: { lat: 48.868, lng: 2.332 },
};

const commonAddressLyon = {
  address: '10 Place Bellecour',
  city: 'Lyon',
  postalCode: '69002',
  country: 'France',
  geoLocation: { lat: 45.757, lng: 4.832 },
};


export const mockDealers: Dealer[] = [
  {
    id: 'dealer-1',
    name: 'AgriTech Solutions Paris',
    entityType: 'dealer',
    ...commonAddressFrance,
    phone: '+33 1 23 45 67 89',
    email: 'contact@agritechparis.fr',
    website: 'https://agritechparis.fr',
    contactPerson: 'Jean Dupont',
    servicesOffered: ['Vente', 'Maintenance', 'Conseil'],
    tractorBrands: ['john_deere', 'claas'], 
    machineTypes: ['tractor', 'combine_harvester'], 
    prospectionStatus: 'hot',
    comments: [
      { userName: 'Alice', date: new Date(Date.now() - 86400000 * 2).toISOString(), text: 'Premier contact établi, très intéressé par LOADIX Pro.' },
      { 
        userName: 'Bob', 
        date: new Date(Date.now() - 86400000).toISOString(), 
        text: 'Démonstration prévue la semaine prochaine. Voir photo du site.',
        imageUrl: 'https://placehold.co/300x200.png?text=Site+Demo',
        dataAiHint: "demonstration site"
      },
      {
        userName: 'Admin',
        date: new Date().toISOString(),
        text: 'Contrat de partenariat en pièce jointe.',
        fileUrl: 'https://example.com/contrat_partenariat.pdf',
        fileName: 'Contrat_Partenariat_AgriTech.pdf'
      }
    ],
    galleryUris: [`https://placehold.co/300x200.png?text=AgriTech+Showroom`, `https://placehold.co/300x200.png?text=Atelier+Paris`],
    documentUris: ['https://example.com/brochure_agritech.pdf'],
    department: '75 - Paris',
    brandSign: 'AgriTech Group',
    branchName: 'Paris Centre',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dealer-2',
    name: 'Lyon Machines Agricoles',
    entityType: 'dealer',
    ...commonAddressLyon,
    phone: '+33 4 56 78 90 12',
    email: 'info@lyonagri.com',
    website: 'https://lyonagri.com',
    contactPerson: 'Sophie Martin',
    servicesOffered: ['Vente', 'Réparations'],
    tractorBrands: ['new_holland', 'fendt'],
    machineTypes: ['forage_harvester', 'loader'],
    prospectionStatus: 'warm',
    comments: [
      { userName: 'Charles', date: new Date().toISOString(), text: 'A demandé une documentation technique.' },
    ],
    department: '69 - Rhône',
    brandSign: 'Machines Rhône-Alpes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockLoadixUnits: LoadixUnit[] = [
  {
    id: 'unit-1',
    name: 'LOADIX #SN001',
    entityType: 'loadix-unit',
    serialNumber: 'LDX-2023-001',
    model: 'LOADIX Pro v2',
    status: 'active',
    address: 'Ferme de la Vallée Verte',
    city: 'Chartres',
    postalCode: '28000',
    country: 'France',
    geoLocation: { lat: 48.4475, lng: 1.4845 },
    purchaseDate: new Date('2023-05-15').toISOString(),
    dealerId: 'dealer-1',
    methanisationSiteId: 'site-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'unit-2',
    name: 'LOADIX #SN002',
    entityType: 'loadix-unit',
    serialNumber: 'LDX-2024-002',
    model: 'LOADIX Compact',
    status: 'in_stock',
    address: 'Chez Lyon Machines Agricoles',
    city: 'Lyon',
    postalCode: '69007',
    country: 'France',
    geoLocation: { lat: 45.7600, lng: 4.8300 },
    dealerId: 'dealer-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];


export const allMockEntities: AppEntity[] = [
  {    id: 'site-2', name: 'BioÉnergie Ouest', entityType: 'site', address: 'Zone Industrielle Sud',
    city: 'Nantes',
    postalCode: '44200',
    country: 'France',
    geoLocation: { lat: 47.2184, lng: -1.5536 },
    capacity: '2 MW',
    operator: 'BioÉnergie Ouest SA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  ,
  ...mockDealers,
  ...mockLoadixUnits,
];

export function findEntityByIdAndType(entityType: EntityType, id: string): AppEntity | undefined {
  switch (entityType) {
    case 'dealer':
      // Add logic to find a dealer if you add mock dealers later
      return mockDealers.find(d => d.id === id);
    case 'loadix-unit':
      return mockLoadixUnits.find(u => u.id === id);
    case 'methanisation-site':
      return mockMethanisationSites.find(s => s.id === id);
    default:
      return undefined;
  }
}

