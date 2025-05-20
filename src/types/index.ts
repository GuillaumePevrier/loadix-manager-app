
import { z } from 'zod';

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
  prospectionStatusAtEvent?: Dealer['prospectionStatus'];
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
  siteClients?: MethanisationSiteClient[];
  technologies?: string[];
  relatedDealerIds?: string[];
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
];

// Zod Schemas for CSV Import Validation

const toArrayOfStrings = (fieldName: string) => z.string().optional().transform(val => 
  val ? val.split(';').map(s => s.trim()).filter(Boolean) : []
);

const toOptionalDate = (fieldName: string) => z.string().optional().transform((val, ctx) => {
  if (!val || val.trim() === '') return undefined;
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date,
      message: `Invalid date format for ${fieldName}. Expected YYYY-MM-DD.`,
    });
    return z.NEVER;
  }
  return date.toISOString(); // Store as ISO string, convert to Timestamp in service
});

export const DealerImportSchemaZod = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  city: z.string().min(1, { message: "La ville est requise." }),
  postalCode: z.string().min(1, { message: "Le code postal est requis." }),
  country: z.string().min(1, { message: "Le pays est requis." }),
  department: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email({ message: "Format d'email invalide." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Format d'URL invalide." }).optional().or(z.literal('')),
  contactPerson: z.string().optional(),
  brandSign: z.string().optional(),
  branchName: z.string().optional(),
  tractorBrands: toArrayOfStrings('tractorBrands'),
  machineTypes: toArrayOfStrings('machineTypes'),
  prospectionStatus: z.enum(['hot', 'warm', 'cold', 'none', 'converted', 'lost']).optional().default('none'),
  initialCommentText: z.string().optional(),
});
export type DealerImportSchema = z.infer<typeof DealerImportSchemaZod>;

export const LoadixUnitImportSchemaZod = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  serialNumber: z.string().min(1, { message: "Le numéro de série est requis." }),
  model: z.string().min(1, { message: "Le modèle est requis." }),
  status: z.enum(['active', 'maintenance', 'inactive', 'in_stock', 'sold']),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  city: z.string().min(1, { message: "La ville est requise." }),
  postalCode: z.string().min(1, { message: "Le code postal est requis." }),
  country: z.string().min(1, { message: "Le pays est requis." }),
  purchaseDate: toOptionalDate('purchaseDate'),
  lastMaintenanceDate: toOptionalDate('lastMaintenanceDate'),
  dealerId: z.string().optional(),
  methanisationSiteId: z.string().optional(),
});
export type LoadixUnitImportSchema = z.infer<typeof LoadixUnitImportSchemaZod>;

export const MethanisationSiteImportSchemaZod = z.object({
  name: z.string().min(1, { message: "Le nom est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  city: z.string().min(1, { message: "La ville est requise." }),
  postalCode: z.string().min(1, { message: "Le code postal est requis." }),
  country: z.string().min(1, { message: "Le pays est requis." }),
  capacity: z.string().optional(),
  operator: z.string().optional(),
  startDate: toOptionalDate('startDate'),
});
export type MethanisationSiteImportSchema = z.infer<typeof MethanisationSiteImportSchemaZod>;

    