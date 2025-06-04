// src/app/(app)/item/[entityType]/[entityId]/DealerTabsContent.tsx
"use client";

import * as React from 'react';
import type { Dealer, Comment } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS } from '@/types';
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
  MapPin, MapIcon, Phone, Mail, Globe, User, Tag, Truck, Power, Info, Search as SearchIcon, Download, FileText as FileTextLucide, Building2, Briefcase, Factory, PlusCircle, Trash2, Loader2, Send, Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeProps } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addCommentToDealer, deleteCommentFromDealer } from '@/services/dealerService';
import Image from 'next/image'; 

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';


const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value?: string | string[] | React.ReactNode | null;
  isLink?: boolean;
  isEmail?: boolean;
  className?: string;
}> = ({ icon: Icon, label, value, isLink, isEmail, className }) => {
  if (!value && typeof value !== 'boolean' && typeof value !== 'number' && !(Array.isArray(value) && value.length > 0)) return null;

  const renderValue = () => {
    if (React.isValidElement(value)) {
        return value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">
              {v}
            </Badge>
          ))}
        </div>
      );
    }
    if (typeof value === 'string') {
      if (isLink) {
        return (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      if (isEmail) {
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline break-all text-sm"
          >
            {value}
          </a>
        );
      }
      return <span className="text-foreground/90 break-words text-sm">{value}</span>;
    }
     if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic text-sm">Non spécifié</span>;
    }
    return <span className="text-foreground/90 break-words text-sm">{String(value)}</span>;
  };

  return (
    <div className={cn('flex items-start space-x-2 md:space-x-3 py-1 md:py-1.5', className)}>
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-0.5 md:mt-1" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {renderValue()}
      </div>
    </div>
  );
};

const getProspectionStatusBadgeInfo = (
  status?: Dealer['prospectionStatus']
): { variant: BadgeProps['variant']; label: string } => {
  switch (status) {
    case 'hot':
      return { variant: 'destructive', label: 'Chaud 🔥' };
    case 'warm':
      return { variant: 'default', label: 'Tiède 🌤️' }; 
    case 'cold':
      return { variant: 'secondary', label: 'Froid ❄️' }; 
    case 'converted':
      return { variant: 'success' as any, label: 'Converti ✅' }; 
    case 'lost':
      return { variant: 'outline', label: 'Perdu ❌' }; 
    default:
      return { variant: 'outline', label: 'Aucun statut' };
  }
};

const getProspectionStatusTimelineColors = (status?: Dealer['prospectionStatus']): { dotClassName: string; connectorClassName: string; badgeVariant: BadgeProps['variant']; label: string } => {
  const blueDot = 'bg-primary border-background shadow-md'; 
  const blueConnector = 'bg-primary';

  const statusInfo = getProspectionStatusBadgeInfo(status);

  return { 
    dotClassName: blueDot, 
    connectorClassName: blueConnector, 
    badgeVariant: statusInfo.variant, 
    label: statusInfo.label 
  };
};


