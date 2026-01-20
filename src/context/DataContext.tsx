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
  typeId?: number;
  destinations: string[];
  hotels: string[];
  duration: number;
  basePrice: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: string[];
  image: string;
  description: string;
  validFrom?: string | null;
  validTo?: string | null;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  name?: string; // Optional compability
  type?: 'INDIVIDUAL' | 'B2B_CLIENT';
  companyName?: string;
  preferences?: string[];
}

export interface Quotation {
  id: string;
  title: string;
  customerId: string | number;
  customerName?: string;
  packageId: string | number;
  userId?: string | number; // Added to match backend
  createdBy: string;
  createdAt: string;
  bookingDate?: string;
  travelDate?: string;
  paxCount: number;
  validUntil: string;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  status: number | 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Hotel methods
  const addHotel = async (hotel: Omit<Hotel, 'id'>) => {
    try {
      const payload: any = {
        name: hotel.name,
        slug: hotel.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
        address: hotel.location,
        description: hotel.description,
        destinationId: 0, // Should be provided
        starRating: hotel.rating,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        amenities: hotel.amenities.reduce((acc, amenity) => ({ ...acc, [amenity]: 'yes' }), {}),
      };
      const created = await TravelService.createHotel(payload);
      const newHotel: Hotel = {
        id: String(created.id),
        backendId: Number(created.id),
        name: created.name,
        location: created.address || '',
        rating: Number(created.starRating || 0),
        pricePerNight: 0,
        amenities: Object.keys(created.amenities || {}).filter(k => {
          const v = (created.amenities as any)[k];
          return v === true || v === 'yes' || v === 'Yes' || v === 'YES';
        }),
        image: hotel.image,
        description: created.description || '',
      };
      setHotels(prev => [...prev, newHotel]);
    } catch (error) {
      console.error('Failed to create hotel', error);
      throw error;
    }
  };

  const updateHotel = async (id: string, hotel: Partial<Hotel>) => {
    try {
      const backendId = hotels.find(h => h.id === id)?.backendId || id;
      const payload: any = {
        name: hotel.name,
        address: hotel.location,
        description: hotel.description,
        starRating: hotel.rating,
        amenities: hotel.amenities?.reduce((acc, amenity) => ({ ...acc, [amenity]: 'yes' }), {}),
      };
      const updated = await TravelService.updateHotel(backendId, payload);
      setHotels(prev => prev.map(h => h.id === id ? {
        ...h,
        name: updated.name || h.name,
        location: updated.address || h.location,
        rating: Number(updated.starRating ?? h.rating),
        amenities: Object.keys(updated.amenities || {}).filter(k => {
          const v = (updated.amenities as any)[k];
          return v === true || v === 'yes' || v === 'Yes' || v === 'YES';
        }),
        description: updated.description || h.description,
      } : h));
    } catch (error) {
      console.error('Failed to update hotel', error);
      throw error;
    }
  };

