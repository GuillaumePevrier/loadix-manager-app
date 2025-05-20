// This is a client component
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { EntityType } from '@/types';
import { deleteDealer } from '@/services/dealerService'; // Assuming you have a deleteDealer function
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteEntityButtonProps {
  entityType: EntityType;
  entityId: string;
}

const DeleteEntityButton: React.FC<DeleteEntityButtonProps> = ({
  entityType,
  entityId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Implement deletion logic based on entityType and call appropriate service function
      if (entityType === 'dealer') {
        await deleteDealer(entityId);
      } else {
        // Implement deletion for other entity types if needed
        console.warn(`Deletion not implemented for entity type: ${entityType}`);
        // For now, re-throw to simulate an error for unhandled types
        throw new Error(`Deletion not implemented for entity type: ${entityType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${entityType} with ID ${entityId}:`, error);
      // TODO: Show an error message to the user
    } finally {
      setIsLoading(false);
    }
    // Redirect only on successful deletion
    console.log(`${entityType} with ID ${entityId} deleted successfully.`);
    router.push('/directory');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isLoading}>
          {isLoading ? 'Suppression...' : 'Supprimer'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Cela supprimera définitivement cette entité et retirera ses données de nos serveurs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEntityButton;