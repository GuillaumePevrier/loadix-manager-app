"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteDealer } from '@/services/dealerService';
import type { EntityType } from '@/types';
import * as React from 'react';

interface DeleteButtonProps {
  entityId: string;
  entityType: EntityType;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ entityId, entityType }) => {
  const router = useRouter();

  const handleDeleteDealer = async () => {
    if (entityType === 'dealer') {
      try {
        await deleteDealer(entityId);
        router.push('/directory'); // Redirect after successful deletion
      } catch (error) {
        console.error("Error deleting dealer:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  if (entityType !== 'dealer') {
    return null; // Only render for dealers
  }

  return (
    <Button variant="destructive" onClick={handleDeleteDealer}>
      Supprimer
    </Button>
  );
};

export default DeleteButton;