
// src/services/dealerService.ts
'use server';

import { db, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import type { Dealer, GeoLocation } from '@/types';
import { collection, getDocs, doc, getDoc, Timestamp, GeoPoint } from 'firebase/firestore';

// Helper function to convert Firestore document data to Dealer type
const mapDocToDealer = (docId: string, data: any): Dealer => {
  // Convert Firestore Timestamps to ISO strings
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString();
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString();
  
  // Convert Firestore GeoPoint to GeoLocation
  let geoLocation: GeoLocation = { lat: 0, lng: 0 }; // Default
  if (data.geoLocation instanceof GeoPoint) {
    geoLocation = { lat: data.geoLocation.latitude, lng: data.geoLocation.longitude };
  } else if (data.geoLocation && typeof data.geoLocation.lat === 'number' && typeof data.geoLocation.lng === 'number') {
    // Handle cases where it might already be in the desired format (e.g. from mock data if migrating)
    geoLocation = data.geoLocation;
  }

  return {
    id: docId,
    name: data.name || '',
    entityType: 'dealer',
    address: data.address || '',
    city: data.city || '',
    postalCode: data.postalCode || '',
    country: data.country || '',
    phone: data.phone,
    email: data.email,
    website: data.website,
    contactPerson: data.contactPerson,
    servicesOffered: data.servicesOffered || [],
    tractorBrands: data.tractorBrands || [],
    machineTypes: data.machineTypes || [],
    prospectionStatus: data.prospectionStatus || 'none',
    comments: (data.comments || []).map((comment: any) => ({
      ...comment,
      date: comment.date instanceof Timestamp ? comment.date.toDate().toISOString() : new Date().toISOString(),
    })),
    galleryUris: data.galleryUris || [],
    documentUris: data.documentUris || [],
    relatedClientIds: data.relatedClientIds || [],
    relatedProspectIds: data.relatedProspectIds || [],
    relatedSiteIds: data.relatedSiteIds || [],
    geoLocation,
    createdAt,
    updatedAt,
  };
};

export async function getDealers(): Promise<Dealer[]> {
  if (!firebaseConfigPresent) {
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
    return []; // Return empty array on error
  }
}

export async function getDealerById(id: string): Promise<Dealer | null> {
  if (!firebaseConfigPresent) {
    console.warn("Firebase not configured. Returning null for dealer by ID.");
    return null;
  }
  try {
    const dealerDocRef = doc(db, 'dealers', id);
    const dealerDocSnap = await getDoc(dealerDocRef);

    if (dealerDocSnap.exists()) {
      return mapDocToDealer(dealerDocSnap.id, dealerDocSnap.data());
    } else {
      console.log(`No dealer found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching dealer with ID ${id} from Firestore:`, error);
    return null; // Return null on error
  }
}