  const deleteHotel = async (id: string) => {
    try {
      const backendId = hotels.find(h => h.id === id)?.backendId || id;
      await TravelService.archiveHotel(backendId);
      setHotels(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('Failed to delete hotel', error);
      throw error;
    }
  };

  // Destination methods
  const addDestination = async (destination: Omit<Destination, 'id'>) => {
    try {
      const payload: any = {
        name: destination.name,
        slug: destination.slug || destination.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
        country: destination.country,
        region: destination.region,
        description: destination.description,
        language: destination.language,
        currency: destination.currency,
      };
      const created = await TravelService.createDestination(payload);
      const newDestination: Destination = {
        id: String(created.id),
        backendId: Number(created.id),
        name: created.name,
        slug: created.slug,
        country: created.country,
        region: created.region,
        description: created.description,
        language: created.language,
        currency: created.currency,
        image: destination.image,
        popularAttractions: [],
      };
      setDestinations(prev => [...prev, newDestination]);
    } catch (error) {
      console.error('Failed to create destination', error);
      throw error;
    }
  };

  const updateDestination = async (id: string, destination: Partial<Destination>) => {
    try {
      const backendId = destinations.find(d => d.id === id)?.backendId || id;
      const payload: any = {
        name: destination.name,
        slug: destination.slug,
        country: destination.country,
        region: destination.region,
        description: destination.description,
        language: destination.language,
        currency: destination.currency,
      };
      const updated = await TravelService.updateDestination(backendId, payload);
      setDestinations(prev => prev.map(d => d.id === id ? {
        ...d,
        name: updated.name || d.name,
        slug: updated.slug || d.slug,
        country: updated.country || d.country,
        region: updated.region || d.region,
        description: updated.description || d.description,
        language: updated.language || d.language,
        currency: updated.currency || d.currency,
      } : d));
    } catch (error) {
      console.error('Failed to update destination', error);
      throw error;
    }
  };

  const deleteDestination = async (id: string) => {
    try {
      const backendId = destinations.find(d => d.id === id)?.backendId || id;
      await TravelService.archiveDestination(backendId);
      setDestinations(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete destination', error);
      throw error;
    }
  };

  // Package methods
  const addPackage = (pkg: Omit<Package, 'id'>) => {
    (async () => {
      try {
        const payload: any = {
          name: pkg.name,
          code: (pkg.name || '').toLowerCase().replace(/\s+/g, '-').slice(0, 32),
          description: pkg.description,
          type: pkg.typeId ?? 1,
          durationDays: pkg.duration,
          durationNights: Math.max((pkg.duration || 0) - 1, 0),
          validFrom: pkg.validFrom ?? null,
          validTo: pkg.validTo ?? null,
          destinationId: pkg.destinations?.[0] ? Number(pkg.destinations[0]) : undefined,
          hotelId: pkg.hotels?.[0] ? Number(pkg.hotels[0]) : undefined,
        };
        const created = await TravelService.createPackage(payload);
        const mapped: Package = {
          id: String(created.id),
          name: created.name,
          destinations: created.destinationId ? [String(created.destinationId)] : [],
          hotels: created.hotelId ? [String(created.hotelId)] : [],
          duration: Number(created.durationDays ?? payload.durationDays ?? 0),
          basePrice: 0,
          inclusions: [],
          exclusions: [],
          itinerary: [],
          image: pkg.image,
          description: created.description || pkg.description || '',
        };
        setPackages(prev => [...prev, mapped]);
      } catch (e) {
        console.error('Failed to create package', e);
      }
    })();
  };

  const updatePackage = (id: string, pkg: Partial<Package>) => {
    (async () => {
      try {
        const payload: any = {
          name: pkg.name,
          description: pkg.description,
          type: pkg.typeId,
          durationDays: pkg.duration,
          durationNights: typeof pkg.duration === 'number' ? Math.max(pkg.duration - 1, 0) : undefined,
          validFrom: pkg.validFrom,
          validTo: pkg.validTo,
          destinationId: pkg.destinations?.[0] ? Number(pkg.destinations[0]) : undefined,
          hotelId: pkg.hotels?.[0] ? Number(pkg.hotels[0]) : undefined,
        };
        const updated = await TravelService.updatePackage(id, payload);
        const mappedPartial: Partial<Package> = {
          name: updated?.name ?? pkg.name,
          destinations: (updated?.destinationId !== undefined)
            ? [String(updated.destinationId)]
            : pkg.destinations,
          hotels: (updated?.hotelId !== undefined)
            ? [String(updated.hotelId)]
            : pkg.hotels,
          duration: (updated?.durationDays !== undefined)
            ? Number(updated.durationDays)
            : pkg.duration,
          description: updated?.description ?? pkg.description,
        };
        setPackages(prev => prev.map(p => p.id === id ? { ...p, ...mappedPartial } : p));
      } catch (e) {
        console.error('Failed to update package', e);
      }
    })();
  };

  const deletePackage = (id: string) => {
    (async () => {
      try {
        const ok = await TravelService.archivePackage(id);
        if (ok) {
          setPackages(prev => prev.filter(p => p.id !== id));
        }
      } catch (e) {
        console.error('Failed to delete package', e);
      }
    })();
  };

  // Customer methods
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const payload: any = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        postalCode: customer.postalCode,
        companyName: customer.companyName,
        type: customer.type || 'INDIVIDUAL',
        preferences: customer.preferences,
      };

      const created = await TravelService.createCustomer(payload);

      const newCustomer: Customer = {
        id: String(created.id),
        firstName: created.firstName || customer.firstName,
        lastName: created.lastName || customer.lastName,
        name: created.firstName && created.lastName ? `${created.firstName} ${created.lastName}` : (created.name || customer.name || ''),
        email: created.email || customer.email,
        phone: created.phone || customer.phone,
        address: created.address || customer.address,
        city: created.city || customer.city,
        state: created.state || customer.state,
        country: created.country || customer.country,
        postalCode: created.postalCode || customer.postalCode,
        type: created.type || customer.type,
        companyName: created.companyName || customer.companyName,
        preferences: created.preferences || customer.preferences,
      };
      setCustomers(prev => [...prev, newCustomer]);
    } catch (error) {
      console.error('Failed to create customer', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const backendId = customers.find(c => c.id === id)?.id || id;
      const payload: any = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        postalCode: customer.postalCode,
        companyName: customer.companyName,
        type: customer.type,
        preferences: customer.preferences,
      };
      const updated = await TravelService.updateCustomer(backendId, payload);
      setCustomers(prev => prev.map(c => c.id === id ? {
        ...c,
        firstName: updated.firstName || c.firstName,
        lastName: updated.lastName || c.lastName,
        name: (updated.firstName && updated.lastName) ? `${updated.firstName} ${updated.lastName}` : (updated.name || c.name),
        email: updated.email || c.email,
        phone: updated.phone || c.phone,
        address: updated.address || c.address,
        city: updated.city || c.city,
        state: updated.state || c.state,
        country: updated.country || c.country,
        postalCode: updated.postalCode || c.postalCode,
        type: updated.type || c.type,
        companyName: updated.companyName ?? c.companyName,
        preferences: updated.preferences || c.preferences,
      } : c));
    } catch (error) {
      console.error('Failed to update customer', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const backendId = customers.find(c => c.id === id)?.id || id;
      await TravelService.archiveCustomer(backendId);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer', error);
      throw error;
    }
  };

