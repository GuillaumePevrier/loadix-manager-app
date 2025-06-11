'use client';

import React, { useState, useEffect } from 'react';

const RealTimeInfoCard: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    return () => {
      clearInterval(timer); // Clean up the interval on component unmount
    };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Geolocation permission denied.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable.");
              break;
            case error.TIMEOUT:
              setLocationError("Geolocation request timed out.");
              break;
            default:
              setLocationError("An unknown error occurred with geolocation.");
          }
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto">
      <h3 className="text-lg font-semibold text-foreground mb-4">Current Time & Date</h3>
      <div className="text-muted-foreground text-sm">
        <p>Date: <span className="text-foreground font-medium">{formatDate(currentDateTime)}</span></p>
        <p>Time: <span className="text-foreground font-medium">{formatTime(currentDateTime)}</span></p>
      </div>
      <div className="mt-4 text-muted-foreground text-sm">
        {location ? (
          <>
            <p>Latitude: <span className="text-foreground font-medium">{location.latitude.toFixed(6)}</span></p>
            <p>Longitude: <span className="text-foreground font-medium">{location.longitude.toFixed(6)}</span></p>
          </>
        ) : locationError ? <p className="text-destructive">{locationError}</p> : <p>Fetching location...</p>}
      </div>
    </div>
  );
};

export default RealTimeInfoCard;