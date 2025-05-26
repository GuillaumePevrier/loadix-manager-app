import { LoadixUnit } from '@/types'; // Assuming LoadixUnit type is defined here
import { db } from '@/lib/firebase'; // Import your Firebase db instance
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
// Placeholder mock data for Loadix units
const mockLoadixUnits: LoadixUnit[] = [
  {
    id: 'loadix-unit-1',
    entityType: 'loadix-unit',
    name: 'Loadix Unit 001',
    serialNumber: 'SN001',
    model: 'LOADIX Pro v1',
    status: 'active',
    address: '123 Main St',
    city: 'Anytown',
    postalCode: '12345',
    country: 'USA',
    geoLocation: { lat: 34.0522, lng: -118.2437 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    purchaseDate: '2022-01-15',
    lastMaintenanceDate: '2023-05-20',
    dealerId: 'dealer-abc',
    methanisationSiteId: 'site-1',
  },
  {
    id: 'loadix-unit-2',
    entityType: 'loadix-unit',
    name: 'Loadix Unit 002',
    serialNumber: 'SN002',
    model: 'LOADIX Compact',
    status: 'maintenance',
    address: '456 Oak Ave',
    city: 'Otherville',
    postalCode: '67890',
    country: 'USA',
    geoLocation: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    purchaseDate: '2023-03-10',
    dealerId: 'dealer-xyz',
    methanisationSiteId: 'site-1',
  },
  {
    id: 'loadix-unit-3',
    entityType: 'loadix-unit',
    name: 'Loadix Unit 003',
    serialNumber: 'SN003',
    model: 'LOADIX Pro v2',
    status: 'active',
    address: '789 Pine Ln',
    city: 'Anytown',
    postalCode: '12345',
    country: 'USA',
    geoLocation: { lat: 34.0522, lng: -118.2437 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    purchaseDate: '2023-06-01',
    methanisationSiteId: 'site-2', // Associated with a different site
  },
];

export const loadixUnitService = {
  /**
   * Fetches all Loadix units.
   * (Placeholder function - replace with actual data fetching)
   */
  async getAllLoadixUnits(): Promise<LoadixUnit[]> {
    console.log('Fetching all Loadix units (mock)');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLoadixUnits;
  },

  /**
   * Fetches Loadix units associated with a specific methanisation site.
   * (Placeholder function - replace with actual data fetching filtering by siteId)
   * @param siteId The ID of the methanisation site.
   * @returns A promise resolving to an array of LoadixUnit objects.
   */
 async getLoadixUnitsBySiteId(siteId: string): Promise<LoadixUnit[]> {
    try {
      console.log(`Fetching Loadix units for site ID: ${siteId} from Firestore`);
      const loadixUnitsRef = collection(db, 'loadixUnits');
      const q = query(loadixUnitsRef, where('methanisationSiteId', '==', siteId)); // Filter by siteId
      const querySnapshot = await getDocs(q);

      const unitsForSite: LoadixUnit[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Explicitly map Firestore data to LoadixUnit type
        unitsForSite.push({
          id: doc.id,
          entityType: 'loadix-unit', // Assuming a fixed entity type
          name: data.name,
          serialNumber: data.serialNumber,
          model: data.model,
          status: data.status,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
          geoLocation: data.geoLocation,
          // Handle Firestore Timestamps if applicable
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          purchaseDate: data.purchaseDate,
          lastMaintenanceDate: data.lastMaintenanceDate,
          dealerId: data.dealerId,
          methanisationSiteId: data.methanisationSiteId,
        });
      });

 return unitsForSite;
    } catch (error) {
      console.error(`Error fetching Loadix units for site ID ${siteId}:`, error);
      throw new Error(`Failed to fetch Loadix units for site ${siteId}: ${error}`);
  },

  /**
   * Fetches a single Loadix unit by its ID.
   * (Placeholder function - replace with actual data fetching)
   */
  async getLoadixUnitById(unitId: string): Promise<LoadixUnit | undefined> {
    console.log(`Fetching Loadix unit by ID: ${unitId} (mock)`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockLoadixUnits.find(unit => unit.id === unitId);
  },

   /**
   * Creates a new Loadix unit.
   * (Placeholder function - replace with actual data creation)
   * @param unitData The data for the new Loadix unit.
   * @returns A promise resolving to the newly created LoadixUnit object.
   */
   async createLoadixUnit(unitData: Omit<LoadixUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoadixUnit> {
    console.log('Creating Loadix unit (mock)', unitData);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUnit: LoadixUnit = {
      id: `loadix-unit-${Date.now()}`, // Generate a simple mock ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...unitData,
      entityType: 'loadix-unit', // Ensure correct entityType
    };
    mockLoadixUnits.push(newUnit); // Add to mock data
    return newUnit;
  },

  /**
   * Updates an existing Loadix unit.
   * (Placeholder function - replace with actual data update)
   * @param unitId The ID of the unit to update.
   * @param updateData The data to update.
   * @returns A promise resolving when the update is complete.
   */
  async updateLoadixUnit(unitId: string, updateData: Partial<LoadixUnit>): Promise<void> {
    console.log(`Updating Loadix unit ID: ${unitId} (mock)`, updateData);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const unitIndex = mockLoadixUnits.findIndex(unit => unit.id === unitId);
    if (unitIndex !== -1) {
      mockLoadixUnits[unitIndex] = {
        ...mockLoadixUnits[unitIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      console.warn(`Mock Loadix unit with ID ${unitId} not found for update.`);
    }
  },

  /**
   * Deletes a Loadix unit by its ID.
   * (Placeholder function - replace with actual data deletion)
   * @param unitId The ID of the unit to delete.
   * @returns A promise resolving when the deletion is complete.
   */
  async deleteLoadixUnit(unitId: string): Promise<void> {
    console.log(`Deleting Loadix unit ID: ${unitId} (mock)`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const initialLength = mockLoadixUnits.length;
    // Filter out the unit to be deleted
    mockLoadixUnits.filter(unit => unit.id !== unitId);
     if (mockLoadixUnits.length === initialLength) {
        console.warn(`Mock Loadix unit with ID ${unitId} not found for deletion.`);
    }
  },
};