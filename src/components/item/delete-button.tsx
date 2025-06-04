"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteDealer } from '@/services/dealerService';
import { deleteMethanisationSite } from '@/services/methanisationSiteService';
import type { EntityType } from '@/types';

interface DeleteButtonProps {
  entityId: string;
  entityType: EntityType;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ entityId, entityType }) => {
  const router = useRouter();

  const handleDeleteEntity = async () => {
    if (entityType === 'dealer') {
      try {
        await deleteDealer(entityId);
        router.push('/directory'); // Redirect after successful deletion
      } catch (error) {
        console.error("Error deleting dealer:", error);
        // Optionally, show an error message to the user
      }
    } else if (entityType === 'methanisation-site') {
      try {
        await deleteMethanisationSite(entityId);
        router.push('/directory'); // Redirect after successful deletion
      } catch (error) {
        console.error("Error deleting methanisation site:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  return (
    <Button variant="destructive" onClick={handleDeleteEntity}>
      Supprimer
    </Button>
  );
};

export default DeleteButton;