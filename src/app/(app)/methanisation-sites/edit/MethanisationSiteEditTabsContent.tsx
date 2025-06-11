// src/components/methanisation-sites/MethanisationSiteEditTabsContent.tsx
import * as React from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
import type { MethanisationSite, Comment, MatterType } from '@/types';
import { geocodeAddress } from '@/services/geocodingService';
import { useToast } from '@/hooks/use-toast';
import {
  Search as SearchIcon,
  Download,
  PlusCircle,
  Trash2,
  Loader2 as Loader2Lucide,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { getDealers } from '@/services/dealerService';
import { useAuth } from '@/context/auth-context';

interface MethanisationSiteEditTabsContentProps {
  methanisationSite: MethanisationSite;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | {
      target: {
        name: string;
        value: any;
      };
    }) => void;
  onGeoLocationChange: (location: { lat: number; lng: number } | null) => void;
  onDataRefresh: () => void;
}

const getSiteStatusBadgeInfo = (
  status?: MethanisationSite['status'] | 'none'
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
    case 'none':
      return { variant: 'outline', label: 'Statut Inconnu' };
    default:
      return { variant: 'outline', label: 'Statut Inconnu' };
  }
};

const getSiteStatusTimelineColors = (
  status?: MethanisationSite['status'] | 'none'
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

interface SiteCommentCardProps {
  comment: Comment;
  className?: string;
  isSearchResult?: boolean;
  onDelete: () => void;
  statusAtEvent?: MethanisationSite['status'] | 'none';
}

const CommentCardForSite: React.FC<SiteCommentCardProps> = ({
  comment,
  className,
  isSearchResult,
  onDelete,
  statusAtEvent,
}) => {
  const commentDate = comment.date ? new Date(comment.date as any) : null;
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
        data-comment-id={comment.id}
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
          {commentDate
            ? commentDate.toLocaleDateString()
            : "Date inconnue"}{" "}
          {commentDate
            ? commentDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
        {statusAtEvent && statusAtEvent !== 'none' && (
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

const MethanisationSiteEditTabsContent: React.FC<MethanisationSiteEditTabsContentProps> = ({
  methanisationSite,
  handleInputChange,
  onGeoLocationChange,
  onDataRefresh,
}) => {
  const { toast } = useToast();
  const [isGeocoding, setIsGeocoding] = React.useState(false);

  const handleValidateAddress = async () => {
    setIsGeocoding(true);
    const addressComponents = {
      address: methanisationSite.address || "",
      city: methanisationSite.city || "",
      postalCode: methanisationSite.postalCode || "",
      country: methanisationSite.country || "",
    };

    const result = await geocodeAddress(addressComponents);

    if (result.success && result.location) {
      onGeoLocationChange(result.location);
      toast({
        title: "Adresse validée",
        description: `Localisation trouvée pour ${result.formattedAddress}`,
      });
    } else {
      toast({
        title: "Erreur de validation d'adresse",
        description: result.error || "Une erreur inconnue est survenue.",
        variant: "destructive",
      });
    }
    setIsGeocoding(false);
  };

  const site = methanisationSite;
  const { user } = useAuth();

  const [timelineSearchTerm, setTimelineSearchTerm] = React.useState("");
  const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = React.useState(false);
  const [newCommentText, setNewCommentText] = React.useState("");
  const [newCommentStatus, setNewCommentStatus] = React.useState<MethanisationSite['status'] | undefined>(
    methanisationSite.status ?? undefined
  );
  const [isAddingComment, setIsAddingComment] = React.useState(false);
  const [commentToDelete, setCommentToDelete] = React.useState<Comment | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isDeletingComment, setIsDeletingComment] = React.useState(false);

  // "Relations" tab state
  const [dealers, setDealers] = React.useState<Array<{ value: string; label: string }>>([]);
  const [loadingDealers, setLoadingDealers] = React.useState(true);

  const timelineContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftStart, setScrollLeftStart] = React.useState(0);

  const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = timelineContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftStart(el.scrollLeft);
    el.style.cursor = "grabbing";
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineContainerRef.current) return;
    const el = timelineContainerRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX;
    el.scrollLeft = scrollLeftStart - walk;
  }, [isDragging, startX, scrollLeftStart]);

  const onPointerUpOrCancel = React.useCallback(() => {
    const el = timelineContainerRef.current;
    if (!el) return;
    setIsDragging(false);
    el.style.cursor = "grab";
  }, []);

  const handleNewCommentSubmit = async () => {
    if (!newCommentText.trim() || !user || !methanisationSite.id) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }
    setIsAddingComment(true);

    const newComment: Partial<Comment> = {
      text: newCommentText,
      userId: user.uid,
      userName: user.displayName || "Utilisateur inconnu",
      userEmail: user.email || "email inconnu",
      avatarUrl: user.photoURL || "",
      date: new Date(),
      statusAtEvent: newCommentStatus,
    };

    try {
      await addCommentToMethanisationSite(methanisationSite.id, newComment as Comment);
      toast({
        title: "Succès",
        description: "Commentaire ajouté avec succès.",
      });
      setNewCommentText("");
      setNewCommentStatus(methanisationSite.status ?? undefined);
      setIsAddCommentDialogOpen(false);
      onDataRefresh();
    } catch (error) {
      console.error("Error adding comment to methanisation site:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'ajout du commentaire.",
        variant: "destructive",
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
    if (!commentToDelete || !methanisationSite.id) return;
    setIsDeletingComment(true);
    try {
      await deleteCommentFromMethanisationSite(methanisationSite.id, commentToDelete.id);
      toast({
        title: "Succès",
        description: "Commentaire supprimé avec succès.",
      });
      setCommentToDelete(null);
      setIsDeleteConfirmOpen(false);
      onDataRefresh();
    } catch (error) {
      console.error("Error deleting comment from methanisation site:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression du commentaire.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const sortedComments = React.useMemo(() => {
    if (!methanisationSite.comments) return [];
    const commentsCopy = [...methanisationSite.comments];
    return commentsCopy.sort((a, b) => {
      const getTime = (d: any) =>
        d instanceof Date ? d.getTime() : d.toDate ? d.toDate().getTime() : 0;
      return getTime(b.date) - getTime(a.date);
    });
  }, [methanisationSite.comments]);

  const filteredComments = React.useMemo(() => {
    if (!timelineSearchTerm) return sortedComments;
    const lower = timelineSearchTerm.toLowerCase();
    return sortedComments.filter((comment) => {
      const commentDate = comment.date
        ? new Date(comment.date as any).toLocaleDateString()
        : "";
      const commentTime = comment.date
        ? new Date(comment.date as any).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const statusLabel = getSiteStatusBadgeInfo(comment.statusAtEvent).label.toLowerCase();
      return (
        comment.text?.toLowerCase().includes(lower) ||
        comment.userName?.toLowerCase().includes(lower) ||
        commentDate.includes(lower) ||
        commentTime.includes(lower) ||
        statusLabel.includes(lower)
      );
    });
  }, [sortedComments, timelineSearchTerm]);

  // Fetch dealers data for MultiSelect
  React.useEffect(() => {
    const loadDealers = async () => {
      setLoadingDealers(true);
      try {
        const dealerList = await getDealers();
        setDealers(dealerList.map((dealer) => ({ value: dealer.id, label: dealer.name })));
      } catch (error) {
        console.error("Error fetching dealers:", error);
        toast({
          title: "Erreur",
          description: "Échec du chargement des concessionnaires.",
          variant: "destructive",
        });
      } finally {
        setLoadingDealers(false);
      }
    };
    loadDealers();
  }, [toast]);

  const matterTypeOptions: { value: MatterType; label: string }[] = [
    { value: 'agricultural_waste', label: 'Déchets agricoles' },
    { value: 'slurry', label: 'Lisier' },
    { value: 'food_waste', label: 'Déchets alimentaires' },
    { value: 'intermediate_crops', label: 'Cultures intermédiaires' },
    { value: 'industrial_organic_residues', label: 'Résidus industriels organiques' },
    // Add other matter types as needed based on your MatterType enum
  ];

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-3 md:mb-4 bg-muted/50 p-1 h-auto text-center">
        <TabsTrigger value="details" className="text-xs sm:text-sm px-2 py-1.5">Détails</TabsTrigger>
        <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-1.5">Contact</TabsTrigger>
        <TabsTrigger value="suivi" className="text-xs sm:text-sm px-2 py-1.5">Suivi Activité</TabsTrigger>
        <TabsTrigger value="medias" className="text-xs sm:text-sm px-2 py-1.5">Médias</TabsTrigger>
        <TabsTrigger value="relations" className="text-xs sm:text-sm px-2 py-1.5">Relations</TabsTrigger>
 {/* Section Suivi Technique */}
 <TabsTrigger
 value="technique"
 className="text-xs sm:text-sm px-2 py-1.5"
 >Suivi Technique</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du Site</Label>
              <Input
                id="name"
                name="name"
                value={site.name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={site.address || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Code Postal</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={site.postalCode || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  value={site.city || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Button onClick={handleValidateAddress} disabled={isGeocoding}>
                {isGeocoding ? <Loader2Lucide className="mr-2 h-4 w-4 animate-spin" /> : null} Valider l'adresse
              </Button>
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                name="country"
                value={site.country || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                name="department"
                value={site.department || ""}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations de Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={site.phone || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={site.email || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">Personne à Contacter</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={site.contactPerson || ""}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="suivi" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-3 p-3 md:p-4">
            <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Suivi</CardTitle>
            {site.status && (
              <Badge
                variant={getSiteStatusBadgeInfo(site.status).variant as any}
                className="text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1"
              >
                {getSiteStatusBadgeInfo(site.status).label}
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
              <Dialog open={isAddCommentDialogOpen} onOpenChange={setIsAddCommentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 md:h-10 text-xs sm:text-sm">
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
                      <Label htmlFor="newCommentStatusDialog">Nouveau Statut Site</Label>
                      <Select
                        value={newCommentStatus ?? ""}
                        onValueChange={(value) =>
                          setNewCommentStatus(value === "" ? undefined : (value as MethanisationSite['status']))
                        }
                      >
                        <SelectTrigger id="newCommentStatusDialog">
                          <SelectValue placeholder="Choisir un statut…" />
                        </SelectTrigger>
                        <SelectContent>
                          {['none', 'planned', 'construction', 'active', 'maintenance', 'inactive'].map(
                            (value) => (
                              <SelectItem key={value} value={value}>
                                {getSiteStatusBadgeInfo(value as MethanisationSite['status'] | 'none').label}
                              </SelectItem>
                            )
                          )}
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
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNewCommentText("");
                          setNewCommentStatus(site.status ?? undefined);
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
                        <Loader2Lucide className="mr-2 h-4 w-4 animate-spin" />
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
                      const timelineStatusColors = getSiteStatusTimelineColors(comment.statusAtEvent);
                      const isHighlighted =
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
                            index % 2 === 0 ? "flex-col" : "flex-col-reverse mt-8 md:mt-8"
                          )}
                        >
                          <CommentCardForSite
                            comment={comment}
                            className={cn(
                              "shadow-xl",
                              index % 2 === 0 ? "mb-5" : "mt-5",
                              isHighlighted && "ring-2 ring-primary border-primary shadow-primary/30"
                            )}
                            isSearchResult={isHighlighted}
                            onDelete={() => handleDeleteCommentRequest(comment)}
                            statusAtEvent={comment.statusAtEvent}
                          />

                          <div
                            className={cn(
                              "w-px opacity-100 group-hover:opacity-100 transition-opacity",
                              timelineStatusColors.connectorClassName,
                              "h-10"
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
                              ? new Date(comment.date).toLocaleDateString(undefined, {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
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

            <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible. Les fichiers associés (si existants) ne seront pas supprimés de Firebase
                  Storage par cette action.
                </AlertDialogDescription>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel onClick={() => setCommentToDelete(null)} disabled={isDeletingComment} className="w-full sm:w-auto">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDeleteComment} disabled={isDeletingComment} className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
                    {isDeletingComment ? <Loader2Lucide className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    {isDeletingComment ? "Suppression..." : "Supprimer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Section Suivi Technique */}
      <TabsContent value="technique" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Données Techniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentProduction">Production actuelle (m³)</Label>
              <Input
                id="currentProduction"
                name="currentProduction"
                type="number"
                value={site.currentProduction || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="maxCapacity">Capacité maximale (m³)</Label>
              <Input
                id="maxCapacity"
                name="maxCapacity"
                type="number"
                value={site.maxCapacity || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="creationYear">Année de création</Label>
              <Input
                id="creationYear"
                name="creationYear"
                type="number"
                value={site.creationYear || ""}
                onChange={handleInputChange}
                placeholder="e.g., 2021"
              />
            </div>
            <div>
              <Label htmlFor="injectedMatters">Matières injectées</Label>
              <MultiSelect
                options={matterTypeOptions}
                value={(site.injectedMatters || []) as string[]} // Cast to string[] for MultiSelect
                onValueChange={(selectedValues) => {
                  handleInputChange({
                    target: {
                      name: 'injectedMatters',
                      value: selectedValues as MatterType[], // Cast back to MatterType[]
                    },
                  });
                }}
                placeholder="Sélectionner les matières..."
              />
            </div>
          </CardContent>
        </Card>
 </TabsContent>
      <TabsContent value="medias" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Médias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic text-sm">
              La gestion des médias (photos, documents) sera disponible ici.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="relations" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Relations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Concessionnaires Associés</Label>
                <MultiSelect
 options={dealers || []} // Provide a default empty array
                  value={methanisationSite.relatedDealerIds || []}
                  onValueChange={(selectedValues) => {
                    handleInputChange({
                      target: {
                        name: 'relatedDealerIds',
                        value: selectedValues,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  placeholder={loadingDealers ? "Chargement..." : "Sélectionner des concessionnaires..."}
                  disabled={loadingDealers}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MethanisationSiteEditTabsContent;