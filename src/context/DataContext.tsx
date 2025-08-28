import React, { createContext, useContext, useEffect, useState } from 'react';
import TravelService from '../lib/api/services/travelService';

export interface Hotel {
  id: string;
  backendId?: number;
  name: string;
  location: string;
  rating: number;
  pricePerNight: number;
  amenities: string[];
  image: string;
  description: string;
}

export interface Destination {
  id: string;
  backendId?: number;
  name: string;
  slug?: string;
  country: string;
  region?: string;
  description: string;
  language?: string;
  currency?: string;
  image: string;
  popularAttractions: string[];
}

export interface Package {
  id: string;
  name: string;
  destinations: string[];
  hotels: string[];
  duration: number;
  basePrice: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: string[];
  image: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'INDIVIDUAL' | 'B2B_CLIENT';
  companyName?: string;
  address: string;
  preferences: string[];
}

export interface Quotation {
  id: string;
  customerId: string;
  packageId: string;
  createdBy: string;
  createdAt: string;
  validUntil: string;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  notes: string;
}

interface DataContextType {
  // Hotels
  hotels: Hotel[];
  addHotel: (hotel: Omit<Hotel, 'id'>) => void;
  updateHotel: (id: string, hotel: Partial<Hotel>) => void;
  deleteHotel: (id: string) => void;
  
  // Destinations
  destinations: Destination[];
  addDestination: (destination: Omit<Destination, 'id'>) => void;
  updateDestination: (id: string, destination: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  
  // Packages
  packages: Package[];
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Quotations
  quotations: Quotation[];
  addQuotation: (quotation: Omit<Quotation, 'id'>) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    location: 'Bangkok, Thailand',
    rating: 5,
    pricePerNight: 200,
    amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    description: 'Luxury hotel in the heart of Bangkok'
  },
  {
    id: '2',
    name: 'Sunset Beach Resort',
    location: 'Phuket, Thailand',
    rating: 4,
    pricePerNight: 150,
    amenities: ['Beach Access', 'Pool', 'WiFi', 'Bar'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
    description: 'Beautiful beachfront resort'
  }
];

const mockDestinations: Destination[] = [];

const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Thailand Explorer',
    destinations: ['1', '2'],
    hotels: ['1', '2'],
    duration: 7,
    basePrice: 1500,
    inclusions: ['Flights', 'Hotels', 'Breakfast', 'Airport Transfer'],
    exclusions: ['Lunch', 'Dinner', 'Personal Expenses'],
    itinerary: ['Day 1: Arrival in Bangkok', 'Day 2-4: Bangkok sightseeing', 'Day 5-7: Phuket beaches'],
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500',
    description: 'Complete Thailand experience combining city and beach'
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1234567890',
    type: 'INDIVIDUAL',
    address: '123 Main St, New York',
    preferences: ['Beach', 'Culture']
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@corporatetravel.com',
    phone: '+1234567891',
    type: 'B2B_CLIENT',
    companyName: 'Corporate Travel Solutions',
    address: '456 Business Ave, Chicago',
    preferences: ['Business Travel', 'Conferences']
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [hotels, setHotels] = useState<Hotel[]>(mockHotels);
  const [destinations, setDestinations] = useState<Destination[]>(mockDestinations);
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Hotel methods
  const addHotel = (hotel: Omit<Hotel, 'id'>) => {
    setHotels(prev => [...prev, { ...hotel, id: Date.now().toString() }]);
  };

  const updateHotel = (id: string, hotel: Partial<Hotel>) => {
    setHotels(prev => prev.map(h => h.id === id ? { ...h, ...hotel } : h));
  };

  const deleteHotel = (id: string) => {
    setHotels(prev => prev.filter(h => h.id !== id));
  };

  // Destination methods
  const addDestination = (destination: Omit<Destination, 'id'> & { id: string }) => {
    setDestinations(prev => [...prev, destination]);
  };

  const updateDestination = (id: string, destination: Partial<Destination>) => {
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, ...destination } : d));
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
  };

  // Package methods
  const addPackage = (pkg: Omit<Package, 'id'>) => {
    setPackages(prev => [...prev, { ...pkg, id: Date.now().toString() }]);
  };

  const updatePackage = (id: string, pkg: Partial<Package>) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, ...pkg } : p));
  };

  const deletePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  // Customer methods
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...customer, id: Date.now().toString() }]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Quotation methods
  const addQuotation = (quotation: Omit<Quotation, 'id'>) => {
    setQuotations(prev => [...prev, { ...quotation, id: Date.now().toString() }]);
  };

  const updateQuotation = (id: string, quotation: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...quotation } : q));
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getDestinations({ page: 1, size: 12 });
        const items = res.data || [];
        // Ensure image exists for UI using placeholder
        const withImages = items.map((d) => ({
          id: String(d.id),
          backendId: Number(d.id),
          name: d.name,
          slug: d.slug,
          country: d.country,
          region: d.region,
          description: d.description,
          language: d.language,
          currency: d.currency,
          image: 'https://images.unsplash.com/photo-1755702525927-c0a7d6adb3a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
          popularAttractions: [],
        } as Destination));
        setDestinations(withImages);
      } catch (e) {
        console.error('Failed to load destinations', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getHotels({ page: 1, size: 12 });
        const items = res.data || [];
        const withImages = items.map((h: any) => {
          const amenitiesMap = (h.amenities || {}) as Record<string, any>;
          const amenityList = Object.entries(amenitiesMap)
            .filter(([, v]) => v === true || v === 'yes' || v === 'Yes' || v === 'YES')
            .map(([k]) => k);
          return {
            id: String(h.id),
            backendId: Number(h.id),
            name: h.name,
            location: h.address || '',
            rating: Number(h.starRating ?? 0),
            pricePerNight: 0,
            amenities: amenityList,
            image: 'https://images.unsplash.com/photo-1731080647266-85cf1bc27162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
            description: h.description || '',
          } as Hotel;
        });
        setHotels(withImages);
      } catch (e) {
        console.error('Failed to load hotels', e);
      }
    })();
  }, []);

  return (
    <DataContext.Provider value={{
      hotels, addHotel, updateHotel, deleteHotel,
      destinations, addDestination, updateDestination, deleteDestination,
      packages, addPackage, updatePackage, deletePackage,
      customers, addCustomer, updateCustomer, deleteCustomer,
      quotations, addQuotation, updateQuotation, deleteQuotation
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}