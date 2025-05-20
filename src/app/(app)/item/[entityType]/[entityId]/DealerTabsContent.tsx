// src/app/(app)/item/[entityType]/[entityId]/DealerTabsContent.tsx
"use client";

import * as React from 'react';
import type { Dealer, Comment } from '@/types';
import { TRACTOR_BRAND_OPTIONS, MACHINE_TYPE_OPTIONS } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  MapPin, MapIcon, Phone, Mail, Globe, User, Tag, Truck, Power, Info, Search as SearchIcon, Download, FileText as FileTextLucide, Building2, Briefcase, Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeProps } from '@/components/ui/badge'; 

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
    <div className={cn('flex items-start space-x-3 py-1.5', className)}>
      <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
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

  switch (status) {
    case 'hot':       return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'destructive', label: 'Chaud 🔥' };
    case 'warm':      return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'default',     label: 'Tiède 🌤️' };
    case 'cold':      return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'secondary',   label: 'Froid ❄️' };
    case 'converted': return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'success' as any, label: 'Converti ✅' };
    case 'lost':      return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'outline',     label: 'Perdu ❌' };
    default:          return { dotClassName: blueDot, connectorClassName: blueConnector, badgeVariant: 'outline',     label: 'Aucun' };
  }
};


const CommentCard: React.FC<{ comment: Comment; className?: string; isSearchResult?: boolean }> = ({ comment, className, isSearchResult }) => {
  const statusColors = getProspectionStatusTimelineColors(comment.prospectionStatusAtEvent); 
  return (
    <div className={cn(
      "flex items-start space-x-3 p-3 bg-card/60 backdrop-blur-sm rounded-md border border-border/30 shadow-xl w-72 transition-all duration-150",
      isSearchResult && "ring-2 ring-primary border-primary shadow-primary/30",
      className
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.avatarUrl || `https://placehold.co/40x40.png?text=${comment.userName.substring(0,1)}`} data-ai-hint="avatar placeholder" />
        <AvatarFallback>{comment.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground truncate">{comment.userName}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(comment.date).toLocaleDateString()} {new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
         {comment.prospectionStatusAtEvent && (
          <Badge variant={statusColors.badgeVariant} className="mt-1.5 text-xs px-2 py-0.5">
            Statut: {statusColors.label}
          </Badge>
        )}
        <p className="text-sm text-foreground/80 whitespace-pre-line mt-1.5 break-words">{comment.text}</p>
        {comment.imageUrl && (
          <div className="mt-2 rounded-md overflow-hidden border border-border/40 w-full max-w-xs">
            <Image src={comment.imageUrl} alt="Image de commentaire" width={300} height={200} className="object-cover" data-ai-hint="comment attachment" />
          </div>
        )}
        {comment.fileUrl && (
          <div className="mt-2">
            <a
              href={comment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              {comment.fileName || 'Télécharger le fichier'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


const DealerTabsContent: React.FC<{ dealer: Dealer }> = ({ dealer }) => {
    const [timelineSearchTerm, setTimelineSearchTerm] = React.useState('');
    const statusInfo = getProspectionStatusBadgeInfo(dealer.prospectionStatus);

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

    const timelineContainerRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeftStart, setScrollLeftStart] = React.useState(0);
    const DRAG_SPEED_MULTIPLIER = 1.5;

    const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = timelineContainerRef.current;
        if (!el ) return;
        
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
          // console.warn("Failed to release pointer capture:", error);
        }
        setIsDragging(false);
        document.body.style.userSelect = 'auto';
        if (el) el.style.cursor = 'grab'; // Check if el is still valid
    }, [isDragging]);


    return (
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4 bg-muted/50 p-1 h-auto">
      <TabsTrigger value="details" className="text-xs sm:text-sm px-2 py-1.5">Détails</TabsTrigger>
      <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 py-1.5">Contact & Commercial</TabsTrigger>
      <TabsTrigger value="prospection" className="text-xs sm:text-sm px-2 py-1.5">Suivi Prospection</TabsTrigger>
      <TabsTrigger value="media" className="text-xs sm:text-sm px-2 py-1.5">Médias</TabsTrigger>
      <TabsTrigger value="relations" className="text-xs sm:text-sm px-2 py-1.5">Relations</TabsTrigger>
    </TabsList>

    <TabsContent value="details" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Générales</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <DetailItem icon={MapPin} label="Adresse Complète" value={`${dealer.address || ''}, ${dealer.postalCode || ''} ${dealer.city || ''}, ${dealer.country || ''}`} />
                {dealer.department && <DetailItem icon={MapIcon} label="Département" value={dealer.department} />}
                 {dealer.geoLocation && (
                    <div className="h-48 w-full bg-muted rounded-md overflow-hidden shadow-inner border border-border/30" data-ai-hint="map preview">
                        <Image
                        src={`https://placehold.co/800x300.png?text=Carte+pour+${encodeURIComponent(dealer.name)}`}
                        alt={`Carte pour ${dealer.name}`}
                        width={800}
                        height={300}
                        className="object-cover h-full w-full"
                        data-ai-hint="map location"
                        />
                    </div>
                )}
                 {!dealer.geoLocation && <p className="text-sm text-muted-foreground italic">Géolocalisation non disponible.</p>}
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="contact" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Coordonnées</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <DetailItem icon={Phone} label="Téléphone" value={dealer.phone} />
                {dealer.fax && <DetailItem icon={Info} label="Fax" value={dealer.fax} />} 
                <DetailItem icon={Mail} label="Email" value={dealer.email} isEmail />
                <DetailItem icon={Globe} label="Site Web" value={dealer.website} isLink />
                <DetailItem icon={User} label="Personne à contacter" value={dealer.contactPerson} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Informations Commerciales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {dealer.brandSign && <DetailItem icon={Building2} label="Enseigne" value={dealer.brandSign} />}
                {dealer.branchName && <DetailItem icon={Briefcase} label="Succursale" value={dealer.branchName} />}
                <DetailItem icon={Tag} label="Services Proposés" value={dealer.servicesOffered} />
                <DetailItem icon={Truck} label="Marques de Tracteurs Distribuées" value={dealer.tractorBrands?.map(value => TRACTOR_BRAND_OPTIONS.find(opt => opt.value === value)?.label || value)} />
                <DetailItem icon={Power} label="Types de Machines Gérées" value={dealer.machineTypes?.map(value => MACHINE_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value)} />
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="prospection" className="space-y-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="font-bebas-neue text-primary text-xl">Suivi de Prospection</CardTitle>
                {dealer.prospectionStatus && <Badge variant={statusInfo.variant as any} className="text-sm px-3 py-1">{statusInfo.label}</Badge>}
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (texte, nom, date, statut)..."
                        value={timelineSearchTerm}
                        onChange={(e) => setTimelineSearchTerm(e.target.value)}
                        className="pl-10 bg-input/50 focus:bg-input border-border/70"
                    />
                </div>

                {filteredComments.length === 0 ? (
                    <p className="text-muted-foreground italic text-center py-6">
                        {timelineSearchTerm ? `Aucun commentaire trouvé pour "${timelineSearchTerm}".` : 'Aucun commentaire de suivi pour le moment.'}
                    </p>
                ) : (
                    <div
                        ref={timelineContainerRef}
                        className="w-full pb-4 cursor-grab overflow-x-auto relative pt-10 select-none" 
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUpOrCancel}
                        onPointerCancel={onPointerUpOrCancel} 
                        style={{ userSelect: isDragging ? 'none' : 'auto' }} 
                    >
                        
                        <div className="flex space-x-20 pl-8 pr-8 min-w-max relative"> 
                            {/* Timeline central line - THEMED BLUE */}
                            <div className="absolute left-0 right-0 top-1/2 h-1.5 bg-primary rounded-full -translate-y-1/2"></div>

                            {filteredComments.map((comment, index) => {
                                const timelineStatusColors = getProspectionStatusTimelineColors(comment.prospectionStatusAtEvent);
                                return (
                                <div
                                    key={comment.date + index} 
                                    className={cn(
                                        "relative flex items-center group z-10", 
                                        index % 2 === 0 ? "flex-col" : "flex-col-reverse mt-8" 
                                    )}
                                >
                                    <CommentCard
                                        comment={comment}
                                        className={cn(
                                            "shadow-xl", 
                                            index % 2 === 0 ? "mb-5" : "mt-5" 
                                        )}
                                        isSearchResult={timelineSearchTerm.trim() !== ''}
                                    />
                                   
                                    <div className={cn( // Connector
                                        "w-px opacity-100 group-hover:opacity-100 transition-opacity", 
                                        timelineStatusColors.connectorClassName, 
                                        index % 2 === 0 ? "h-10" : "h-10" 
                                    )}></div>
                                    
                                    <div className={cn( // Dot
                                      "w-4 h-4 rounded-full border-2 group-hover:scale-125 group-hover:shadow-primary/50 transition-all duration-150 z-10", 
                                      timelineStatusColors.dotClassName
                                    )}></div>
                                    <div className={cn( // Date
                                        "text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm z-10",
                                        index % 2 === 0 ? "mt-2" : "mb-2" 
                                    )}>
                                        {new Date(comment.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            )})}
                        </div>
                         <div className="h-1" /> 
                    </div>
                )}
                 <Alert variant="default" className="mt-6 text-xs bg-accent/10 border-accent/30 text-accent-foreground/80">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertDescription>L'ajout de nouveaux commentaires avec médias se fait via le formulaire de modification du concessionnaire.</AlertDescription>
                 </Alert>
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="media" className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Galerie d'Images</CardTitle></CardHeader>
        <CardContent>
          {(!dealer.galleryUris || dealer.galleryUris.length === 0) ? (
            <p className="text-muted-foreground italic">Aucune image dans la galerie.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
        <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Documents</CardTitle></CardHeader>
        <CardContent>
          {(!dealer.documentUris || dealer.documentUris.length === 0) ? (
            <p className="text-muted-foreground italic">Aucun document.</p>
          ) : (
            <ul className="space-y-2">
              {dealer.documentUris.map((uri, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FileTextLucide className="h-4 w-4 text-muted-foreground" />
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

    <TabsContent value="relations" className="space-y-4">
        <Card>
            <CardHeader><CardTitle className="font-bebas-neue text-primary text-xl">Entités Liées</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <p className="text-muted-foreground italic">Fonctionnalité de liaison à implémenter.</p>
                {dealer.relatedSiteIds && dealer.relatedSiteIds.length > 0 && (
                    <DetailItem icon={Factory} label="Sites de Méthanisation Liés" value={dealer.relatedSiteIds.map(id => <Link key={id} href={`/item/methanisation-site/${id}`} className="text-primary hover:underline block">Site {id.substring(0,8)}...</Link>)} />
                )}
            </CardContent>
        </Card>
    </TabsContent>
  </Tabs>
)};

export default DealerTabsContent;
    
