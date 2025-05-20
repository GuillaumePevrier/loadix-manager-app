
'use server';

import { db, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, Timestamp, GeoPoint } from 'firebase/firestore';
import Papa from 'papaparse';
import type { EntityType, NewDealerData, NewLoadixUnitData, NewMethanisationSiteData, DealerImportSchema, LoadixUnitImportSchema, MethanisationSiteImportSchema } from '@/types';
import { DealerImportSchemaZod, LoadixUnitImportSchemaZod, MethanisationSiteImportSchemaZod } from '@/types'; // Assuming Zod schemas are also exported from types

export interface ImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  importedCount: number;
  errorCount: number;
  errorsDetail: { rowIndex: number; message: string; rowData: string[] }[];
}

// Helper to convert multi-value strings (e.g., "val1;val2") to string[]
function parseMultiValueString(value: string | undefined | null): string[] {
  if (!value) return [];
  return value.split(';').map(s => s.trim()).filter(Boolean);
}

export async function importEntitiesFromCSV(csvData: string, entityType: EntityType): Promise<ImportResult> {
  if (!firebaseConfigPresent || !db) {
    return {
      success: false,
      message: "Configuration Firebase incomplète. Importation annulée.",
      totalRows: 0, importedCount: 0, errorCount: 0, errorsDetail: []
    };
  }

  const result: ImportResult = {
    success: true,
    message: "Importation terminée.",
    totalRows: 0,
    importedCount: 0,
    errorCount: 0,
    errorsDetail: [],
  };

  try {
    const parseResult = Papa.parse<Record<string, string>>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
    });

    result.totalRows = parseResult.data.length;
    if (parseResult.errors.length > 0) {
        parseResult.errors.forEach(err => {
            result.errorsDetail.push({ 
                rowIndex: err.row ?? -1, 
                message: `Erreur de parsing CSV: ${err.message}`, 
                rowData: parseResult.data[err.row ?? -1] ? Object.values(parseResult.data[err.row ?? -1]) : []
            });
            result.errorCount++;
        });
    }
    
    const validRows: any[] = [];

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      let validatedData;
      let schema;

      try {
        switch (entityType) {
          case 'dealer':
            schema = DealerImportSchemaZod;
            // Prepare data for Zod (handle multi-value fields before validation if Zod doesn't transform them)
             const dealerRowForZod = {
              ...row,
              tractorBrands: row.tractorBrands, // Keep as string for Zod transform
              machineTypes: row.machineTypes,   // Keep as string for Zod transform
            };
            validatedData = schema.parse(dealerRowForZod) as DealerImportSchema;
            break;
          case 'loadix-unit':
            schema = LoadixUnitImportSchemaZod;
            validatedData = schema.parse(row) as LoadixUnitImportSchema;
            break;
          case 'methanisation-site':
            schema = MethanisationSiteImportSchemaZod;
            validatedData = schema.parse(row) as MethanisationSiteImportSchema;
            break;
          default:
            throw new Error(`Type d'entité inconnu pour l'import: ${entityType}`);
        }
        validRows.push(validatedData);
      } catch (error: any) {
        result.errorCount++;
        let errorMessage = "Erreur de validation des données.";
        if (error.errors && Array.isArray(error.errors)) { // Zod errors
          errorMessage = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        result.errorsDetail.push({ rowIndex: i + 1, message: errorMessage, rowData: Object.values(row) });
      }
    }

    if (validRows.length > 0) {
      const batch = writeBatch(db);
      let collectionName = '';

      switch (entityType) {
        case 'dealer': collectionName = 'dealers'; break;
        case 'loadix-unit': collectionName = 'loadixUnits'; break;
        case 'methanisation-site': collectionName = 'methanisationSites'; break;
      }
      const collectionRef = collection(db, collectionName);

      validRows.forEach(data => {
        const docRef = doc(collectionRef); // Auto-generate ID
        const dataToSave: any = {
          ...data,
          entityType, // ensure entityType is set
          // GeoLocation is explicitly ignored for bulk import for now
          geoLocation: null, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (entityType === 'dealer') {
          const dealerData = data as DealerImportSchema;
          // tractorBrands & machineTypes are already string[] due to Zod transform
          dataToSave.tractorBrands = dealerData.tractorBrands;
          dataToSave.machineTypes = dealerData.machineTypes;
          dataToSave.comments = dealerData.initialCommentText
            ? [{
                userName: 'Import en Masse',
                date: Timestamp.now(),
                text: dealerData.initialCommentText,
                prospectionStatusAtEvent: dealerData.prospectionStatus
              }]
            : [];
          delete dataToSave.initialCommentText;
        }

        if (entityType === 'loadix-unit') {
            const unitData = data as LoadixUnitImportSchema;
            if (unitData.purchaseDate) dataToSave.purchaseDate = Timestamp.fromDate(new Date(unitData.purchaseDate));
            else delete dataToSave.purchaseDate;
            if (unitData.lastMaintenanceDate) dataToSave.lastMaintenanceDate = Timestamp.fromDate(new Date(unitData.lastMaintenanceDate));
            else delete dataToSave.lastMaintenanceDate;
        }

        if (entityType === 'methanisation-site') {
            const siteData = data as MethanisationSiteImportSchema;
            if (siteData.startDate) dataToSave.startDate = Timestamp.fromDate(new Date(siteData.startDate));
            else delete dataToSave.startDate;
             // Ensure array fields are initialized if not provided or empty after parsing
            dataToSave.siteClients = []; // Not handled in CSV import for now
            dataToSave.technologies = []; // Not handled in CSV import for now
            dataToSave.relatedDealerIds = []; // Not handled in CSV import for now
        }
        
        batch.set(docRef, dataToSave);
        result.importedCount++;
      });
      await batch.commit();
    }

    if (result.errorCount > 0) {
      result.success = false;
      result.message = `Importation terminée avec ${result.errorCount} erreur(s) sur ${result.totalRows} lignes.`;
    } else if (result.importedCount === 0 && result.totalRows > 0) {
        result.success = false;
        result.message = "Aucune ligne valide n'a été trouvée pour l'importation.";
    } else if (result.importedCount === 0 && result.totalRows === 0) {
        result.success = false;
        result.message = "Le fichier CSV est vide ou ne contient pas de données après les en-têtes.";
    }


  } catch (error: any) {
    console.error("Erreur majeure lors de l'importation CSV:", error);
    result.success = false;
    result.message = error.message || "Une erreur serveur est survenue lors de l'importation.";
    // It's possible all rows failed at a higher level, so update counts if they weren't already
    if (result.totalRows > 0 && result.errorCount === 0 && result.importedCount === 0) {
        result.errorCount = result.totalRows;
    }
  }
  return result;
}

// Need to import doc from 'firebase/firestore'
import { doc } from 'firebase/firestore';
