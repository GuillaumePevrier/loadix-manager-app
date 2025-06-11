'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import type { Comment } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimelineProps {
  comments: Comment[];
}

const Timeline: React.FC<TimelineProps> = ({ comments }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Tri chronologique des commentaires
  const sorted = useMemo(
    () => [...comments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [comments]
  );

  // Filtrage en fonction du terme de recherche
  const filtered = useMemo(
    () => sorted.filter(c => {
      const term = searchTerm.toLowerCase();
      return (
        c.text.toLowerCase().includes(term) ||
        c.userName.toLowerCase().includes(term) ||
        new Date(c.date).toLocaleString('fr-FR').toLowerCase().includes(term) ||
        c.prospectionStatusAtEvent?.toLowerCase().includes(term)
      );
    }),
    [sorted, searchTerm]
  );

  // Drag-scroll handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    el.setPointerCapture(e.pointerId);
    (el as any)._startX = e.clientX;
    (el as any)._scrollX = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!isDragging || !el) return;
    const dx = e.clientX - (el as any)._startX;
    el.scrollLeft = (el as any)._scrollX - dx;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(false);
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
    el.style.userSelect = 'auto';
  };

  // Initialisation du curseur
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  }, []);

  return (
    <div className="w-full">
      {/* Zone de recherche */}
      <Input
        placeholder="Rechercher dans le fil d'actualité..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4 w-1/2"
      />

      <ScrollArea className="w-full h-[300px] relative">
        <div
          ref={scrollRef}
          className="flex items-center h-full px-8 relative"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Ligne animée */}
          <div className="timeline-line absolute inset-x-0 top-1/2 h-1 z-0 rounded" />

          {filtered.map((c, i) => (
            <div key={c.id ?? i} className="relative z-10 flex flex-col items-center mx-10">
              {/* Bulle de commentaire */}
              <div className={`w-64 flex-shrink-0 overflow-hidden rounded-lg bg-white shadow-lg border border-transparent gradient-border-animation ${i % 2 === 0 ? 'mb-[4rem]' : 'mt-[4rem]'}`}>                
                <CardHeader className="px-4 py-2">
                  <h4 className="text-sm font-semibold text-gray-800">{c.userName}</h4>
                  <div className="text-xs text-gray-500">{new Date(c.date).toLocaleString('fr-FR')}</div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 text-sm text-gray-600">
                  {c.prospectionStatusAtEvent && (
                    <div className="mb-2">
                      <span className="font-semibold text-xs text-gray-700">Statut: </span>
                      <Badge variant="secondary" className="text-xs">{c.prospectionStatusAtEvent}</Badge>
                    </div>
                  )}
                  <p>{c.text}</p>
                </CardContent>
              </div>

              {/* Ligne verticale */}
              <div className="w-px h-24 bg-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

              {/* Point */}
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" />

              {/* Date alternée */}
              <div className={`absolute text-xs text-gray-500 whitespace-nowrap ${i % 2 === 0 ? 'top-[60%]' : 'bottom-[60%]'}`}>              
                {new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
              </div>
            </div>
          ))}

          {/* Espace final */}
          <div className="w-20 flex-shrink-0"></div>
        </div>
        <ScrollBar orientation="horizontal" className="absolute bottom-0 left-0 right-0" />

        {/* Styles animation */}
        <style jsx>{`
          .timeline-line {
            background: linear-gradient(270deg, #60a5fa, #3b82f6, #60a5fa);
            background-size: 600% 600%;
            animation: gradient-scroll 4s ease infinite;
          }
          @keyframes gradient-scroll {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          .gradient-border-animation {
            border-image-slice: 1;
            border-image-source: linear-gradient(to right, transparent, #3b82f6, transparent);
            border-width: 2px;
            border-style: solid;
          }
        `}</style>
      </ScrollArea>
    </div>
  );
};

export default Timeline;