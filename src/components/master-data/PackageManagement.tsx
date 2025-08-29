import React, { useEffect, useState } from 'react';
import { useData, Package } from '../../context/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Package as PackageIcon, Plus, Edit, Trash2, Calendar, DollarSign, MapPin, Building2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PACKAGE_TYPE_OPTIONS } from '../../lib/api/constants';
import TravelService from '../../lib/api/services/travelService';
import { useNavigate } from 'react-router-dom';

export function PackageManagement() {
  const navigate = useNavigate();
  const { packages, addPackage, updatePackage, deletePackage, destinations, hotels } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Package[]>(packages);
  const [formData, setFormData] = useState({
    name: '',
    typeId: 1 as number,
    destinations: [] as string[],
    hotels: [] as string[],
    duration: 7,
    basePrice: 0,
    inclusions: [] as string[],
    exclusions: [] as string[],
    itinerary: [] as string[],
    image: '',
    description: '',
    validFrom: '' as string | '' ,
    validTo: '' as string | '' ,
  });
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');
  const [itineraryInput, setItineraryInput] = useState('');

  const defaultImage = "https://images.unsplash.com/photo-1630528059126-222d0ddbaf4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwYWNrYWdlJTIwdmFjYXRpb258ZW58MXx8fHwxNzU1ODY4MjM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      ...formData,
      validFrom: formData.validFrom || null,
      validTo: formData.validTo || null,
      image: formData.image || defaultImage
    };
    
    if (editingPackage) {
      updatePackage(editingPackage.id, packageData);
    } else {
      addPackage(packageData);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      typeId: 1,
      destinations: [],
      hotels: [],
      duration: 7,
      basePrice: 0,
      inclusions: [],
      exclusions: [],
      itinerary: [],
      image: '',
      description: '',
      validFrom: '',
      validTo: '',
    });
    setInclusionInput('');
    setExclusionInput('');
    setItineraryInput('');
    setEditingPackage(null);
  };

  const handleEdit = (pkg: Package) => {
    navigate(`/packages/${(pkg as any).backendId || pkg.id}`);
  };

  const handleDelete = (packageId: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      deletePackage(packageId);
    }
  };

  const toggleDestination = (destinationId: string) => {
    setFormData({
      ...formData,
      destinations: formData.destinations.includes(destinationId)
        ? formData.destinations.filter(id => id !== destinationId)
        : [...formData.destinations, destinationId]
    });
  };

  const toggleHotel = (hotelId: string) => {
    setFormData({
      ...formData,
      hotels: formData.hotels.includes(hotelId)
        ? formData.hotels.filter(id => id !== hotelId)
        : [...formData.hotels, hotelId]
    });
  };

  const addItem = (type: 'inclusions' | 'exclusions' | 'itinerary', input: string, setInput: (value: string) => void) => {
    if (input.trim() && !formData[type].includes(input.trim())) {
      setFormData({
        ...formData,
        [type]: [...formData[type], input.trim()]
      });
      setInput('');
    }
  };

  const removeItem = (type: 'inclusions' | 'exclusions' | 'itinerary', item: string) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter(i => i !== item)
    });
  };

  const getPackageDestinations = (destinationIds: string[]) => {
    return destinations.filter(d => destinationIds.includes(d.id));
  };

  const getPackageHotels = (hotelIds: string[]) => {
    return hotels.filter(h => hotelIds.includes(h.id));
  };

  useEffect(() => {
    setList(packages);
  }, [packages]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await TravelService.getPackages({ page: 1, size: 12, name: search || undefined, code: search || undefined });
      const items = (res.data || []).map((p: any) => ({
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
      } as Package));
      setList(items);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center space-x-2">
                <PackageIcon className="w-5 h-5" />
                <span>Package Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage travel packages with destinations and hotels
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search by name or code" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Button variant="outline" onClick={performSearch} disabled={loading}>Search</Button>
              <Button onClick={() => navigate('/packages/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((pkg) => {
              const packageDestinations = getPackageDestinations(pkg.destinations);
              const packageHotels = getPackageHotels(pkg.hotels);
              
              return (
                <Card key={pkg.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    <ImageWithFallback
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg">{pkg.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {pkg.duration} days
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span>${pkg.basePrice}</span>
                      <Calendar className="w-4 h-4 ml-2" />
                      <span>{pkg.duration} days</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {pkg.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">Destinations:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {packageDestinations.slice(0, 2).map((destination) => (
                            <Badge key={destination.id} variant="outline" className="text-xs">
                              {destination.name}
                            </Badge>
                          ))}
                          {packageDestinations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{packageDestinations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Building2 className="w-3 h-3" />
                          <span className="text-xs">Hotels:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {packageHotels.slice(0, 2).map((hotel) => (
                            <Badge key={hotel.id} variant="secondary" className="text-xs">
                              {hotel.name}
                            </Badge>
                          ))}
                          {packageHotels.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{packageHotels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}