  // Quotation methods
  const addQuotation = async (quotation: Omit<Quotation, 'id'>) => {
    try {
      const payload: any = {
        title: quotation.title,
        customerId: Number(quotation.customerId),
        packageId: Number(quotation.packageId),
        userId: Number(quotation.userId),
        createdBy: Number(quotation.userId || 1), // Fallback if needed
        bookingDate: quotation.bookingDate,
        travelDate: quotation.travelDate,
        paxCount: quotation.paxCount,
        validUntil: quotation.validUntil,
        totalPrice: quotation.totalPrice,
        discount: quotation.discount,
        finalPrice: quotation.finalPrice,
        status: quotation.status,
        notes: quotation.notes,
      };
      const created = await TravelService.createQuotation(payload);
      const newQuotation: Quotation = {
        id: String(created.id),
        title: created.title || quotation.title,
        customerId: String(created.customerId || quotation.customerId),
        packageId: String(created.packageId || quotation.packageId),
        userId: created.userId || quotation.userId,
        createdBy: String(created.createdBy || quotation.createdBy),
        createdAt: created.createdAt || quotation.createdAt,
        bookingDate: created.bookingDate || quotation.bookingDate,
        travelDate: created.travelDate || quotation.travelDate,
        paxCount: Number(created.paxCount || quotation.paxCount),
        validUntil: created.validUntil || quotation.validUntil,
        totalPrice: Number(created.totalPrice || quotation.totalPrice),
        discount: Number(created.discount || quotation.discount),
        finalPrice: Number(created.finalPrice || quotation.finalPrice),
        status: created.status ?? quotation.status,
        notes: created.notes || quotation.notes,
      };
      setQuotations(prev => [...prev, newQuotation]);
    } catch (error) {
      console.error('Failed to create quotation', error);
      throw error;
    }
  };

