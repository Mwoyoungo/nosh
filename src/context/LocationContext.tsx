/**
 * Location Context
 * Manages browse location state shared between Feed and Explore pages
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BrowseLocation {
  lat: number;
  lng: number;
  locationName: string;
}

interface LocationContextType {
  browseLocation: BrowseLocation | null;
  setBrowseLocation: (location: BrowseLocation | null) => void;
  clearBrowseLocation: () => void;
  isBrowsing: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [browseLocation, setBrowseLocationState] = useState<BrowseLocation | null>(null);

  // Load browse location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('browse_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        setBrowseLocationState(parsed);
      }
    } catch (error) {
      console.error('Error loading browse location:', error);
    }
  }, []);

  const setBrowseLocation = (location: BrowseLocation | null) => {
    setBrowseLocationState(location);

    // Save to localStorage
    if (location) {
      localStorage.setItem('browse_location', JSON.stringify(location));
    } else {
      localStorage.removeItem('browse_location');
    }
  };

  const clearBrowseLocation = () => {
    setBrowseLocation(null);
  };

  const isBrowsing = browseLocation !== null;

  return (
    <LocationContext.Provider
      value={{
        browseLocation,
        setBrowseLocation,
        clearBrowseLocation,
        isBrowsing,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
