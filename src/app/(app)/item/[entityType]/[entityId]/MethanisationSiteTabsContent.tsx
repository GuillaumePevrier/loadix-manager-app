// src/app/(app)/item/[entityType]/[entityId]/MethanisationSiteTabsContent.tsx
"use client";

import * as React from 'react';
import type { MethanisationSite, Comment } from '@/types'; // Pensez à vérifier que Comment inclut bien statusAtEvent
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  MapIcon,
  Phone,
  Mail,
  Globe,
  User,
  Tag,
  Truck,
  Power,
  Info,
  Search as SearchIcon,
  Download,
  FileText as FileTextLucide,
  Building2,
  Briefcase,
  Factory,
  PlusCircle,
  Trash2,
  Loader2,
  Send,
  Printer,
  CalendarDays, // ← import ajouté
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeProps } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  addCommentToMethanisationSite,
  deleteCommentFromMethanisationSite,
} from '@/services/methanisationSiteService';
import Image from 'next/image';

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

// Import de DetailItem (assumé défini ailleurs dans votre code)
import { DetailItem } from '@/components/item/DetailItem';


// --- Helpers pour les statuts des sites ---

const getSiteStatusBadgeInfo = (
  status?: MethanisationSite['status']
): { variant: BadgeProps['variant']; label: string } => {
  switch (status) {
    case 'active':
      return { variant: 'success' as any, label: 'Actif ✅' };
    case 'construction':
      return { variant: 'default', label: 'Construction 🏗️' };
    case 'planned':
      return { variant: 'secondary', label: 'Planifié 📝' };
    case 'inactive':
      return { variant: 'outline', label: 'Inactif 💤' };
    case 'maintenance':
      return { variant: 'default', label: 'Maintenance 🛠️' };
    default:
      return { variant: 'outline', label: 'Aucun statut' };
  }
};

const getSiteStatusTimelineColors = (
  status?: MethanisationSite['status']
): {
  dotClassName: string;
  connectorClassName: string;
  badgeVariant: BadgeProps['variant'];
  label: string;
} => {
  const blueDot = 'bg-primary border-background shadow-md';
  const blueConnector = 'bg-primary';

  const statusInfo = getSiteStatusBadgeInfo(status);

  return {
    dotClassName: blueDot,
    connectorClassName: blueConnector,
    badgeVariant: statusInfo.variant,
    label: statusInfo.label,
  };
};


// --- Composant de carte de commentaire (adapté aux sites) ---

interface SiteCommentCardProps {
  comment: Comment;
  className?: string;
  isSearchResult?: boolean;
  onDelete: () => void;
  statusAtEvent?: MethanisationSite['status'];
}