interface CommentCardProps {
    comment: Comment;
    className?: string;
    isSearchResult?: boolean;
    onDelete: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, className, isSearchResult, onDelete }) => {
  const statusColors = getProspectionStatusTimelineColors(comment.prospectionStatusAtEvent); 
  return (
    <div className={cn(
      "relative flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-card/60 backdrop-blur-sm rounded-md border border-border/30 shadow-xl w-64 md:w-72 transition-all duration-150 group", 
      isSearchResult && "ring-2 ring-primary border-primary shadow-primary/30",
      className
    )}>
       <Button
        variant="ghost"
        size="icon"
        className="absolute top-0.5 right-0.5 md:top-1 md:right-1 h-5 w-5 md:h-6 md:w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-20"
        onClick={onDelete}
        title="Supprimer le commentaire"
      >
        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
      </Button>
      <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
        <AvatarImage src={comment.avatarUrl || `https://placehold.co/40x40.png?text=${comment.userName.substring(0,1)}`} data-ai-hint="avatar placeholder" />
        <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm font-medium text-foreground truncate">{comment.userName}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
         {comment.prospectionStatusAtEvent && (
          <Badge variant={statusColors.badgeVariant} className="mt-1 text-xs px-1.5 py-0.5 md:mt-1.5 md:px-2">
            Statut: {statusColors.label}
          </Badge>
        )}
        <p className="text-xs md:text-sm text-foreground/80 whitespace-pre-line mt-1 md:mt-1.5 break-words">{comment.text}</p>
        {comment.imageUrl && (
          <div className="mt-1.5 md:mt-2 rounded-md overflow-hidden border border-border/40 w-full max-w-[150px] md:max-w-xs">
            <Image src={comment.imageUrl} alt="Image de commentaire" width={300} height={200} className="object-cover" data-ai-hint="comment attachment" />
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
              {comment.fileName || 'Télécharger le fichier'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


const DealerTabsContent: React.FC<{ dealer: Dealer; onDataRefresh: () => void; }> = ({ dealer, onDataRefresh }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [timelineSearchTerm, setTimelineSearchTerm] = React.useState('');
    const statusInfo = getProspectionStatusBadgeInfo(dealer.prospectionStatus);

    const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = React.useState(false);
    const [newCommentText, setNewCommentText] = React.useState('');
    const [newCommentProspectionStatus, setNewCommentProspectionStatus] = React.useState<Dealer['prospectionStatus']>(dealer.prospectionStatus || 'none');
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
      if (dealer) {
        setNewCommentProspectionStatus(dealer.prospectionStatus || 'none');
      }
    }, [dealer]);


    const sortedComments = React.useMemo(() =>
        (dealer.comments || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [dealer.comments]);

    const filteredComments = React.useMemo(() => {
        if (!timelineSearchTerm.trim()) return sortedComments;
        const lowerSearchTerm = timelineSearchTerm.toLowerCase();
        return sortedComments.filter(comment =>
            comment.text.toLowerCase().includes(lowerSearchTerm) ||
            comment.userName.toLowerCase().includes(lowerSearchTerm) ||
            (comment.prospectionStatusAtEvent && getProspectionStatusTimelineColors(comment.prospectionStatusAtEvent).label.toLowerCase().includes(lowerSearchTerm)) ||
            new Date(comment.date).toLocaleDateString().includes(lowerSearchTerm)
        );
    }, [sortedComments, timelineSearchTerm]);


    const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = timelineContainerRef.current;
        if (!el) return;
        
        el.setPointerCapture(e.pointerId);
        setIsDragging(true);
        setStartX(e.pageX);
        setScrollLeftStart(el.scrollLeft);
        document.body.style.userSelect = 'none'; 
        el.style.cursor = 'grabbing';
    }, []);

    const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || !timelineContainerRef.current) return;
        e.preventDefault(); 
        const el = timelineContainerRef.current;
        const deltaX = e.pageX - startX;
        el.scrollLeft = scrollLeftStart - (deltaX * DRAG_SPEED_MULTIPLIER);
    }, [isDragging, startX, scrollLeftStart, DRAG_SPEED_MULTIPLIER]);

    const onPointerUpOrCancel = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = timelineContainerRef.current;
        if (!isDragging || !el) return;
        
        try {
          if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
          }
        } catch (error) {
           console.warn("Failed to release pointer capture (might already be released):", error);
        }
        setIsDragging(false);
        document.body.style.userSelect = 'auto';
        if (el) el.style.cursor = 'grab';
    }, [isDragging]);


    const handleNewCommentSubmit = async () => {
        if (!newCommentText.trim()) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Le commentaire ne peut pas être vide.' });
            return;
        }
        setIsAddingComment(true);
        try {
            const userName = user?.name || "Utilisateur Anonyme";
            
            await addCommentToDealer(dealer.id, userName, newCommentText, newCommentProspectionStatus);
            toast({ title: 'Succès', description: 'Commentaire ajouté et statut du concessionnaire mis à jour.' });
            setNewCommentText('');
            setIsAddCommentDialogOpen(false);
            onDataRefresh(); 
        } catch (err) {
            console.error("Erreur lors de l'ajout du commentaire :", err);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de l\'ajout du commentaire.' });
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
            await deleteCommentFromDealer(dealer.id, commentToDelete);
            toast({ title: 'Succès', description: 'Commentaire supprimé.' });
            setCommentToDelete(null);
            onDataRefresh();
        } catch (err) {
            console.error("Erreur lors de la suppression du commentaire :", err);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la suppression du commentaire.' });
        } finally {
            setIsDeletingComment(false);
            setIsDeleteConfirmOpen(false);
        }
    };


    return (
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-3 md:mb-4 bg-muted/50 p-1 h-auto">
      <TabsTrigger value="details" className="text-xs sm:text-sm px-2 py-1.5">Détails</TabsTrigger>
      <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-1.5">Contact</TabsTrigger>
      <TabsTrigger value="prospection" className="text-xs sm:text-sm px-2 py-1.5">Suivi</TabsTrigger>
      <TabsTrigger value="media" className="text-xs sm:text-sm px-2 py-1.5">Médias</TabsTrigger>
      <TabsTrigger value="relations" className="text-xs sm:text-sm px-2 py-1.5">Relations</TabsTrigger>
    </TabsList>

    <TabsContent value="details" className="space-y-3 md:space-y-4">
        <Card>
            <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Informations Générales</CardTitle></CardHeader>
            <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 pt-0">
                <DetailItem icon={MapPin} label="Adresse Complète" value={`${dealer.address || ''}, ${dealer.postalCode || ''} ${dealer.city || ''}, ${dealer.country || ''}`} />
                {dealer.department && <DetailItem icon={MapIcon} label="Département" value={dealer.department} />}
                 {dealer.geoLocation && googleMapsApiKey ? (
                    <APIProvider apiKey={googleMapsApiKey}>
                        <div className="h-40 md:h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30" data-ai-hint="map preview">
                            <Map
                                defaultCenter={{ lat: dealer.geoLocation.lat, lng: dealer.geoLocation.lng }}
                                defaultZoom={14}
                                gestureHandling={'none'}
                                disableDefaultUI={true}
                                mapId={`dealerDetailMap-${dealer.id}`}
                                className="w-full h-full"
                            >
                                <AdvancedMarker
                                    position={{ lat: dealer.geoLocation.lat, lng: dealer.geoLocation.lng }}
                                    title={dealer.name}
                                >
                                   <Pin
                                      background={'hsl(var(--primary))'}
                                      borderColor={'hsl(var(--primary-foreground))'}
                                      glyphColor={'hsl(var(--primary-foreground))'}
                                    />
                                </AdvancedMarker>
                            </Map>
                        </div>
                    </APIProvider>
                ) : dealer.geoLocation && !googleMapsApiKey ? (
                     <Alert variant="destructive" className="mt-1 text-xs">
                        <Info className="h-4 w-4" />
                        <AlertDescription>Clé API Google Maps non configurée. Impossible d'afficher la carte.</AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Géolocalisation non disponible.</p>
                )}
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="contact" className="space-y-3 md:space-y-4">
        <Card>
            <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Coordonnées</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-3 p-3 md:p-4 pt-0">
                <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} />
                {dealer.fax && <DetailItem icon={Printer} label="Fax" value={dealer.fax} />} 
                <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail />
                <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink />
                <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Informations Commerciales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-3 p-3 md:p-4 pt-0">
                {dealer.brandSign && <DetailItem icon={Building2} label="Enseigne" value={dealer.brandSign} />}
                {dealer.branchName && <DetailItem icon={Briefcase} label="Succursale" value={dealer.branchName} />}
                <DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />
                <DetailItem icon={Truck} label="Marques de Tracteurs Distribuées" value={dealer.tractorBrands?.map(value => TRACTOR_BRAND_OPTIONS.find(opt => opt.value === value)?.label || value)} />
                <DetailItem icon={Power} label="Types de Machines Gérées" value={dealer.machineTypes?.map(value => MACHINE_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value)} />
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="prospection" className="space-y-3 md:space-y-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-3 p-3 md:p-4">
                <CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Suivi</CardTitle>
                {dealer.prospectionStatus && <Badge variant={statusInfo.variant as any} className="text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1">{statusInfo.label}</Badge>}
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
                <div className="mb-3 md:mb-4 flex flex-col sm:flex-row items-center gap-2 md:gap-3">
                    <div className="relative flex-grow w-full animated-gradient-border-wrapper">
                        <div className="relative flex items-center">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher commentaire (texte, nom, date, statut)..."
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
                                    <Label htmlFor="newCommentProspectionStatusDialog">Nouveau Statut Prospection</Label>
                                    <Select 
                                        value={newCommentProspectionStatus} 
                                        onValueChange={(value) => setNewCommentProspectionStatus(value as Dealer['prospectionStatus'])}
                                    >
                                        <SelectTrigger id="newCommentProspectionStatusDialog">
                                            <SelectValue placeholder="Choisir un statut..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Aucun</SelectItem>
                                            <SelectItem value="cold">Froid</SelectItem>
                                            <SelectItem value="warm">Tiède</SelectItem>
                                            <SelectItem value="hot">Chaud</SelectItem>
                                            <SelectItem value="converted">Converti</SelectItem>
                                            <SelectItem value="lost">Perdu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="newCommentTextDialog">Commentaire</Label>
                                    <Textarea
                                        id="newCommentTextDialog"
                                        value={newCommentText}
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        placeholder="Votre commentaire..."
                                        rows={3}
                                        className="bg-input/70 focus:bg-input text-sm"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                                <DialogClose asChild>
                                    <Button variant="ghost" onClick={() => { setNewCommentText(''); setNewCommentProspectionStatus(dealer.prospectionStatus || 'none'); }} className="w-full sm:w-auto">Annuler</Button>
                                </DialogClose>
                                <Button onClick={handleNewCommentSubmit} disabled={isAddingComment || !newCommentText.trim()} className="w-full sm:w-auto">
                                    {isAddingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {isAddingComment ? 'Ajout...' : 'Ajouter'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {filteredComments.length === 0 ? (
                    <p className="text-muted-foreground italic text-center py-4 md:py-6 text-sm">
                        {timelineSearchTerm ? `Aucun commentaire trouvé pour "${timelineSearchTerm}".` : 'Aucun commentaire de suivi pour le moment.'}
                    </p>
                ) : (
                    <div
                        ref={timelineContainerRef}
                        className="w-full pb-3 md:pb-4 pt-8 md:pt-10 select-none overflow-x-auto cursor-grab" 
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUpOrCancel}
                        onPointerCancel={onPointerUpOrCancel} 
                        style={{ userSelect: isDragging ? 'none' : 'auto' }} 
                    >
                        <div className="relative min-w-max">
                            <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2 z-0"></div>
                            <div className="flex space-x-16 md:space-x-20 pl-6 pr-6 md:pl-8 md:pr-8 relative z-10">
                                {filteredComments.map((comment, index) => {
                                    const timelineStatusColors = getProspectionStatusTimelineColors(comment.prospectionStatusAtEvent);
                                    const isCurrentCommentHighlighted = timelineSearchTerm.trim() !== '' && 
                                                                      filteredComments.some(fc => 
                                                                          fc.date === comment.date && 
                                                                          fc.text === comment.text && 
                                                                          fc.userName === comment.userName &&
                                                                          fc.prospectionStatusAtEvent === comment.prospectionStatusAtEvent
                                                                      );
                                    return (
                                    <div
                                        key={`${comment.date}-${comment.userName}-${index}`} 
                                        className={cn( 
                                            "relative flex items-center group z-10",
                                            index % 2 === 0 ? "flex-col" : "flex-col-reverse mt-8 md:mt-8"
                                        )}
                                    >
                                        <CommentCard
                                            comment={comment}
                                            className={cn(
                                                "shadow-xl", 
                                                index % 2 === 0 ? "mb-5" : "mt-5", 
                                                isCurrentCommentHighlighted && "ring-2 ring-primary border-primary shadow-primary/30"

                                            )}
                                            isSearchResult={isCurrentCommentHighlighted}
                                            onDelete={() => handleDeleteCommentRequest(comment)}
                                        />
                                    
                                        <div className={cn( 
                                            "w-px opacity-100 group-hover:opacity-100 transition-opacity", 
                                            timelineStatusColors.connectorClassName, 
                                            index % 2 === 0 ? "h-10" : "h-10"
                                        )}></div>
                                        
                                        <div className={cn( 
                                            "w-4 h-4 rounded-full border-2 group-hover:scale-125 group-hover:shadow-primary/50 transition-all duration-150 z-10", 
                                            timelineStatusColors.dotClassName
                                        )}></div>
                                        <div className={cn( 
                                            "text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-sm backdrop-blur-sm z-10", 
                                            index % 2 === 0 ? "mt-2" : "mb-2" 
                                        )}>
                                            {new Date(comment.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        </div>
                         <div className="h-1" /> 
                    </div>
                )}
            </CardContent>
        </Card>
         <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible. Les fichiers associés (si existants) ne seront pas supprimés de Firebase Storage par cette action.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel onClick={() => setCommentToDelete(null)} disabled={isDeletingComment} className="w-full sm:w-auto">Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDeleteComment} disabled={isDeletingComment} className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto">
                        {isDeletingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        {isDeletingComment ? 'Suppression...' : 'Supprimer'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </TabsContent>

    <TabsContent value="media" className="space-y-3 md:space-y-4">
      <Card>
        <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Galerie d'Images</CardTitle></CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {(!dealer.galleryUris || dealer.galleryUris.length === 0) ? (
            <p className="text-muted-foreground italic text-sm">Aucune image dans la galerie.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {dealer.galleryUris.map((uri, index) => (
                <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden shadow-inner">
                  <Image src={uri.startsWith('http') ? uri : `https://placehold.co/200x200.png?text=Image+${index+1}`} alt={`Galerie image ${index + 1}`} width={200} height={200} className="object-cover h-full w-full" data-ai-hint="dealer photo" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Documents</CardTitle></CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {(!dealer.documentUris || dealer.documentUris.length === 0) ? (
            <p className="text-muted-foreground italic text-sm">Aucun document.</p>
          ) : (
            <ul className="space-y-1.5 md:space-y-2">
              {dealer.documentUris.map((uri, index) => (
                <li key={index} className="flex items-center gap-1.5 md:gap-2 text-sm">
                  <FileTextLucide className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  <a href={uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Document {index + 1}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="relations" className="space-y-3 md:space-y-4">
        <Card>
            <CardHeader className="p-3 md:p-4"><CardTitle className="font-bebas-neue text-primary text-lg md:text-xl">Entités Liées</CardTitle></CardHeader>
            <CardContent className="space-y-2 md:space-y-3 p-3 md:p-4 pt-0">
                <p className="text-muted-foreground italic text-sm">Fonctionnalité de liaison à implémenter.</p>
                {dealer.relatedSiteIds && dealer.relatedSiteIds.length > 0 && (
                    <DetailItem icon={Factory} label="Sites de Méthanisation Liés" value={dealer.relatedSiteIds.map(id => <Link key={id} href={`/item/methanisation-site/${id}`} className="text-primary hover:underline block">Site {id.substring(0,8)}...</Link>)} />
                )}
            </CardContent>
        </Card>
    </TabsContent>
  </Tabs>
)};

export default DealerTabsContent;
    
