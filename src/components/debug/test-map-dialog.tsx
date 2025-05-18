
'use client';

import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

// Dynamically import Google Maps components
const APIProvider = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.APIProvider),
  { ssr: false, loading: () => <Loader2 className="animate-spin mx-auto my-4" /> }
);

const Map = dynamic(() =>
  import('@vis.gl/react-google-maps').then((mod) => mod.Map),
  { ssr: false, loading: () => <p>Chargement de la carte...</p> }
);

interface TestMapDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TestMapDialog({ isOpen, onOpenChange }: TestMapDialogProps) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Test de la Carte Google Maps</DialogTitle>
          <DialogDescription>
            Cette fenêtre affiche une carte simple pour vérifier la configuration de la clé API.
          </DialogDescription>
        </DialogHeader>
        <div className="p-1 h-[400px] w-full">
          {!googleMapsApiKey ? (
            <div className="flex items-center justify-center h-full text-destructive">
              Clé API Google Maps non configurée (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
            </div>
          ) : (
            <APIProvider apiKey={googleMapsApiKey}>
              <Map
                defaultCenter={{ lat: 48.8566, lng: 2.3522 }} // Paris
                defaultZoom={10}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
                mapId="testLoadixMap"
              />
            </APIProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
