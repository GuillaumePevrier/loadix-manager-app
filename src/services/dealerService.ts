// src/services/dealerService.ts
'use server';

import { db, storage, allConfigPresent as firebaseConfigPresent } from '@/lib/firebase';
import type { Dealer, GeoLocation, NewDealerData, UpdateDealerData, Comment, LoadixUnit, NewLoadixUnitData, AppEntity } from '@/types';
import { collection, getDocs, doc, getDoc, Timestamp, GeoPoint, addDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
// File upload related imports are removed as per new requirements for comments
// import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject as deleteFileFromStorage } from 'firebase/storage';


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

  const comments = Array.isArray(data.comments) ? data.comments.map((comment: any) => {
    let commentDate = new Date().toISOString();
    if (comment.date instanceof Timestamp) {
      commentDate = comment.date.toDate().toISOString();
    } else if (typeof comment.date === 'string') {
      const parsedDate = new Date(comment.date);
      if (!isNaN(parsedDate.getTime())) {
        commentDate = parsedDate.toISOString();
      } else {
        console.warn(`Invalid date string for comment in dealer ${docId}:`, comment.date, "- defaulting to current date.");
      }
    } else if (comment.date) {
        console.warn(`Unexpected date type for comment in dealer ${docId}:`, comment.date, "- defaulting to current date.");
    }

    return {
      userName: comment.userName || 'Unknown User',
      date: commentDate,
      text: comment.text || '',
      imageUrl: comment.imageUrl, // Keep for display if data exists
      fileUrl: comment.fileUrl,   // Keep for display if data exists
      fileName: comment.fileName, // Keep for display if data exists
      prospectionStatusAtEvent: comment.prospectionStatusAtEvent,
    };
  }) : [];


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
        siteId: data.siteId, // Assuming this is the updated field name
        createdAt,
        updatedAt,
    };
};

// Helper to convert Firestore document data to MethanisationSite
// mapDocToMethanisationSite removed


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

    // Handle geoLocation: convert to GeoPoint if valid, otherwise set to null
    if (dealerData.geoLocation && typeof dealerData.geoLocation.lat === 'number' && typeof dealerData.geoLocation.lng === 'number') {
      dataToSave.geoLocation = new GeoPoint(dealerData.geoLocation.lat, dealerData.geoLocation.lng);
    } else dataToSave.geoLocation = null; // Set to null if not provided or invalid

    const initialCommentsArray: Partial<Comment>[] = [];
    if (dealerData.initialCommentText && dealerData.initialCommentText.trim() !== '') {
        initialCommentsArray.push({
            userName: 'Admin ManuRob', 
            date: new Date().toISOString(), 
            text: dealerData.initialCommentText.trim(),
            prospectionStatusAtEvent: dealerData.prospectionStatus || 'none',
        });
    }
    dataToSave.comments = initialCommentsArray.map(c => ({...c, date: Timestamp.fromDate(new Date(c.date!)) }));
    delete dataToSave.initialCommentText;


    const arrayFields: (keyof NewDealerData)[] = ['servicesOffered', 'tractorBrands', 'machineTypes', 'galleryUris', 'documentUris', 'relatedProspectIds', 'relatedSiteIds'];
    arrayFields.forEach(field => {
        if (!dataToSave[field] || !Array.isArray(dataToSave[field])) { 
            dataToSave[field] = [];
        }
    });
    
    dataToSave.tractorBrands = Array.isArray(dealerData.tractorBrands) ? dealerData.tractorBrands : [];
    dataToSave.machineTypes = Array.isArray(dealerData.machineTypes) ? dealerData.machineTypes : [];


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
 console.log('updateDealer received ID:', id, 'and data:', dataToUpdate);

  try {
    const dealerRef = doc(db, 'dealers', id);
    const updatePayload: { [key: string]: any } = { ...dataToUpdate };

    updatePayload.updatedAt = serverTimestamp();

    // Handle geoLocation: If it's already a GeoPoint (from fetched data), keep it.
    // If it's an object with lat/lng (from form geocoding), convert it to GeoPoint.
    // Otherwise, set to null.
 if (updatePayload.hasOwnProperty('geoLocation')) {
      if (updatePayload.geoLocation instanceof GeoPoint) {
 // It's already a GeoPoint, keep it
      } else if (updatePayload.geoLocation && typeof updatePayload.geoLocation.lat === 'number' && typeof updatePayload.geoLocation.lng === 'number') {
            updatePayload.geoLocation = new GeoPoint(updatePayload.geoLocation.lat, updatePayload.geoLocation.lng);
      } else {
 updatePayload.geoLocation = null; // Invalid or undefined, set to null
      }
        }
    
    if (updatePayload.hasOwnProperty('comments')) {
      delete updatePayload.comments; 
    }
    if (updatePayload.hasOwnProperty('initialCommentText')) {
        delete updatePayload.initialCommentText; 
    }
    
    const arrayFields: (keyof UpdateDealerData)[] = ['tractorBrands', 'machineTypes', 'servicesOffered', 'galleryUris', 'documentUris'];
    arrayFields.forEach(field => {
        if (updatePayload.hasOwnProperty(field)) {
            updatePayload[field] = Array.isArray(updatePayload[field]) ? updatePayload[field] : [];
        }
    });

    // Remove undefined fields as Firestore update doesn't like them
    Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
            delete updatePayload[key];
        }
    });

 console.log('updateDealer payload before updateDoc:', updatePayload);

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

