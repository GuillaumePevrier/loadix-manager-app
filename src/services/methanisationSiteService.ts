import {
  MethanisationSite,
  NewMethanisationSiteData,
  UpdateMethanisationSiteData,
  Comment,
} from '@/types';
import { db } from '@/lib/firebase'; // Assuming you are using Firebase
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  FieldValue,
  Timestamp,
} from 'firebase/firestore';

const methanisationSitesCollection = collection(db, 'methanisationSites');

const methanisationSiteService = {
  /**
   * Fetches all methanisation sites.
   * @returns A promise that resolves with an array of MethanisationSite objects.
   */
  getAllMethanisationSites: async (): Promise<MethanisationSite[]> => {
    try {
      const q = query(methanisationSitesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const sites: MethanisationSite[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          entityType: 'methanisation-site',
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
 country: data.country || '', // Assuming country might be optional or default to empty string
          geoLocation: data.geoLocation,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(), // Handle potential missing or non-Timestamp data
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(), // Handle potential missing or non-Timestamp data
          capacity: data.capacity,
          operator: data.operator,
          startDate: data.startDate,
          siteClients: data.siteClients || [],
          technologies: data.technologies || [],
          relatedDealerIds: data.relatedDealerIds || [],
          comments: data.comments || [], // Assuming comments are stored with the site
        };
      });
      return sites;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching all methanisation sites:', error.message);
 throw new Error(`Failed to fetch methanisation sites: ${error.message}`);
      }
      console.error('An unexpected error occurred while fetching methanisation sites:', error);
      throw new Error('Failed to fetch methanisation sites.');
    }
  },

  /**
   * Fetches a single methanisation site by its ID.
   * @param id The ID of the methanisation site.
   * @returns A promise that resolves with the MethanisationSite object or null if not found.
   */
  getMethanisationSiteById: async (id: string): Promise<MethanisationSite | null> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', id);
      const siteDoc = await getDoc(siteDocRef);

      if (!siteDoc.exists()) {
        return null;
      }

      const data = siteDoc.data();
      return {
        id: siteDoc.id,
        name: data.name,
        entityType: 'methanisation-site',
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
 country: data.country || '', // Assuming country might be optional or default to empty string
        geoLocation: data.geoLocation,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(), // Handle potential missing or non-Timestamp data
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : new Date().toISOString(), // Handle potential missing or non-Timestamp data
        capacity: data.capacity,
        operator: data.operator,
        startDate: data.startDate,
        siteClients: data.siteClients || [],
        technologies: data.technologies || [],
        relatedDealerIds: data.relatedDealerIds || [],
        comments: data.comments || [],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching methanisation site with ID ${id}:`, error.message);
 throw new Error(`Failed to fetch methanisation site with ID ${id}: ${error.message}`);
      }
      // Handle cases where the error is not an Error object (e.g., network issues)
      console.error(`An unexpected error occurred while fetching methanisation site with ID ${id}:`, error);
      throw new Error(`Failed to fetch methanisation site with ID ${id}.`);
    }
  },

  /**
   * Creates a new methanisation site.
   * @param newSiteData The data for the new methanisation site.
   * @returns A promise that resolves with the ID of the newly created site.
   */
  createMethanisationSite: async (newSiteData: NewMethanisationSiteData): Promise<string> => {
    try {
      // Basic structure, you might want to add validation here
      const docRef = await addDoc(methanisationSitesCollection, {
        ...newSiteData,
        entityType: 'methanisation-site',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        comments: [], // Initialize with empty comments array
      });
      return docRef.id;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating methanisation site:', error.message);
 throw new Error(`Failed to create methanisation site: ${error.message}`);
      }
      throw new Error('Failed to create methanisation site.');
    }
  },

  /**
   * Updates an existing methanisation site.
   * @param id The ID of the methanisation site to update.
   * @param updateData The data to update.
   * @returns A promise that resolves when the update is complete.
   */
  updateMethanisationSite: async (id: string, updateData: UpdateMethanisationSiteData): Promise<void> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', id);
      await updateDoc(siteDocRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating methanisation site with ID ${id}:`, error.message);
 throw new Error(`Failed to update methanisation site with ID ${id}: ${error.message}`);
      }
      throw new Error(`Failed to update methanisation site with ID ${id}.`);
    }
  },

  /**
   * Deletes a methanisation site by its ID.
   * @param id The ID of the methanisation site to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteMethanisationSite: async (id: string): Promise<void> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', id);
      await deleteDoc(siteDocRef);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error deleting methanisation site with ID ${id}:`, error.message);
 throw new Error(`Failed to delete methanisation site with ID ${id}: ${error.message}`);
      }
      throw new Error(`Failed to delete methanisation site with ID ${id}.`);
    }
  },

  /**
   * Adds a comment to a methanisation site.
   * @param siteId The ID of the methanisation site.
   * @param comment The comment object to add.
   * @returns A promise that resolves when the comment is added.
   */
  addCommentToSite: async (siteId: string, comment: Comment): Promise<void> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', siteId); // Define siteDocRef

      if (!siteDoc.exists()) {
        throw new Error(`Methanisation site with ID ${siteId} not found.`);
      }

      const data = siteDoc.data();
      const currentComments: Comment[] = data.comments || [];
      const updatedComments = [...currentComments, comment];

      await updateDoc(siteDocRef, {
        comments: updatedComments,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error adding comment to methanisation site ${siteId}:`, error.message);
 throw new Error(`Failed to add comment to methanisation site ${siteId}: ${error.message}`);
      }
      throw new Error(`Failed to add comment to methanisation site ${siteId}.`);
    }
  },

  /**
   * Adds a document reference to a methanisation site.
   * @param siteId The ID of the methanisation site.
   * @param fileReference The URL or path of the uploaded document.
   * @returns A promise that resolves when the document reference is added.
   */
  addDocumentToSite: async (siteId: string, fileReference: string): Promise<void> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', siteId); // Define siteDocRef
      const siteDoc = await getDoc(siteDocRef);

      if (!siteDoc.exists()) {
        throw new Error(`Methanisation site with ID ${siteId} not found.`);
      }

      const data = siteDoc.data();
      const currentDocuments: string[] = data.documentUris || [];
      const updatedDocuments = [...currentDocuments, fileReference];

      await updateDoc(siteDocRef, {
        documentUris: updatedDocuments,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error adding document to methanisation site ${siteId}:`, error.message);
 throw new Error(`Failed to add document to methanisation site ${siteId}: ${error.message}`);
      }
      throw new Error(`Failed to add document to methanisation site ${siteId}.`);
    }
  },

  /**
   * Adds an image reference to a methanisation site's gallery.
   * @param siteId The ID of the methanisation site.
   * @param fileReference The URL or path of the uploaded image.
   * @returns A promise that resolves when the image reference is added.
   */
  addImageToSite: async (siteId: string, fileReference: string): Promise<void> => {
    try {
      const siteDocRef = doc(db, 'methanisationSites', siteId);
      const siteDoc = await getDoc(siteDocRef);
      const currentGallery: string[] = siteDoc.exists() ? siteDoc.data().galleryUris || [] : [];
      const updatedGallery = [...currentGallery, fileReference];
      await updateDoc(siteDocRef, { galleryUris: updatedGallery, updatedAt: serverTimestamp() });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error adding image to methanisation site gallery ${siteId}:`, error.message);
 throw new Error(`Failed to add image to methanisation site gallery ${siteId}: ${error.message}`);
      }
      throw new Error(`Failed to add image to methanisation site gallery ${siteId}.`);
    }
  },
  // You might need more specific functions for managing related entities (dealers, units)
  // For example, adding a related dealer ID, removing a related unit ID, etc.
  // Example:
  // addRelatedDealerToSite: async (siteId: string, dealerId: string): Promise<void> => { ... }
  // removeRelatedUnitFromSite: async (siteId: string, unitId: string): Promise<void> => { ... }
};

export default methanisationSiteService;