
'use server';

import { db, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import { collection, writeBatch, serverTimestamp, Timestamp, GeoPoint, doc } from 'firebase/firestore';
import Papa from 'papaparse';
import type { EntityType, NewDealerData, NewLoadixUnitData, NewMethanisationSiteData, DealerImportSchema, LoadixUnitImportSchema, MethanisationSiteImportSchema } from '@/types';
import { DealerImportSchemaZod, LoadixUnitImportSchemaZod, MethanisationSiteImportSchemaZod } from '@/types';

export interface ImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  importedCount: number;
  errorCount: number;
  errorsDetail: { rowIndex: number; message: string; rowData: Record<string, string> }[];
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
            if (err.row !== undefined) { // Check if err.row is defined
                 result.errorsDetail.push({ 
                    rowIndex: err.row, 
                    message: `Erreur de parsing CSV: ${err.message}`, 
                    rowData: parseResult.data[err.row] ? parseResult.data[err.row] : {}
                });
            } else {
                 result.errorsDetail.push({ 
                    rowIndex: -1, // Indicate an error not tied to a specific row
                    message: `Erreur de parsing CSV (non liée à une ligne spécifique): ${err.message}`, 
                    rowData: {}
                });
            }
            result.errorCount++;
        });
    }
    
    const validRows: any[] = [];

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      let validatedData;
      let schema;

      try {
        let dataForZod = { ...row };
        switch (entityType) {
          case 'dealer':
            schema = DealerImportSchemaZod;
            // Zod transform handles tractorBrands and machineTypes from string to string[]
            validatedData = schema.parse(dataForZod) as DealerImportSchema;
            break;
          case 'loadix-unit':
            schema = LoadixUnitImportSchemaZod;
            validatedData = schema.parse(dataForZod) as LoadixUnitImportSchema;
            break;
          case 'methanisation-site':
            schema = MethanisationSiteImportSchemaZod;
            validatedData = schema.parse(dataForZod) as MethanisationSiteImportSchema;
            break;
          default:
            throw new Error(`Type d'entité inconnu pour l'import: ${entityType}`);
        }
        validRows.push(validatedData);
      } catch (error: any) {
        result.errorCount++;
        let errorMessage = "Erreur de validation des données.";
        if (error.errors && Array.isArray(error.errors)) { 
          errorMessage = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; ');
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        result.errorsDetail.push({ rowIndex: i + 1, message: errorMessage, rowData: row });
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
        const newDocRef = doc(collectionRef); 
        const dataToSave: any = {
          ...data,
          id: newDocRef.id, // Store the auto-generated ID within the document
          entityType,
          geoLocation: null, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (entityType === 'dealer') {
          const dealerData = data as DealerImportSchema;
          dataToSave.tractorBrands = dealerData.tractorBrands; // Already string[] from Zod
          dataToSave.machineTypes = dealerData.machineTypes;   // Already string[] from Zod
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
            else delete dataToSave.purchaseDate; // Remove if empty or invalid
            if (unitData.lastMaintenanceDate) dataToSave.lastMaintenanceDate = Timestamp.fromDate(new Date(unitData.lastMaintenanceDate));
            else delete dataToSave.lastMaintenanceDate;
        }

        if (entityType === 'methanisation-site') {
            const siteData = data as MethanisationSiteImportSchema;
            if (siteData.startDate) dataToSave.startDate = Timestamp.fromDate(new Date(siteData.startDate));
            else delete dataToSave.startDate;
            dataToSave.siteClients = []; 
            dataToSave.technologies = []; 
            dataToSave.relatedDealerIds = []; 
        }
        
        batch.set(newDocRef, dataToSave);
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
    if (result.totalRows > 0 && result.errorCount === 0 && result.importedCount === 0) {
        result.errorCount = result.totalRows;
    }
  }
  return result;
}
