
export interface GeoLocation {
  lat: number;
  lng: number;
}

// Adjusted EntityType: Removed 'client' as per request
export type EntityType = 'dealer' | 'loadix-unit' | 'methanisation-site';

export interface Comment {
  // userId: string; // Or userName if you don't have user IDs yet
  userName: string; // For simplicity for now
  date: string; // ISO Date string
  text: string;
}

export interface BaseEntity {
  id: string;
  name: string;
  entityType: EntityType;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation?: GeoLocation; // Made optional as it might not be set immediately
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface Dealer extends BaseEntity {
  entityType: 'dealer';
  phone?: string;
  fax?: string; // Added
  email?: string;
  website?: string;
  contactPerson?: string;
  servicesOffered?: string[]; // e.g., Vente, Réparation, Entretien
  tractorBrands?: string[]; // Marques de tracteurs que le concessionnaire représente
  machineTypes?: string[]; // Types de machines agricoles gérées/vendues (e.g., Tracteurs, Moissonneuses)
  prospectionStatus?: 'hot' | 'warm' | 'cold' | 'none' | 'converted' | 'lost'; // Expanded
  comments?: Comment[];
  galleryUris?: string[]; // URLs for images
  documentUris?: string[]; // URLs for documents
  // relatedClientIds?: string[]; // Clients are now part of MethanisationSite or linked through it
  relatedProspectIds?: string[]; // If you track prospects separately
  relatedSiteIds?: string[]; // IDs of MethanisationSite entities
  department?: string; // Added: Département
  brandSign?: string; // Added: Enseigne
  branchName?: string; // Added: Succursale (si applicable, sinon nom principal)
}

// Client is removed as a top-level standalone entity for now. 
// Client-like info will be part of MethanisationSite or linked through other means.

export interface LoadixUnit extends BaseEntity {
  entityType: 'loadix-unit';
  serialNumber: string;
  model: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string; // ISO Date string
  purchaseDate?: string; // ISO Date string
  // linkedClientId?: string; // To link to a client/site that owns/uses it
  linkedSiteId?: string; // ID of the MethanisationSite it's associated with
  dealerId?: string; // Dealer who sold/maintains it
}

export interface MethanisationSiteClient { // Defines structure for clients associated with a site
    name: string; 
    contactEmail?: string; 
    contactPhone?: string;
    // Add other client-specific fields here if needed
}

export interface MethanisationSite extends BaseEntity {
  entityType: 'methanisation-site';
  capacity?: string; // e.g., "1000 tons/year"
  operator?: string;
  startDate?: string; // ISO Date string
  siteClients?: MethanisationSiteClient[]; 
}

// Union type for any entity, can be expanded
export type AppEntity = Dealer | LoadixUnit | MethanisationSite;

// For creating a new dealer - ensure this matches the form fields and expected data structure
export interface NewDealerData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  department?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  brandSign?: string; // Enseigne
  branchName?: string; // Succursale
  machineTypes?: string[]; 
  tractorBrands?: string[];
  prospectionStatus?: 'hot' | 'warm' | 'cold' | 'none' | 'converted' | 'lost';
  comments?: Comment[]; // For initial comments
  geoLocation?: GeoLocation;
  // Optional fields that might not be part of initial creation but part of Dealer type
  servicesOffered?: string[];
  galleryUris?: string[];
  documentUris?: string[];
  relatedProspectIds?: string[];
  relatedSiteIds?: string[];
}

// For updating an existing dealer
export type UpdateDealerData = Partial<NewDealerData>; // Can be more specific if needed
