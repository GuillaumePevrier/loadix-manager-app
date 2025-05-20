
// src/services/dealerService.ts
'use server';

import { db, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import type { Dealer, GeoLocation, NewDealerData, UpdateDealerData, Comment, LoadixUnit, NewLoadixUnitData, MethanisationSite, NewMethanisationSiteData, AppEntity } from '@/types';
import { collection, getDocs, doc, getDoc, Timestamp, GeoPoint, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to convert Firestore document data to Dealer type
const mapDocToDealer = (docId: string, data: any): Dealer => {
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();

  let geoLocation: GeoLocation | undefined = undefined;
  if (data.geoLocation instanceof GeoPoint) {
    geoLocation = { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude };
  } else if (data.geoLocation && typeof data.geoLocation.lat === 'number' && typeof data.geoLocation.lng === 'number') {
    geoLocation = data.geoLocation;
  }

  const comments = Array.isArray(data.comments) ? data.comments.map((comment: any) => ({
    ...comment,
    date: comment.date instanceof Timestamp ? comment.date.toDate().toISOString() : (comment.date || new Date().toISOString()),
    userName: comment.userName || 'Unknown User',
    text: comment.text || '',
  })) : [];


  return {
    id: docId,
    name: data.name || '',
    entityType: 'dealer',
    address: data.address || '',
    city: data.city || '',
    postalCode: data.postalCode || '',
    country: data.country || '',
    department: data.department || '',
    phone: data.phone || '',
    fax: data.fax || '',
    email: data.email || '',
    website: data.website || '',
    contactPerson: data.contactPerson || '',
    brandSign: data.brandSign || '',
    branchName: data.branchName || '',
    servicesOffered: Array.isArray(data.servicesOffered) ? data.servicesOffered : [],
    tractorBrands: Array.isArray(data.tractorBrands) ? data.tractorBrands : [],
    machineTypes: Array.isArray(data.machineTypes) ? data.machineTypes : [],
    prospectionStatus: data.prospectionStatus || 'none',
    comments: comments,
    galleryUris: Array.isArray(data.galleryUris) ? data.galleryUris : [],
    documentUris: Array.isArray(data.documentUris) ? data.documentUris : [],
    relatedProspectIds: Array.isArray(data.relatedProspectIds) ? data.relatedProspectIds : [],
    relatedSiteIds: Array.isArray(data.relatedSiteIds) ? data.relatedSiteIds : [],
    geoLocation,
    createdAt,
    updatedAt,
  };
};

// Helper to convert Firestore document data to LoadixUnit
const mapDocToLoadixUnit = (docId: string, data: any): LoadixUnit => {
    return {
        id: docId,
        name: data.name || '',
        entityType: 'loadix-unit',
        serialNumber: data.serialNumber || '',
        model: data.model || '',
        status: data.status || 'inactive',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        geoLocation: data.geoLocation instanceof GeoPoint ? { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude } : data.geoLocation,
        purchaseDate: data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate().toISOString() : data.purchaseDate,
        lastMaintenanceDate: data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate().toISOString() : data.lastMaintenanceDate,
        dealerId: data.dealerId,
        methanisationSiteId: data.methanisationSiteId,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
};

// Helper to convert Firestore document data to MethanisationSite
const mapDocToMethanisationSite = (docId: string, data: any): MethanisationSite => {
    return {
        id: docId,
        name: data.name || '',
        entityType: 'methanisation-site',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        geoLocation: data.geoLocation instanceof GeoPoint ? { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude } : data.geoLocation,
        capacity: data.capacity,
        operator: data.operator,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
        siteClients: Array.isArray(data.siteClients) ? data.siteClients : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        relatedDealerIds: Array.isArray(data.relatedDealerIds) ? data.relatedDealerIds : [],
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
    };
};


export async function getDealers(): Promise<Dealer[]> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Returning empty dealer list.");
    return [];
  }
  try {
    const dealersCol = collection(db, 'dealers');
    const dealerSnapshot = await getDocs(dealersCol);
    const dealerList = dealerSnapshot.docs.map(docSnap => mapDocToDealer(docSnap.id, docSnap.data()));
    return dealerList;
  } catch (error) {
    console.error("Error fetching dealers from Firestore:", error);
    return [];
  }
}

export async function getDealerById(id: string): Promise<Dealer | null> {
   if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot fetch dealer.");
    return null;
  }
  try {
    const dealerRef = doc(db, 'dealers', id);
    const dealerDocSnap = await getDoc(dealerRef);

    if (!dealerDocSnap.exists()) {
      console.log(`No dealer found with ID: ${id}`);
      return null;
    }
    return mapDocToDealer(dealerDocSnap.id, dealerDocSnap.data());
  } catch (error) {
    console.error(`Error fetching dealer with ID ${id} from Firestore:`, error);
    return null;
  }
}

