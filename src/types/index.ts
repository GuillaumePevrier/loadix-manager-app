
export interface GeoLocation {
  lat: number;
  lng: number;
}

// EntityType updated to include all relevant types
export type EntityType = 'dealer' | 'loadix-unit' | 'methanisation-site';

export interface Comment {
  userName: string;
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
  tractorBrands?: string[];
  machineTypes?: string[];
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
  model: string; // e.g., LOADIX Pro v2, LOADIX Compact
  status: 'active' | 'maintenance' | 'inactive' | 'in_stock' | 'sold';
  purchaseDate?: string; // ISO Date string
  lastMaintenanceDate?: string; // ISO Date string
  dealerId?: string; // ID of the dealer who sold/maintains it
  methanisationSiteId?: string; // ID of the MethanisationSite it's associated with (owner/operator)
  // Add other LoadixUnit specific fields here: hours_of_operation, firmware_version, etc.
}

export interface MethanisationSiteClient {
    name: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface MethanisationSite extends BaseEntity {
  entityType: 'methanisation-site';
  capacity?: string; // e.g., "5000 tons/year", "250 kW"
  operator?: string; // Name of the operating company or individual
  startDate?: string; // ISO Date string of when the site became operational
  siteClients?: MethanisationSiteClient[]; // List of clients/farms supplying the site
  technologies?: string[]; // e.g., "Infinitely
  relatedDealerIds?: string[]; // Dealers involved with equipment at this site
  // Add other MethanisationSite specific fields here: feedstock_types, energy_output_type etc.
}

export type AppEntity = Dealer | LoadixUnit | MethanisationSite;

// Data for Creating Entities
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
  machineTypes?: string[];
  tractorBrands?: string[];
  prospectionStatus?: Dealer['prospectionStatus'];
  initialCommentText?: string; // Renamed from comments to avoid confusion with Comment[]
  comments?: Comment[]; // For initial comments if structured
  geoLocation?: GeoLocation;
  servicesOffered?: string[];
  galleryUris?: string[];
  documentUris?: string[];
  relatedProspectIds?: string[];
  relatedSiteIds?: string[];
}
export type UpdateDealerData = Partial<NewDealerData>;


export interface NewLoadixUnitData {
  name: string;
  serialNumber: string;
  model: string;
  status: LoadixUnit['status'];
  address: string; // Location address
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
  // siteClients?: MethanisationSiteClient[]; // Simplified for form
  // technologies?: string[]; // Simplified for form
  // relatedDealerIds?: string[]; // Simplified for form
}
export type UpdateMethanisationSiteData = Partial<NewMethanisationSiteData>;
