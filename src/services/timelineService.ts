// src/services/timelineService.ts

import type { TimelineComment } from '@/types';
import { getDealers } from '@/services/dealerService';
import { getAllMethanisationSites } from '@/services/methanisationSiteService';

/**
 * Récupère tous les commentaires des concessionnaires et des sites de méthanisation,
 * puis les trie par date et les renvoie.
 * En cas d'erreur, retourne un tableau vide.
 */
export async function getLatestComments(): Promise<TimelineComment[]> {
  try {
    // Récupération en parallèle
    const [dealers, sites] = await Promise.all([
      getDealers(),
      getAllMethanisationSites(),
    ]);

    // Extraction et fusion des commentaires
    const commentsFromDealers = dealers.flatMap(dealer => dealer.comments || []);
    const commentsFromSites = sites.flatMap(site => site.comments || []);
    const allComments = [...commentsFromDealers, ...commentsFromSites];

    // Tri par date ascendante
    return allComments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires globaux :', error);
    return [];
  }
}