export async function addDealer(dealerData: NewDealerData): Promise<Dealer | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot add dealer.");
    throw new Error("Firebase not configured.");
  }
  try {
    const dealersCol = collection(db, 'dealers');

    const dataToSave: any = {
      ...dealerData,
      entityType: 'dealer',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (dealerData.geoLocation) {
      dataToSave.geoLocation = new GeoPoint(dealerData.geoLocation.lat, dealerData.geoLocation.lng);
    } else {
      dataToSave.geoLocation = null;
    }

    // Handle initialCommentText to comments array
    if (dealerData.initialCommentText && dealerData.initialCommentText.trim() !== '') {
        dataToSave.comments = [{
            userName: 'Admin ManuRob', // Placeholder
            date: Timestamp.now(), // Use Firestore Timestamp for new comment
            text: dealerData.initialCommentText.trim(),
        }];
    } else {
        dataToSave.comments = [];
    }
    delete dataToSave.initialCommentText; // Remove temporary field


    const arrayFields: (keyof NewDealerData)[] = ['servicesOffered', 'tractorBrands', 'machineTypes', 'galleryUris', 'documentUris', 'relatedProspectIds', 'relatedSiteIds'];
    arrayFields.forEach(field => {
        if (!dataToSave[field]) {
            dataToSave[field] = [];
        }
    });

    const docRef = await addDoc(dealersCol, dataToSave);
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
      return mapDocToDealer(newDocSnap.id, newDocSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error adding dealer to Firestore:", error);
    throw error;
  }
}

export async function updateDealer(id: string, dataToUpdate: UpdateDealerData): Promise<Dealer | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot update dealer.");
    throw new Error("Firebase not configured.");
  }
  try {
    const dealerRef = doc(db, 'dealers', id);

    const updatePayload: any = {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
    };

    if (dataToUpdate.geoLocation) {
      updatePayload.geoLocation = new GeoPoint(dataToUpdate.geoLocation.lat, dataToUpdate.geoLocation.lng);
    } else if (dataToUpdate.hasOwnProperty('geoLocation') && dataToUpdate.geoLocation === undefined) {
      updatePayload.geoLocation = null;
    }
    
    // Handle comments - this might need more complex logic if adding/editing individual comments
    if (dataToUpdate.comments) {
      updatePayload.comments = dataToUpdate.comments.map(comment => ({
        ...comment,
        date: typeof comment.date === 'string' ? Timestamp.fromDate(new Date(comment.date)) : comment.date,
      }));
    }
    if (dataToUpdate.hasOwnProperty('initialCommentText')) {
        delete updatePayload.initialCommentText;
    }


    await updateDoc(dealerRef, updatePayload);
    const updatedDocSnap = await getDoc(dealerRef);
    if (updatedDocSnap.exists()) {
      return mapDocToDealer(updatedDocSnap.id, updatedDocSnap.data());
    }
    return null;
  } catch (error) {
    console.error(`Error updating dealer with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteDealer(id: string): Promise<void> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot delete dealer.");
    throw new Error("Firebase not configured.");
  }
  try {
    await deleteDoc(doc(db, 'dealers', id));
  } catch (error) {
    console.error(`Error deleting dealer with ID ${id} from Firestore:`, error);
    throw error;
  }
}

// --- Placeholder functions for LoadixUnit and MethanisationSite ---
// These will be expanded to interact with Firestore in a future step.

export async function addLoadixUnit(unitData: NewLoadixUnitData): Promise<LoadixUnit | null> {
  console.log("Simulating addLoadixUnit:", unitData);
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot add Loadix Unit.");
    throw new Error("Firebase not configured.");
  }
  // Simulate Firestore add
  const mockId = `unit-${Date.now()}`;
  const now = new Date().toISOString();
  const newUnit: LoadixUnit = {
    ...unitData,
    id: mockId,
    entityType: 'loadix-unit',
    createdAt: now,
    updatedAt: now,
  };
  // For now, add to mock data if you want it to appear in lists immediately
  // import { allMockEntities, mockLoadixUnits } from '@/lib/mock-data'; // This would cause circular dependency here
  // mockLoadixUnits.push(newUnit);
  // allMockEntities.push(newUnit);
  return newUnit;
}

export async function addMethanisationSite(siteData: NewMethanisationSiteData): Promise<MethanisationSite | null> {
  console.log("Simulating addMethanisationSite:", siteData);
   if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot add Methanisation Site.");
    throw new Error("Firebase not configured.");
  }
  // Simulate Firestore add
  const mockId = `site-${Date.now()}`;
  const now = new Date().toISOString();
  const newSite: MethanisationSite = {
    ...siteData,
    id: mockId,
    entityType: 'methanisation-site',
    siteClients: [], // Initialize if not part of form
    technologies: [], // Initialize
    relatedDealerIds: [], // Initialize
    createdAt: now,
    updatedAt: now,
  };
  // For now, add to mock data
  // import { allMockEntities, mockMethanisationSites } from '@/lib/mock-data'; // Circular dependency
  // mockMethanisationSites.push(newSite);
  // allMockEntities.push(newSite);
  return newSite;
}

// TODO: Implement getLoadixUnits, getLoadixUnitById, updateLoadixUnit, deleteLoadixUnit
// TODO: Implement getMethanisationSites, getMethanisationSiteById, updateMethanisationSite, deleteMethanisationSite
