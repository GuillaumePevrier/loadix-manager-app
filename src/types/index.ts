
export interface GeoLocation {
  lat: number;
  lng: number;
}

export type EntityType = 'dealer' | 'client' | 'loadix-unit' | 'methanisation-site';

export interface BaseEntity {
  id: string;
  name: string;
  entityType: EntityType;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation: GeoLocation;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface Dealer extends BaseEntity {
  entityType: 'dealer';
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  servicesOffered?: string[];
}

export interface Client extends BaseEntity {
  entityType: 'client';
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
}

export interface LoadixUnit extends BaseEntity {
  entityType: 'loadix-unit';
  serialNumber: string;
  model: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenanceDate?: string; // ISO Date string
  purchaseDate?: string; // ISO Date string
}

export interface MethanisationSite extends BaseEntity {
  entityType: 'methanisation-site';
  capacity?: string; // e.g., "1000 tons/year"
  operator?: string;
  startDate?: string; // ISO Date string
}

// Union type for any entity, can be expanded
export type AppEntity = Dealer | Client | LoadixUnit | MethanisationSite;
