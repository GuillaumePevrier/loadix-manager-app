// src/services/methanisationSiteService.ts
import { db, allConfigPresent } from '@/lib/firebase'; // Votre configuration Firebase exportant "db"

if (!allConfigPresent) {
  throw new Error('Firebase configuration is not present. Cannot use Firestore.');
}
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

// -----------------------------
// Types de base pour les sites
// -----------------------------

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
  department?: string; // Added department field
  createdAt: Timestamp;
  updatedAt: Timestamp;
  comments?: Comment[];       // Tableau de commentaires (type importé ci-dessous)
  galleryUris?: string[];
  documentUris?: string[];
  // (Vous pourrez ajouter d'autres champs spécifiques au fur et à mesure)
}

export type NewMethanisationSiteData = Omit<
  BaseMethanisationSiteData,
  'createdAt' | 'updatedAt'
>;

export interface MethanisationSite extends BaseMethanisationSiteData {
  id: string;
  status?: 'planned' | 'construction' | 'active' | 'maintenance' | 'inactive';
}

// -----------------------------
// Référence à la collection
// -----------------------------

const methanisationSitesCollection = collection(db, 'methanisationSites');

// -----------------------------
// CRUD principaux
// -----------------------------

/**
 * Ajoute un nouveau site de méthanisation dans Firestore.
 * On génère les timestamps côté client avec Timestamp.now().
 */
export const addMethanisationSite = async (
  siteData: NewMethanisationSiteData
): Promise<MethanisationSite> => {
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
    console.log('Nouveau site ajouté avec ID :', docRef.id);
    return newSite;
  } catch (error) {
    console.error('Erreur lors de l’ajout du site :', error);
    throw new Error('Erreur : impossible d’ajouter le site de méthanisation.');
  }
};

/**
 * Récupère un site de méthanisation par son ID.
 */
export const getMethanisationSiteById = async (
  id: string
): Promise<MethanisationSite | null> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const siteData = docSnap.data() as BaseMethanisationSiteData;
      const comments = siteData.comments?.map(comment => ({
        ...comment,
        date: (comment.date as any)?.toDate?.().toISOString() || new Date().toISOString(), // Convert Timestamp to ISO string
      })) || [];

      const site: MethanisationSite = {
        comments: comments as Comment[], // Cast back to Comment[]
        id: docSnap.id,
        ...siteData,
      };
      console.log('Site trouvé :', site);
      return site;
    } else {
      console.log(`Aucun site trouvé avec l’ID : ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Erreur en récupérant le site avec l’ID ${id} :`, error);
    throw new Error(`Erreur : impossible de récupérer le site ${id}.`);
  }
};

/**
 * Met à jour un site existant. Les champs partiels sont autorisés.
 */
export const updateMethanisationSite = async (
  id: string,
  updateData: Partial<BaseMethanisationSiteData>
): Promise<void> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    const now = Timestamp.now();
    const dataToUpdate = {
      ...updateData,
      updatedAt: now,
    };
    await updateDoc(docRef, dataToUpdate);
    console.log('Site mis à jour avec ID :', id);
  } catch (error) {
    console.error(`Erreur en mettant à jour le site ${id} :`, error);
    throw new Error(`Erreur : impossible de mettre à jour le site ${id}.`);
  }
};

/**
 * Supprime un site de méthanisation.
 */
export const deleteMethanisationSite = async (id: string): Promise<void> => {
  try {
    const docRef = doc(methanisationSitesCollection, id);
    await deleteDoc(docRef);
    console.log('Site supprimé avec ID :', id);
  } catch (error) {
    console.error(`Erreur en supprimant le site ${id} :`, error);
    throw new Error(`Erreur : impossible de supprimer le site ${id}.`);
  }
};

/**
 * Récupère tous les sites de méthanisation.
 */
export const getAllMethanisationSites = async (): Promise<MethanisationSite[]> => {
  try {
    const querySnapshot = await getDocs(methanisationSitesCollection);
    const sites: MethanisationSite[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const siteData = docSnap.data() as Omit<BaseMethanisationSiteData, 'createdAt' | 'updatedAt' | 'comments'> & {
 comments?: ({date: Timestamp | string} & Omit<Comment, 'date'>)[];
          createdAt: Timestamp;
 updatedAt: Timestamp;
        };
        const comments = siteData.comments?.map(comment => ({
          ...comment,
          date: (comment.date as any)?.toDate?.().toISOString() || new Date().toISOString(), // Convert Timestamp to ISO string
        })) || [];
        sites.push({ id: docSnap.id, ...siteData });
      }
    });
    console.log(`Trouvé ${sites.length} sites de méthanisation.`);
    return sites;
  } catch (error) {
    console.error('Erreur en récupérant tous les sites :', error);
    throw new Error('Erreur : impossible de récupérer tous les sites.');
  }
};

// -----------------------------
// Gestion des commentaires
// -----------------------------

import type { Comment } from '@/types';

/**
 * Ajoute un nouveau commentaire à un site.
 * IMPORTANT : on utilise strictement Timestamp.now() pour le champ "date".
 *             Aucune utilisation de serverTimestamp() ici.
 */
export const addCommentToMethanisationSite = async (
  siteId: string,
  userName: string,
  text: string,
  statusAtEvent: MethanisationSite['status']
): Promise<void> => {
  const siteRef = doc(methanisationSitesCollection, siteId);

  // Générer un ID unique localement pour le commentaire
  const newComment: Comment = {
    id: doc(methanisationSitesCollection, '_').id, // génère un ID unique
    userName,
    text,
    date: Timestamp.now(),            // <— pas de serverTimestamp ici
    statusAtEvent,                    // on stocke le statut au moment du commentaire
    // ajoutez ici d’autres champs si votre type Comment en a (imageUrl, fileUrl, etc.)
  };

  try {
    await updateDoc(siteRef, {
      comments: arrayUnion(newComment),
      // Si statusAtEvent n’est pas 'none', on met à jour le statut principal du site
      status: statusAtEvent !== 'none' ? statusAtEvent : undefined,
      updatedAt: Timestamp.now(),     // Mettre à jour le updatedAt du site
    });
    console.log(`Commentaire ajouté au site ${siteId}`, newComment);
  } catch (error) {
    console.error('Erreur en ajoutant le commentaire :', error);
    throw error;
  }
};

/**
 * Supprime un commentaire d’un site.
 * On s’appuie sur arrayRemove pour extraire l’objet complet du tableau "comments".
 */
export const deleteCommentFromMethanisationSite = async (
  siteId: string,
  commentToDelete: Comment
): Promise<void> => {
  const siteRef = doc(methanisationSitesCollection, siteId);

  try {
    await updateDoc(siteRef, {
      comments: arrayRemove(commentToDelete),
      updatedAt: Timestamp.now(), // mettre à jour updatedAt en même temps
    });
    console.log(`Commentaire supprimé du site ${siteId}`, commentToDelete);
  } catch (error) {
    console.error('Erreur en supprimant le commentaire :', error);
    throw error;
  }
};