const CommentCardForSite: React.FC<SiteCommentCardProps> = ({
  comment,
  className,
  isSearchResult,
  onDelete,
  statusAtEvent,
}) => {
  const statusColors = getSiteStatusTimelineColors(statusAtEvent);

  return (
    <div
      className={cn(
        "relative flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-card/60 backdrop-blur-sm rounded-md border border-border/30 shadow-xl w-64 md:w-72 transition-all duration-150 group",
        isSearchResult && "ring-2 ring-primary border-primary shadow-primary/30",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0.5 right-0.5 md:top-1 md:right-1 h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onClick={onDelete}
        title="Supprimer le commentaire"
        data-comment-id={comment.id} // Add data attribute for easy inspection
      >
        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
      </Button>
      <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
        <AvatarImage
          src={
            comment.avatarUrl ||
            `https://placehold.co/40x40.png?text=${
              comment.userName?.substring(0, 1) || "U"
            }`
          }
          data-ai-hint="avatar placeholder"
        />
        <AvatarFallback>
          {comment.userName?.substring(0, 2).toUpperCase() || "??"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm font-medium text-foreground truncate">
            {comment.userName}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {comment.date
            ? new Date(comment.date).toLocaleDateString()
            : "Date inconnue"}{" "}
          {comment.date
            ? new Date(comment.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
        {statusAtEvent && (
          <Badge
            variant={statusColors.badgeVariant}
            className="mt-1 text-xs px-1.5 py-0.5 md:mt-1.5 md:px-2"
          >
            Statut : {statusColors.label}
          </Badge>
        )}
        <p className="text-xs md:text-sm text-foreground/80 whitespace-pre-line mt-1 md:mt-1.5 break-words">
          {comment.text}
        </p>

        {comment.imageUrl && (
          <div className="mt-1.5 md:mt-2 rounded-md overflow-hidden border border-border/40 w-full max-w-[150px] md:max-w-xs">
            <Image
              src={comment.imageUrl}
              alt="Image de commentaire"
              width={300}
              height={200}
              className="object-cover"
              data-ai-hint="comment attachment"
            />
          </div>
        )}

        {comment.fileUrl && (
          <div className="mt-1.5 md:mt-2">
            <a
              href={comment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs md:gap-1.5 text-primary hover:underline"
            >
              <Download className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {comment.fileName || "Télécharger le fichier"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Composant principal de l’onglet MethanisationSiteTabsContent ---

interface MethanisationSiteTabsContentProps {
  methanisationSite: MethanisationSite;
  onDataRefresh: () => void;
}

const MethanisationSiteTabsContent: React.FC<MethanisationSiteTabsContentProps> = ({
  methanisationSite,
  onDataRefresh,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [timelineSearchTerm, setTimelineSearchTerm] = React.useState("");
  const statusInfo = getSiteStatusBadgeInfo(methanisationSite.status);

  const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  // On autorise undefined pour « aucun statut »
  // Assurez-vous que la valeur initiale est toujours une chaîne non vide qui correspond à un SelectItem value
  // pour éviter l'erreur "A <Select.Item /> must have a value prop that is not an empty string."
  const [newCommentStatus, setNewCommentStatus] = React.useState<
    MethanisationSite["status"] | 'none' // 'none' correspondra à l'option "Aucun"
  >((methanisationSite?.status as MethanisationSite['status'] | undefined) || 'none');
  const [isAddingComment, setIsAddingComment] = React.useState(false);

  const [commentToDelete, setCommentToDelete] = React.useState<Comment | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDeletingComment, setIsDeletingComment] = React.useState(false);

  const timelineContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftStart, setScrollLeftStart] = React.useState(0);
  const DRAG_SPEED_MULTIPLIER = 1.5;

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  React.useEffect(() => {
    // Each time the site changes, update the initial status of the new comment
    setNewCommentStatus((methanisationSite.status as MethanisationSite['status'] | undefined) || 'none');
  }, [methanisationSite]);

  const sortedComments = React.useMemo(
    () =>
      // Ensure comments array exists before sorting
      (methanisationSite.comments || [] as Comment[]).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [methanisationSite.comments]
  );

  const filteredComments = React.useMemo(() => {
    if (!timelineSearchTerm.trim()) return sortedComments;
    const lowerSearchTerm = timelineSearchTerm.toLowerCase();
    return sortedComments.filter((comment) =>
      comment.text.toLowerCase().includes(lowerSearchTerm) ||
      comment.userName.toLowerCase().includes(lowerSearchTerm) ||
      (comment.statusAtEvent &&
        getSiteStatusTimelineColors(comment.statusAtEvent).label
          .toLowerCase()
          .includes(lowerSearchTerm)) ||
      (comment.date &&
        new Date(comment.date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(lowerSearchTerm))
    );
  }, [sortedComments, timelineSearchTerm]);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = timelineContainerRef.current;
      if (!el) return;

      el.setPointerCapture(e.pointerId);
      setIsDragging(true);
      setStartX(e.pageX);
      setScrollLeftStart(el.scrollLeft);
      document.body.style.userSelect = "none";
      el.style.cursor = "grabbing";
    },
    []
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !timelineContainerRef.current) return;
      e.preventDefault();
      const el = timelineContainerRef.current;
      const deltaX = e.pageX - startX;
      el.scrollLeft = scrollLeftStart - deltaX * DRAG_SPEED_MULTIPLIER;
    },
    [isDragging, startX, scrollLeftStart]
  );

  const onPointerUpOrCancel = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = timelineContainerRef.current;
      if (!isDragging || !el) return;

      try {
        if (el.hasPointerCapture(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch (error) {
        console.warn("Impossible de relâcher le pointer capture :", error);
      }
      setIsDragging(false);
      document.body.style.userSelect = "auto";
      if (el) el.style.cursor = "grab";
    },
    [isDragging]
  );

  const handleNewCommentSubmit = async () => {
    if (!newCommentText.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
      });
      return;
    }
    setIsAddingComment(true);

    try {
      const userName = user?.name || "Utilisateur Anonyme";
      // On envoie `newCommentStatus` (ou undefined si aucun choix)
      await addCommentToMethanisationSite(
        methanisationSite.id,
        userName,
        newCommentText,
        newCommentStatus
      );
      toast({
        title: "Succès",
        description: "Commentaire ajouté et statut du site mis à jour.",
      });
      setNewCommentText("");
      setIsAddCommentDialogOpen(false);
      onDataRefresh();
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire :", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de l'ajout du commentaire.",
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteCommentRequest = (comment: Comment) => {
    setCommentToDelete(comment);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      await deleteCommentFromMethanisationSite(
        methanisationSite.id,
        commentToDelete
      );
      toast({ title: "Succès", description: "Commentaire supprimé." });
      setCommentToDelete(null);
      onDataRefresh();
    } catch (err) {
      console.error("Erreur lors de la suppression du commentaire :", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la suppression du commentaire.",
      });
    } finally {
      setIsDeletingComment(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-3 md:mb-4 bg-muted/50 p-1 h-auto">
        <TabsTrigger
          value="details"
          className="text-xs sm:text-sm px-2 py-1.5"
        >
          Détails
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className="text-xs sm:text-sm px-2 py-1.5"
        >
          Contact
        </TabsTrigger>
        <TabsTrigger
          value="suivi"
          className="text-xs sm:text-sm px-2 py-1.5"
        >
          Suivi
        </TabsTrigger>
        <TabsTrigger
          value="medias"
          className="text-xs sm:text-sm px-2 py-1.5"
        >
          Médias
        </TabsTrigger>
        <TabsTrigger
          value="relations"
          className="text-xs sm:text-sm px-2 py-1.5"
        >
          Relations
        </TabsTrigger>
      </TabsList>

      {/* Section Détails */}
      <TabsContent value="details" className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 pt-0">
            <DetailItem
              icon={MapPin}
              label="Adresse Complète"
              value={`${methanisationSite.address || ""}, ${
                methanisationSite.postalCode || ""
              } ${methanisationSite.city || ""}, ${methanisationSite.country || ""}`}
            />
            {methanisationSite.department && (
              <DetailItem
                icon={MapIcon}
                label="Département"
                value={methanisationSite.department}
              />
            )}
            {methanisationSite.geoLocation && googleMapsApiKey ? (
              <APIProvider apiKey={googleMapsApiKey}>
                <div
                  className="h-40 md:h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30"
                  data-ai-hint="map preview"
                >
                  <Map
                    defaultCenter={{
                      lat: methanisationSite.geoLocation.lat,
                      lng: methanisationSite.geoLocation.lng,
                    }}
                    defaultZoom={14}
                    gestureHandling={"none"}
                    disableDefaultUI={true}
                    mapId={`methanisationSiteDetailMap-${methanisationSite.id}`}
                    className="w-full h-full"
                  >
                    <AdvancedMarker
                      position={{
                        lat: methanisationSite.geoLocation.lat,
                        lng: methanisationSite.geoLocation.lng,
                      }}
                      title={methanisationSite.name}
                    >
                      <Pin
                        background={"hsl(var(--primary))"}
                        borderColor={"hsl(var(--primary-foreground))"}
                        glyphColor={"hsl(var(--primary-foreground))"}
                      />
                    </AdvancedMarker>
                  </Map>
                </div>
              </APIProvider>
            ) : methanisationSite.geoLocation && !googleMapsApiKey ? (
              <Alert variant="destructive" className="mt-1 text-xs">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Clé API Google Maps non configurée. Impossible d'afficher la
                  carte.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Géolocalisation non disponible.
              </p>
            )}
            {methanisationSite.capacity && (
              <DetailItem
                icon={Info}
                label="Capacité"
                value={methanisationSite.capacity}
              />
            )}
            {methanisationSite.startDate && (
              <DetailItem
                icon={CalendarDays}
                label="Date de mise en service"
                value={new Date(
                  methanisationSite.startDate
                ).toLocaleDateString()}
              />
            )}
            {methanisationSite.operator && (
              <DetailItem icon={User} label="Opérateur" value={methanisationSite.operator} />
            )}
            {methanisationSite.biogasProductionCapacity && (
              <DetailItem
                icon={Power}
                label="Production Biogaz (Nm³/h)"
                value={methanisationSite.biogasProductionCapacity}
              />
            )}
            {methanisationSite.injectionCapacity && (
              <DetailItem
                icon={Factory}
                label="Capacité d'Injection (Nm³/h)"
                value={methanisationSite.injectionCapacity}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Section Contact */}
      <TabsContent value="contact" className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {methanisationSite.phone && (
              <DetailItem
                icon={Phone}
                label="Téléphone"
                value={methanisationSite.phone}
              />
            )}
            {methanisationSite.email && (
              <DetailItem
                icon={Mail}
                label="Email"
                value={methanisationSite.email}
                isEmail
              />
            )}
            {methanisationSite.contactPerson && (
              <DetailItem
                icon={User}
                label="Personne à contacter"
                value={methanisationSite.contactPerson}
              />
            )}
            {methanisationSite.website && (
              <DetailItem
                icon={Globe}
                label="Site Web"
                value={methanisationSite.website}
                isLink
              />
            )}
            {methanisationSite.operator && (
              <DetailItem
                icon={User}
                label="Opérateur Principal"
                value={methanisationSite.operator}
              />
            )}
            {methanisationSite.contactDetails &&
              methanisationSite.contactDetails.length > 0 && (
                <DetailItem
                  icon={User}
                  label="Contacts Secondaires"
                  value={methanisationSite.contactDetails.map(
                    (contact, index) => (
                      <div key={index}>
                        {contact.name} ({contact.role}):{" "}
                        {contact.phone || contact.email}
                      </div>
                    )
                  )}
                />
              )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Section Suivi */}
      <TabsContent value="suivi" className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-3 p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">
              Suivi
            </CardTitle>
            {methanisationSite.status && (
              <Badge
                variant={statusInfo.variant as any}
                className="text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1"
              >
                {statusInfo.label}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="mb-3 md:mb-4 flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              <div className="relative flex-grow w-full animated-gradient-border-wrapper">
                <div className="relative flex items-center">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher commentaire (texte, nom, date, statut)…"
                    value={timelineSearchTerm}
                    onChange={(e) => setTimelineSearchTerm(e.target.value)}
                    className="pl-9 md:pl-10 bg-card border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none h-9 md:h-10 text-sm rounded-[calc(var(--radius)-1.5px)] placeholder:text-muted-foreground/70 w-full"
                  />
                </div>
              </div>
              <Dialog
                open={isAddCommentDialogOpen}
                onOpenChange={setIsAddCommentDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-9 md:h-10 text-xs sm:text-sm"
                  >
                    <PlusCircle className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    Ajouter un Suivi
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Nouveau Suivi</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-3">
                    <div>
                      <Label htmlFor="newCommentStatusDialog">
                        Nouveau Statut Site
                      </Label>
                      <Select
                        value={newCommentStatus ?? ""}
                        onValueChange={(value) =>
                          setNewCommentStatus(
                            value === "" ? undefined : (value as MethanisationSite['status'])
                          )
                        }
                      >
                        <SelectTrigger id="newCommentStatusDialog">
                          <SelectValue placeholder="Choisir un statut…" />
                        </SelectTrigger>
                        <SelectContent>
                           {/* Explicitly list and filter valid statuses */}
                           {['none', 'planned', 'construction', 'active', 'maintenance', 'inactive']
                            .filter(value => value !== '') // Ensure no empty strings get through
                            .map(value => (
                              <SelectItem key={value} value={value}>
                                {getSiteStatusBadgeInfo(value as MethanisationSite['status'] | 'none').label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                    </div>
                    <div>
                      <Label htmlFor="newCommentTextDialog">Commentaire</Label>
                      <Textarea
                        id="newCommentTextDialog"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Votre commentaire…"
                        rows={3}
                        className="bg-input/70 focus:bg-input text-sm"
                      />
                    </div>
                    {/* Champs d’upload de fichier/image si nécessaire */}
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNewCommentText("");
                          setNewCommentStatus(
                            methanisationSite.status ?? undefined
                          );
                        }}
                        className="w-full sm:w-auto"
                      >
                        Annuler
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleNewCommentSubmit}
                      disabled={isAddingComment || !newCommentText.trim()}
                      className="w-full sm:w-auto"
                    >
                      {isAddingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {isAddingComment ? "Ajout…" : "Ajouter"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {filteredComments.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-4 md:py-6 text-sm">
                {timelineSearchTerm
                  ? `Aucun commentaire trouvé pour “${timelineSearchTerm}”.`
                  : "Aucun commentaire de suivi pour le moment."}
              </p>
            ) : (
              <div
                ref={timelineContainerRef}
                className="w-full pb-3 md:pb-4 pt-8 md:pt-10 select-none overflow-x-auto cursor-grab"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUpOrCancel}
                onPointerCancel={onPointerUpOrCancel}
                style={{ userSelect: isDragging ? "none" : "auto" }}
              >
                <div className="relative min-w-max">
                  <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2 z-0"></div>
                  <div className="flex space-x-16 md:space-x-20 pl-6 pr-6 md:pl-8 md:pr-8 relative z-10">
                    {filteredComments.map((comment, index) => {
                      const timelineStatusColors = getSiteStatusTimelineColors(
                        comment.statusAtEvent
                      );
                      const isCurrentCommentHighlighted =
                        timelineSearchTerm.trim() !== "" &&
                        filteredComments.some(
                          (fc) =>
                            fc.date === comment.date &&
                            fc.text === comment.text &&
                            fc.userName === comment.userName &&
                            fc.statusAtEvent === comment.statusAtEvent
                        );
                      return (
                        <div
                          key={`${comment.date}-${comment.userName}-${index}`}
                          className={cn(
                            "relative flex items-center group z-10",
                            index % 2 === 0
                              ? "flex-col"
                              : "flex-col-reverse mt-8 md:mt-8"
                          )}
                        >
                          <CommentCardForSite
                            comment={comment}
                            className={cn(
                              "shadow-xl",
                              index % 2 === 0 ? "mb-5" : "mt-5",
                              isCurrentCommentHighlighted &&
                                "ring-2 ring-primary border-primary shadow-primary/30"
                            )}
                            isSearchResult={isCurrentCommentHighlighted}
                            onDelete={() =>
                              handleDeleteCommentRequest(comment)
                            }
                            statusAtEvent={comment.statusAtEvent}
                          />

                          <div
                            className={cn(
                              "w-px opacity-100 group-hover:opacity-100 transition-opacity",
                              timelineStatusColors.connectorClassName,
                              index % 2 === 0 ? "h-10" : "h-10"
                            )}
                          ></div>

                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 group-hover:scale-125 group-hover:shadow-primary/50 transition-all duration-150 z-10",
                              timelineStatusColors.dotClassName
                            )}
                          ></div>
                          <div
                            className={cn(
                              "text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-sm backdrop-blur-sm z-10",
                              index % 2 === 0 ? "mt-2" : "mb-2"
                            )}
                          >
                            {comment.date
                              ? new Date(comment.date).toLocaleDateString(
                                  undefined,
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Date inconnue"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="h-1" />
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action
                est irréversible. Les fichiers associés (si existants) ne seront
                pas supprimés de Firebase Storage par cette action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel
                onClick={() => setCommentToDelete(null)}
                disabled={isDeletingComment}
                className="w-full sm:w-auto"
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDeleteComment}
                disabled={isDeletingComment}
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {isDeletingComment ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {isDeletingComment ? "Suppression…" : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>

      {/* Section Médias */}
      <TabsContent value="medias" className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">
              Galerie d'Images
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {(!methanisationSite.galleryUris ||
              methanisationSite.galleryUris.length === 0) ? (
              <p className="text-muted-foreground italic text-sm">
                Aucune image dans la galerie.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {methanisationSite.galleryUris.map((uri, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-muted rounded-md overflow-hidden shadow-inner"
                  >
                    <Image
                      src={
                        uri.startsWith("http")
                          ? uri
                          : `https://placehold.co/200x200.png?text=Image+${index +
                              1}`
                      }
                      alt={`Galerie image ${index + 1}`}
                      width={200}
                      height={200}
                      className="object-cover h-full w-full"
                      data-ai-hint="site photo"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {(!methanisationSite.documentUris ||
              methanisationSite.documentUris.length === 0) ? (
              <p className="text-muted-foreground italic text-sm">
                Aucun document.
              </p>
            ) : (
              <ul className="space-y-1.5 md:space-y-2">
                {methanisationSite.documentUris.map((uri, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-1.5 md:gap-2 text-sm"
                  >
                    <FileTextLucide className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                    <a
                      href={uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Document {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Section Relations */}
      <TabsContent value="relations" className="space-y-3 md:space-y-4">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">
              Entités Liées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 pt-0">
            {methanisationSite.relatedDealerIds &&
            methanisationSite.relatedDealerIds.length > 0 ? (
              <DetailItem
                icon={Factory}
                label="Concessionnaires Liés"
                value={methanisationSite.relatedDealerIds.map((id) => (
                  <Link
                    key={id}
                    href={`/item/dealer/${id}`}
                    className="text-primary hover:underline block"
                  >
                    Concessionnaire {id.substring(0, 8)}…
                  </Link>
                ))}
              />
            ) : (
              <p className="text-muted-foreground italic text-sm">
                Aucun concessionnaire lié.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MethanisationSiteTabsContent;
