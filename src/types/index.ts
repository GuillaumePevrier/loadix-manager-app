
export interface GeoLocation {
  lat: number;
  lng: number;
}

export type EntityType = 'dealer' | 'loadix-unit' | 'methanisation-site';

export interface Comment {
  userName: string;
  date: string; // ISO Date string
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface BaseEntity {
  id: string;
  name: string;
  entityType: EntityType;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation?: GeoLocation;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface Dealer extends BaseEntity {
  entityType: 'dealer';
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  servicesOffered?: string[];
  tractorBrands?: string[]; // Array of brand values/keys
  machineTypes?: string[]; // Array of machine type values/keys
  prospectionStatus?: 'hot' | 'warm' | 'cold' | 'none' | 'converted' | 'lost';
  comments?: Comment[];
  galleryUris?: string[];
  documentUris?: string[];
  relatedProspectIds?: string[];
  relatedSiteIds?: string[];
  department?: string;
  brandSign?: string;
  branchName?: string;
}

export interface LoadixUnit extends BaseEntity {
  entityType: 'loadix-unit';
  serialNumber: string;
  model: string; 
  status: 'active' | 'maintenance' | 'inactive' | 'in_stock' | 'sold';
  purchaseDate?: string; 
  lastMaintenanceDate?: string; 
  dealerId?: string; 
  methanisationSiteId?: string; 
}

export interface MethanisationSiteClient {
    name: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface MethanisationSite extends BaseEntity {
  entityType: 'methanisation-site';
  capacity?: string; 
  operator?: string; 
  startDate?: string; 
  siteClients?: MethanisationSiteClient[]; 
  technologies?: string[]; 
  relatedDealerIds?: string[]; 
}

export type AppEntity = Dealer | LoadixUnit | MethanisationSite;

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
  brandSign?: string;
  branchName?: string;
  machineTypes: string[]; 
  tractorBrands: string[]; 
  prospectionStatus?: Dealer['prospectionStatus'];
  initialCommentText?: string;
  comments?: Comment[]; 
  geoLocation?: GeoLocation;
  servicesOffered?: string[];
  galleryUris?: string[];
  documentUris?: string[];
  relatedProspectIds?: string[];
  relatedSiteIds?: string[];
}

export type UpdateDealerData = Partial<Omit<NewDealerData, 'initialCommentText'>>;


export interface NewLoadixUnitData {
  name: string;
  serialNumber: string;
  model: string;
  status: LoadixUnit['status'];
  address: string; 
  city: string;
  postalCode: string;
  country: string;
  geoLocation?: GeoLocation;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  dealerId?: string;
  methanisationSiteId?: string;
}
export type UpdateLoadixUnitData = Partial<NewLoadixUnitData>;

export interface NewMethanisationSiteData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation?: GeoLocation;
  capacity?: string;
  operator?: string;
  startDate?: string;
}
export type UpdateMethanisationSiteData = Partial<NewMethanisationSiteData>;

// Options for MultiSelect components
export const TRACTOR_BRAND_OPTIONS = [
  { value: "john_deere", label: "John Deere" },
  { value: "case_ih", label: "Case IH" },
  { value: "new_holland", label: "New Holland" },
  { value: "fendt", label: "Fendt" },
  { value: "massey_ferguson", label: "Massey Ferguson" },
  { value: "claas", label: "Claas" },
  { value: "valtra", label: "Valtra" },
  { value: "deutz_fahr", label: "Deutz-Fahr" },
  { value: "kubota", label: "Kubota" },
  { value: "mc_cormick", label: "McCormick" },
  { value: "landini", label: "Landini" },
  { value: "same", label: "SAME" },
  // Add more as needed
];

export const MACHINE_TYPE_OPTIONS = [
  { value: "tractor", label: "Tracteurs" },
  { value: "combine_harvester", label: "Moissonneuses-batteuses" },
  { value: "loader", label: "Chargeurs" },
  { value: "forage_harvester", label: "Ensileuses" },
  { value: "baler", label: "Ramasseuses-presses" },
  { value: "beet_harvester", label: "Récolteuses de betteraves" },
  { value: "milking_machine", label: "Machines à traire" },
  { value: "grape_harvester", label: "Machines à Vendanger" },
  { value: "planter_seeder", label: "Semoirs et Planteuses" },
  { value: "sprayer", label: "Pulvérisateurs" },
  { value: "tillage_equipment", label: "Matériel de travail du sol" },
  // Add more as needed
];
