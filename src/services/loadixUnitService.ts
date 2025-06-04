import { LoadixUnit } from '@/types';

// Simplified stub service: Loadix units feature not in use currently.
export const loadixUnitService = {
  /**
   * Fetches all Loadix units.
   * Currently returns an empty array as the feature is not in use.
   */
  async getAllLoadixUnits(): Promise<LoadixUnit[]> {
    console.log('loadixUnitService.getAllLoadixUnits: feature not in use');
    return [];
  },
};