export async function addCommentToDealer(
    dealerId: string,
    userName: string,
    text: string,
    newDealerProspectionStatus: Dealer['prospectionStatus'] // This is the status for the comment AND the new status for the dealer
): Promise<void> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase (Firestore) not configured. Cannot add comment.");
    throw new Error("Firebase not configured. Cannot add comment.");
  }
  try {
    const dealerRef = doc(db, 'dealers', dealerId);
    
    const newCommentData: Partial<Comment> = {
      userName: userName,
      text: text,
      date: new Date().toISOString(), // Will be converted to Firestore Timestamp
      prospectionStatusAtEvent: newDealerProspectionStatus || 'none',
      // imageUrl, fileUrl, fileName are removed as file upload is no longer part of this function
    };
    
    const commentToSaveFirestore = {
        ...newCommentData,
        date: Timestamp.fromDate(new Date(newCommentData.date!)) 
    };

    await updateDoc(dealerRef, {
      comments: arrayUnion(commentToSaveFirestore),
      prospectionStatus: newDealerProspectionStatus || 'none', // Update the dealer's main status
      updatedAt: serverTimestamp(), 
    });

  } catch (error) {
    console.error(`Error adding comment to dealer ${dealerId}:`, error);
    throw error;
  }
}

export async function deleteCommentFromDealer(dealerId: string, commentToDelete: Comment): Promise<void> {
    if (!firebaseConfigPresent || !db) {
        console.warn("Firebase not configured. Cannot delete comment.");
        throw new Error("Firebase not configured.");
    }
    try {
        const dealerRef = doc(db, 'dealers', dealerId);
        const dealerSnapshot = await getDoc(dealerRef);

        if (!dealerSnapshot.exists()) {
            throw new Error(`Dealer with ID ${dealerId} not found.`);
        }

        const dealerData = dealerSnapshot.data();
        
        // Map Firestore comments to have ISO date strings for comparison
        const commentsFromFirestore = (dealerData.comments || []).map((c: any) => ({
            userName: c.userName || 'Unknown User',
            date: c.date instanceof Timestamp ? c.date.toDate().toISOString() : (typeof c.date === 'string' ? c.date : new Date().toISOString()),
            text: c.text || '',
            imageUrl: c.imageUrl,
            fileUrl: c.fileUrl,
            fileName: c.fileName,
            prospectionStatusAtEvent: c.prospectionStatusAtEvent,
        }));

        // Filter out the comment to delete
        // commentToDelete.date is already an ISO string from the client
        const updatedComments = commentsFromFirestore.filter((comment: Comment) => {
            return !(
                comment.userName === commentToDelete.userName &&
                comment.text === commentToDelete.text &&
                comment.date === commentToDelete.date &&
                comment.prospectionStatusAtEvent === commentToDelete.prospectionStatusAtEvent // Added for more precise matching
            );
        });

        if (commentsFromFirestore.length === updatedComments.length) {
            console.warn("Comment to delete was not found in Firestore array. No changes made.", commentToDelete);
            // Optionally throw an error or return a specific status if the comment wasn't found
            // For now, we proceed to update with the (unchanged) array to avoid breaking flow if strict match failed
        }

        // Convert dates back to Timestamps for Firestore update
        const commentsToSaveFirestore = updatedComments.map(c => ({
            ...c,
            date: Timestamp.fromDate(new Date(c.date)),
            // Ensure optional fields are either present or explicitly null/removed if needed
            ...(c.imageUrl && { imageUrl: c.imageUrl }),
            ...(c.fileUrl && { fileUrl: c.fileUrl }),
            ...(c.fileName && { fileName: c.fileName }),
            ...(c.prospectionStatusAtEvent && { prospectionStatusAtEvent: c.prospectionStatusAtEvent }),
        }));
        
        // Logic for deleting associated file from Storage remains commented out
        /*
        if (commentToDelete.imageUrl && storage) {
            try {
                const fileRef = storageRef(storage, commentToDelete.imageUrl);
                await deleteFileFromStorage(fileRef);
            } catch (storageError: any) {
                if (storageError.code !== 'storage/object-not-found') {
                  console.warn(`Failed to delete image from storage: ${commentToDelete.imageUrl}`, storageError);
                }
            }
        } else if (commentToDelete.fileUrl && storage) {
             try {
                const fileRef = storageRef(storage, commentToDelete.fileUrl);
                await deleteFileFromStorage(fileRef);
            } catch (storageError: any) {
                if (storageError.code !== 'storage/object-not-found') {
                  console.warn(`Failed to delete file from storage: ${commentToDelete.fileUrl}`, storageError);
                }
            }
        }
        */

        await updateDoc(dealerRef, {
            comments: commentsToSaveFirestore,
            updatedAt: serverTimestamp(),
        });

    } catch (error) {
        console.error(`Error deleting comment from dealer ${dealerId}:`, error);
        throw error;
    }
}


export async function deleteDealer(id: string): Promise<void> {
  if (!firebaseConfigPresent || !db) {
    console.warn("Firebase not configured. Cannot delete dealer.");
    throw new Error("Firebase not configured.");
  }
  try {
    // TODO: Also delete associated files in Storage (e.g., comments media, gallery)
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
    
    if (unitData.purchaseDate && unitData.purchaseDate !== "") dataToSave.purchaseDate = Timestamp.fromDate(new Date(unitData.purchaseDate));
    else delete dataToSave.purchaseDate;

    if (unitData.lastMaintenanceDate && unitData.lastMaintenanceDate !== "") dataToSave.lastMaintenanceDate = Timestamp.fromDate(new Date(unitData.lastMaintenanceDate));
    else delete dataToSave.lastMaintenanceDate;


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

// MethanisationSite Functions removed

// TODO: Implement updateLoadixUnit, deleteLoadixUnit
// TODO: Implement updateMethanisationSite, deleteMethanisationSite removed