  const updateQuotation = async (id: string, quotation: Partial<Quotation>) => {
    try {
      const backendId = quotations.find(q => q.id === id)?.id || id;
      const payload: any = {
        customerId: quotation.customerId ? Number(quotation.customerId) : undefined,
        packageId: quotation.packageId ? Number(quotation.packageId) : undefined,
        validUntil: quotation.validUntil,
        totalPrice: quotation.totalPrice,
        discount: quotation.discount,
        finalPrice: quotation.finalPrice,
        status: quotation.status,
        notes: quotation.notes,
      };
      const updated = await TravelService.updateQuotation(backendId, payload);
      setQuotations(prev => prev.map(q => q.id === id ? {
        ...q,
        customerId: updated.customerId ? String(updated.customerId) : q.customerId,
        packageId: updated.packageId ? String(updated.packageId) : q.packageId,
        validUntil: updated.validUntil || q.validUntil,
        totalPrice: Number(updated.totalPrice ?? q.totalPrice),
        discount: Number(updated.discount ?? q.discount),
        finalPrice: Number(updated.finalPrice ?? q.finalPrice),
        status: updated.status || q.status,
        notes: updated.notes ?? q.notes,
      } : q));
    } catch (error) {
      console.error('Failed to update quotation', error);
      throw error;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      const backendId = quotations.find(q => q.id === id)?.id || id;
      await TravelService.archiveQuotation(backendId);
      setQuotations(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete quotation', error);
      throw error;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getDestinations({ page: 1, size: 12 });
        const items = res.data || [];
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

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getPackages({ page: 1, size: 12 });
        const items = res.data || [];
        const mapped: Package[] = items.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          typeId: typeof p.type === 'number' ? p.type : undefined,
          destinations: p.destinationId ? [String(p.destinationId)] : [],
          hotels: p.hotelId ? [String(p.hotelId)] : [],
          duration: Number(p.durationDays ?? 0),
          basePrice: 0,
          inclusions: [],
          exclusions: [],
          itinerary: [],
          image: 'https://images.unsplash.com/photo-1630528059126-222d0ddbaf4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
          description: p.description || '',
          validFrom: p.validFrom ?? null,
          validTo: p.validTo ?? null,
        }));
        setPackages(mapped);
      } catch (e) {
        console.error('Failed to load packages', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getCustomers({ page: 1, size: 100 });
        const items = res.data || [];
        const mapped: Customer[] = items.map((c: any) => ({
          id: String(c.id),
          firstName: c.firstName,
          lastName: c.lastName,
          name: (c.firstName && c.lastName) ? `${c.firstName} ${c.lastName}` : (c.name || ''),
          email: c.email || '',
          phone: c.phone || '',
          type: c.type || 'INDIVIDUAL',
          companyName: c.companyName,
          address: c.address || '',
          city: c.city,
          state: c.state,
          country: c.country,
          postalCode: c.postalCode,
          preferences: c.preferences || [],
        }));
        setCustomers(mapped);
      } catch (e) {
        console.error('Failed to load customers', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await TravelService.getQuotations({ page: 1, size: 100 });
        const items = res.data || [];
        const mapped: Quotation[] = items.map((q: any) => ({
          id: String(q.id),
          title: q.title || '',
          customerId: String(q.customerId || ''),
          packageId: String(q.packageId || ''),
          userId: q.userId ? String(q.userId) : undefined,
          createdBy: String(q.createdBy || ''),
          createdAt: q.createdAt || new Date().toISOString(),
          bookingDate: q.bookingDate,
          travelDate: q.travelDate,
          paxCount: Number(q.paxCount || 1),
          validUntil: q.validUntil || '',
          totalPrice: Number(q.totalPrice || 0),
          discount: Number(q.discount || 0),
          finalPrice: Number(q.finalPrice || 0),
          status: q.status || 'DRAFT',
          notes: q.notes || '',
        }));
        setQuotations(mapped);
      } catch (e) {
        console.error('Failed to load quotations', e);
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