
// src/services/dealerService.ts
'use server';

import { db, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import type { Dealer, GeoLocation, NewDealerData, UpdateDealerData, Comment } from '@/types';
import { collection, getDocs, doc, getDoc, Timestamp, GeoPoint, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Helper function to convert Firestore document data to Dealer type
const mapDocToDealer = (docId: string, data: any): Dealer => {
  // Convert Firestore Timestamps to ISO strings
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
    userId: comment.userId || 'unknown',
    userName: comment.userName || 'Unknown User',
    text: comment.text || '',
  })) : [];


  return {
    id: docId,
    name: data.name || '',
    entityType: 'dealer', // This is fixed for dealers
    address: data.address || '',
    city: data.city || '',
    postalCode: data.postalCode || '',
    country: data.country || '',
    department: data.department,
    phone: data.phone,
    fax: data.fax,
    email: data.email,
    website: data.website,
    contactPerson: data.contactPerson,
    brandSign: data.brandSign,
    branchName: data.branchName,
    servicesOffered: Array.isArray(data.servicesOffered) ? data.servicesOffered : [],
    tractorBrands: Array.isArray(data.tractorBrands) ? data.tractorBrands : [],
    machineTypes: Array.isArray(data.machineTypes) ? data.machineTypes : [],
    prospectionStatus: data.prospectionStatus || 'none',
    comments: comments,
    galleryUris: Array.isArray(data.galleryUris) ? data.galleryUris : [],
    documentUris: Array.isArray(data.documentUris) ? data.documentUris : [],
    relatedClientIds: Array.isArray(data.relatedClientIds) ? data.relatedClientIds : [],
    relatedProspectIds: Array.isArray(data.relatedProspectIds) ? data.relatedProspectIds : [],
    relatedSiteIds: Array.isArray(data.relatedSiteIds) ? data.relatedSiteIds : [],
    geoLocation,
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
    return null;
  }
  try {
    const dealersCol = collection(db, 'dealers');
    
    const dataToSave: any = {
      ...dealerData,
      entityType: 'dealer', // Ensure entityType is set
      createdAt: serverTimestamp(), // Use serverTimestamp for creation
      updatedAt: serverTimestamp(), // Use serverTimestamp for initial update
    };

    if (dealerData.geoLocation) {
      dataToSave.geoLocation = new GeoPoint(dealerData.geoLocation.lat, dealerData.geoLocation.lng);
    } else {
      dataToSave.geoLocation = null; // Or omit if you prefer
    }

    if (dealerData.comments && dealerData.comments.length > 0) {
      dataToSave.comments = dealerData.comments.map(comment => ({
        ...comment,
        date: Timestamp.fromDate(new Date(comment.date)), // Convert ISO string back to Timestamp
      }));
    } else {
      dataToSave.comments = [];
    }
    
    // Ensure all array fields are initialized if not provided
    const arrayFields: (keyof NewDealerData)[] = ['servicesOffered', 'tractorBrands', 'machineTypes', 'galleryUris', 'documentUris', 'relatedClientIds', 'relatedProspectIds', 'relatedSiteIds'];
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
    // Consider re-throwing or returning a more specific error object
    throw error; // Re-throw to allow the form to catch it
  }
}

export async function updateDealer(id: string, dataToUpdate: UpdateDealerData): Promise<Dealer | null> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot update dealer.");
    return null;
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
      updatePayload.geoLocation = null; // Explicitly set to null if cleared
    }

    if (dataToUpdate.comments) {
      updatePayload.comments = dataToUpdate.comments.map(comment => ({
        ...comment,
        // Convert date back to Timestamp if it's an ISO string
        date: typeof comment.date === 'string' ? Timestamp.fromDate(new Date(comment.date)) : comment.date,
      }));
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
    return; 
  }
  try {
    await deleteDoc(doc(db, 'dealers', id));
  } catch (error) {
    console.error(`Error deleting dealer with ID ${id} from Firestore:`, error);
    throw error; 
  }
}
