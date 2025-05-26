import React, { useState } from 'react';
import { MethanisationSite, Comment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns'; // Assuming date-fns for date formatting
// Assuming you have a methanisationSiteService with an addCommentToSite function
import methanisationSiteService from '@/services/methanisationSiteService'; // Import as default
import { useAuth } from '@/context/auth-context';
interface MethanisationSiteActivitiesTabProps {
  site: MethanisationSite;
}

export default function MethanisationSiteActivitiesTab({
  site
}: MethanisationSiteActivitiesTabProps) {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Get the current user from your auth context

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !user?.displayName) {
      // Basic validation and ensure user is logged in
      return;
    }

    setIsSubmitting(true);
    const comment: Partial<Comment> = {
      userName: user.displayName, // Use the logged-in user's name
      date: new Date().toISOString(), // Use current date
      text: newCommentText.trim(),
      // Add other fields if needed, like image/file URLs
    };

    try {
      await methanisationSiteService.addCommentToSite(site.id, comment);
      setNewCommentText(''); // Clear the textarea on success
      // Optionally show a success toast
    } catch (error) {
      console.error('Error adding comment:', error);
      // Optionally show an error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section for adding a new activity/comment */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une nouvelle activité ou commentaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Décrivez l'activité ou laissez un commentaire..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={4}
          />
          {/* Add file/image upload functionality here if needed */}
          <Button onClick={handleAddComment} disabled={!newCommentText.trim() || isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Ajouter l\'activité'}
          </Button>
        </CardContent>
      </Card>

      {/* Section for displaying existing activities/comments */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des activités et commentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {site.comments && site.comments.length > 0 ? (
            site.comments
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
              .map((comment, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{comment.userName}</span>
                    <span>{format(new Date(comment.date), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <p className="mt-2 text-sm">{comment.text}</p>
                  {/* Display images/files if they exist */}
                  {/* {comment.imageUrl && <img src={comment.imageUrl} alt="Activity image" className="mt-2 max-h-40" />} */}
                  {/* {comment.fileUrl && comment.fileName && (
                    <a href={comment.fileUrl} download={comment.fileName} className="text-blue-500 hover:underline mt-2 block text-sm">
                      Télécharger : {comment.fileName}
                    </a>
                  )} */}
                   {/* You might want to display prospectionStatusAtEvent if it exists */}
                   {/* {comment.prospectionStatusAtEvent && (
                       <p className="mt-1 text-xs text-gray-500">Statut de prospection lors de l'événement : {comment.prospectionStatusAtEvent}</p>
                   )} */}
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité ou commentaire enregistré pour l'instant.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}