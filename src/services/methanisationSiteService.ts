// src/services/methanisationSiteService.ts
import { db } from '@/lib/firebase'; // Assuming you have a firebase config and initialized app exported as db
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp, getDocs } from 'firebase/firestore';

// Define a basic type for Methanisation Site data to start with
// You will want to expand this later to include all site-specific fields
interface BaseMethanisationSiteData {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  geoLocation?: {
    lat: number;
    lng: number;
  };
  contactEmail?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Add other common fields like comments, galleryUris, etc. later
}

// Type for data when creating a new site (before adding timestamps and ID)
// Omit generated fields like id, createdAt, updatedAt
export type NewMethanisationSiteData = Omit<BaseMethanisationSiteData, 'createdAt' | 'updatedAt'>;

// Type for data returned from Firestore (includes ID and timestamps)
export interface MethanisationSite extends BaseMethanisationSiteData {
  id: string;
}

const methanisationSitesCollection = collection(db, 'methanisationSites');

/**
 * Adds a new methanisation site to Firestore.
 * @param siteData - The data for the new site (excluding ID and timestamps).
 * @returns A Promise that resolves with the added site data including its ID.
 */
export const addMethanisationSite = async (siteData: NewMethanisationSiteData): Promise<MethanisationSite> => {
  try {
    const now = Timestamp.now();
    const siteToAdd: BaseMethanisationSiteData = {
      ...siteData,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(methanisationSitesCollection, siteToAdd);
    const newSite: MethanisationSite = {
      id: docRef.id,
      ...siteToAdd,
    };
    console.log("New methanisation site added with ID:", docRef.id);
    return newSite;
  } catch (error) {
    console.error("Error adding methanisation site:", error);
    throw new Error("Failed to add methanisation site.");
  }
};

/**
 * Retrieves a methanisation site by its ID from Firestore.
 * @param id - The ID of the site to retrieve.
 * @returns A Promise that resolves with the site data, or null if not found.
 */
export const getMethanisationSiteById = async (id: string): Promise<MethanisationSite | null> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const siteData = docSnap.data() as BaseMethanisationSiteData;
      const site: MethanisationSite = {
        id: docSnap.id,
        ...siteData,
      };
      console.log("Methanisation site found:", site);
      return site;
    } else {
      console.log("No such methanisation site found with ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error getting methanisation site by ID:", id, error);
    throw new Error(`Failed to get methanisation site with ID ${id}.`);
  }
};

/**
 * Updates an existing methanisation site in Firestore.
 * @param id - The ID of the site to update.
 * @param updateData - The data to update (partial data is fine).
 * @returns A Promise that resolves when the update is complete.
 */
export const updateMethanisationSite = async (id: string, updateData: Partial<BaseMethanisationSiteData>): Promise<void> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    const now = Timestamp.now();
    const dataToUpdate = {
      ...updateData,
      updatedAt: now,
    };
    await updateDoc(docRef, dataToUpdate);
    console.log("Methanisation site updated with ID:", id);
  } catch (error) {
    console.error("Error updating methanisation site with ID:", id, error);
    throw new Error(`Failed to update methanisation site with ID ${id}.`);
  }
};

/**
 * Deletes a methanisation site from Firestore.
 * @param id - The ID of the site to delete.
 * @returns A Promise that resolves when the deletion is complete.
 */
export const deleteMethanisationSite = async (id: string): Promise<void> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    await deleteDoc(docRef);
    console.log("Methanisation site deleted with ID:", id);
  } catch (error) {
    console.error("Error deleting methanisation site with ID:", id, error);
    throw new Error(`Failed to delete methanisation site with ID ${id}.`);
  }
};

// You may also want functions to list all sites, query sites by location, etc.
// Example:
// export const getAllMethanisationSites = async (): Promise<MethanisationSite[]> => { ... };

/**
 * Retrieves all methanisation sites from Firestore.
 * @returns A Promise that resolves with an array of MethanisationSite objects.
 */
export const getAllMethanisationSites = async (): Promise<MethanisationSite[]> => {
  try {
    const querySnapshot = await getDocs(methanisationSitesCollection);
    const sites: MethanisationSite[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const siteData = docSnap.data() as BaseMethanisationSiteData;
        sites.push({ id: docSnap.id, ...siteData });
      }
    });
    console.log(`Found ${sites.length} methanisation sites.`);
    return sites;
  } catch (error) {
    console.error("Error getting all methanisation sites:", error);
    throw new Error("Failed to get all methanisation sites.");
  }
};