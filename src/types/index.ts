
import { z } from 'zod';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export type EntityType = 'dealer' | 'loadix-unit' | 'methanisation-site';

export interface Comment {
  userName: string;
  date: string | { seconds: number; nanoseconds: number }; // ISO Date string or Firestore Timestamp
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
  // region?: string; // Future field
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
  status: 'active' | 'maintenance' | 'inactive' | 'in_stock' | 'sold';
  startDate?: string; 
 legalType: string; // Type juridique
 siretSiren: string; // SIRET / SIREN
 mainContact: string; // Contact principal
  siteClients?: MethanisationSiteClient[]; 
 department: string; // Département
 phone: string; // Téléphone
 email: string; // Email
 website: string; // Site internet
 urbanOrRuralArea: string; // Zone urbaine / rurale
 proximityToStepIsdnd: string; // Proximité STEP / ISDND
 projectType: string; // Type de projet
 valorizationType: string; // Type de valorisation
 icpeStatus: string; // Statut ICPE
 icpeRegime: string; // Régime ICPE en vigueur
 mainIntrantsType: string; // Type d’intrants principaux
 majorityAgriculturalCapital: boolean; // Capitaux Agricoles majoritaires
 legalStructure: string; // Montage juridique
 authorizedVolume: string; // Volume autorisé
 installedElectricalPower: string; // Puissance électrique installée
 installedThermalPower: string; // Puissance thermique installée
 maxBiomethaneFlow: string; // Débit maximal de biométhane
 estimatedAnnualProduction: string; // Production annuelle estimée 
 commissioningYear: number; // Année de mise en service
 boilerMotorType: string; // Type de chaudière / moteur
 operatingHours: number; // Nombre d'heures de fonctionnement
 icpeFileNumber: string; // Numéro du dossier ICPE
 prefecturalDecree: string; // Arrêté préfectural
  prospectionStatus?: 'hot' | 'warm' | 'cold' | 'none' | 'converted' | 'lost';
  comments?: Comment[];
 publicConsultationLink: string; // Consultation publique (lien)
  source?: string; // Source (externe)
 publicSubsidies: string; // Subventions publiques reçues
  notes?: string;
 drealInspection: string; // Inspection DREAL / anomalies
 operationalStatus: string; // État de fonctionnement
 extensionProjects: string; // Projets d’extension
 incidentHistory: string; // Historique incidents
 publicOpinion: string; // Avis du public / voisins
  technologies?: string[]; 
 relatedDealerIds?: string[];
  // region?: string; // Future field
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
export const TRACTOR_BRAND_OPTIONS: { value: string; label: string }[] = [
  { value: "john_deere", label: "John Deere" },
  { value: "case_ih", label: "Case IH" },
  { value: "new_holland", label: "New Holland" },
  { value: "fendt", label: "Fendt" },
  { value: "valtra", label: "Valtra" },
  { value: "vicon", label: "Vicon" },
  { value: "lindner", label: "Lindner" },
  { value: "manitou", label: "Manitou" },
  { value: "dieci", label: "Dieci" },
  { value: "jcb", label: "JCB" },
  { value: "krone", label: "Krone" },
  { value: "kioti", label: "Kioti" },
  { value: "delaval", label: "DeLaval" },
  { value: "kramer", label: "Kramer" },
  { value: "kuhn", label: "Kuhn" },
  { value: "massey_ferguson", label: "Massey Ferguson" },
  { value: "claas", label: "Claas" },
  { value: "deutz_fahr", label: "Deutz-Fahr" },
  { value: "supertino", label: "Supertino" },
  { value: "merlo", label: "Merlo" },
  { value: "maschio", label: "Maschio" },
  { value: "bobcat", label: "Bobcat" },
  { value: "pfanzelt", label: "Pfanzelt" },
  { value: "zetor", label: "Zetor" },
  { value: "giant", label: "Giant" },
  { value: "weidemann", label: "Weidemann" },
  { value: "kubota", label: "Kubota" },
  { value: "mc_cormick", label: "McCormick" },
  { value: "landini", label: "Landini" },
  { value: "same", label: "SAME" },
];

export const MACHINE_TYPE_OPTIONS: { value: string; label: string }[] = [
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

export const LOADIX_STATUS_OPTIONS: { value: LoadixUnit['status']; label: string }[] = [
  { value: 'active', label: 'Actif' },
  { value: 'maintenance', label: 'En Maintenance' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_stock', label: 'En Stock (Neuf)' },
  { value: 'sold', label: 'Vendu (Occasion)' },
];

export const LOADIX_MODEL_OPTIONS: { value: string; label: string }[] = [
    { value: 'LOADIX Pro v1', label: 'LOADIX Pro v1' },
    { value: 'LOADIX Pro v2', label: 'LOADIX Pro v2' },
    { value: 'LOADIX Compact', label: 'LOADIX Compact' },
    { value: 'LOADIX HD', label: 'LOADIX HD' },
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
 legalType: z.string().optional().default(''),
 siretSiren: z.string().optional().default(''),
 mainContact: z.string().optional().default(''),
 department: z.string().optional().default(''),
 phone: z.string().optional().default(''),
 email: z.string().optional().default(''),
 website: z.string().optional().default(''),
 urbanOrRuralArea: z.string().optional().default(''),
 proximityToStepIsdnd: z.string().optional().default(''),
 projectType: z.string().optional().default(''),
 valorizationType: z.string().optional().default(''),
 icpeStatus: z.string().optional().default(''),
 icpeRegime: z.string().optional().default(''),
 mainIntrantsType: z.string().optional().default(''),
 majorityAgriculturalCapital: z.boolean().optional().default(false),
 legalStructure: z.string().optional().default(''),
 authorizedVolume: z.string().optional().default(''),
 installedElectricalPower: z.string().optional().default(''),
 installedThermalPower: z.string().optional().default(''),
 maxBiomethaneFlow: z.string().optional().default(''),
 estimatedAnnualProduction: z.string().optional().default(''),
 commissioningYear: z.number().optional(),
 boilerMotorType: z.string().optional().default(''),
 operatingHours: z.number().optional(),
  prospectionStatus: z.enum(['hot', 'warm', 'cold', 'none', 'converted', 'lost']).optional().default('none'),
  comments: z.array(z.any()).optional().default([]), // Using z.any() for comments in import schema, actual type validation should happen elsewhere if needed
 relatedDealerIds: toArrayOfStrings('relatedDealerIds'),
});
export type MethanisationSiteImportSchema = z.infer<typeof MethanisationSiteImportSchemaZod>;

    
