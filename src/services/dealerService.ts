
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
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
    
    let geoLocation: GeoLocation | undefined = undefined;
    if (data.geoLocation instanceof GeoPoint) {
        geoLocation = { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude };
    } else if (data.geoLocation && typeof data.geoLocation.lat === 'number' && typeof data.geoLocation.lng === 'number') {
        geoLocation = data.geoLocation;
    }

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
        geoLocation,
        purchaseDate: data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate().toISOString() : data.purchaseDate,
        lastMaintenanceDate: data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate().toISOString() : data.lastMaintenanceDate,
        dealerId: data.dealerId,
        methanisationSiteId: data.methanisationSiteId,
        createdAt,
        updatedAt,
    };
};

// Helper to convert Firestore document data to MethanisationSite
const mapDocToMethanisationSite = (docId: string, data: any): MethanisationSite => {
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();

    let geoLocation: GeoLocation | undefined = undefined;
    if (data.geoLocation instanceof GeoPoint) {
        geoLocation = { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude };
    } else if (data.geoLocation && typeof data.geoLocation.lat === 'number' && typeof data.geoLocation.lng === 'number') {
        geoLocation = data.geoLocation;
    }

    return {
        id: docId,
        name: data.name || '',
        entityType: 'methanisation-site',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        geoLocation,
        capacity: data.capacity,
        operator: data.operator,
        startDate: data.startDate instanceof Timestamp ? data.startDate.toDate().toISOString() : data.startDate,
        siteClients: Array.isArray(data.siteClients) ? data.siteClients : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        relatedDealerIds: Array.isArray(data.relatedDealerIds) ? data.relatedDealerIds : [],
        createdAt,
        updatedAt,
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

    if (dealerData.initialCommentText && dealerData.initialCommentText.trim() !== '') {
        dataToSave.comments = [{
            userName: 'Admin ManuRob', 
            date: Timestamp.now(), 
            text: dealerData.initialCommentText.trim(),
        }];
    } else if (!dealerData.comments) { // Ensure comments is an array if not provided
        dataToSave.comments = [];
    }
    delete dataToSave.initialCommentText; 


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

// --- LoadixUnit Functions ---
export async function getLoadixUnits(): Promise<LoadixUnit[]> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Returning empty Loadix unit list.");
    return [];
  }
  try {
    const unitsCol = collection(db, 'loadixUnits');
    const unitSnapshot = await getDocs(unitsCol);
    return unitSnapshot.docs.map(docSnap => mapDocToLoadixUnit(docSnap.id, docSnap.data()));
  } catch (error) {
    console.error("Error fetching Loadix units from Firestore:", error);
    return [];
  }
}

export async function getLoadixUnitById(id: string): Promise<LoadixUnit | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot fetch Loadix unit.");
    return null;
  }
  try {
    const unitRef = doc(db, 'loadixUnits', id);
    const unitDocSnap = await getDoc(unitRef);
    if (!unitDocSnap.exists()) {
      console.log(`No Loadix unit found with ID: ${id}`);
      return null;
    }
    return mapDocToLoadixUnit(unitDocSnap.id, unitDocSnap.data());
  } catch (error) {
    console.error(`Error fetching Loadix unit with ID ${id} from Firestore:`, error);
    return null;
  }
}

export async function addLoadixUnit(unitData: NewLoadixUnitData): Promise<LoadixUnit | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot add Loadix Unit.");
    throw new Error("Firebase not configured.");
  }
  try {
    const unitsCol = collection(db, 'loadixUnits');
    const dataToSave: any = {
      ...unitData,
      entityType: 'loadix-unit',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (unitData.geoLocation) {
      dataToSave.geoLocation = new GeoPoint(unitData.geoLocation.lat, unitData.geoLocation.lng);
    } else {
      dataToSave.geoLocation = null; 
    }
    
    if (unitData.purchaseDate) dataToSave.purchaseDate = Timestamp.fromDate(new Date(unitData.purchaseDate));
    if (unitData.lastMaintenanceDate) dataToSave.lastMaintenanceDate = Timestamp.fromDate(new Date(unitData.lastMaintenanceDate));


    const docRef = await addDoc(unitsCol, dataToSave);
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
      return mapDocToLoadixUnit(newDocSnap.id, newDocSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error adding Loadix Unit to Firestore:", error);
    throw error;
  }
}

// --- MethanisationSite Functions ---
export async function getMethanisationSites(): Promise<MethanisationSite[]> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Returning empty Methanisation site list.");
    return [];
  }
  try {
    const sitesCol = collection(db, 'methanisationSites');
    const siteSnapshot = await getDocs(sitesCol);
    return siteSnapshot.docs.map(docSnap => mapDocToMethanisationSite(docSnap.id, docSnap.data()));
  } catch (error) {
    console.error("Error fetching Methanisation sites from Firestore:", error);
    return [];
  }
}

export async function getMethanisationSiteById(id: string): Promise<MethanisationSite | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot fetch Methanisation site.");
    return null;
  }
  try {
    const siteRef = doc(db, 'methanisationSites', id);
    const siteDocSnap = await getDoc(siteRef);
    if (!siteDocSnap.exists()) {
      console.log(`No Methanisation site found with ID: ${id}`);
      return null;
    }
    return mapDocToMethanisationSite(siteDocSnap.id, siteDocSnap.data());
  } catch (error) {
    console.error(`Error fetching Methanisation site with ID ${id} from Firestore:`, error);
    return null;
  }
}

export async function addMethanisationSite(siteData: NewMethanisationSiteData): Promise<MethanisationSite | null> {
   if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot add Methanisation Site.");
    throw new Error("Firebase not configured.");
  }
  try {
    const sitesCol = collection(db, 'methanisationSites');
    const dataToSave: any = {
      ...siteData,
      entityType: 'methanisation-site',
      siteClients: [], // Initialize default empty arrays
      technologies: [],
      relatedDealerIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    if (siteData.geoLocation) {
      dataToSave.geoLocation = new GeoPoint(siteData.geoLocation.lat, siteData.geoLocation.lng);
    } else {
      dataToSave.geoLocation = null;
    }
    if (siteData.startDate) dataToSave.startDate = Timestamp.fromDate(new Date(siteData.startDate));

    const docRef = await addDoc(sitesCol, dataToSave);
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
      return mapDocToMethanisationSite(newDocSnap.id, newDocSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error adding Methanisation Site to Firestore:", error);
    throw error;
  }
}

// TODO: Implement updateLoadixUnit, deleteLoadixUnit
// TODO: Implement updateMethanisationSite, deleteMethanisationSite
