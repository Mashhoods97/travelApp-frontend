import React, { useEffect, useMemo, useState } from 'react';
import { useData, Hotel } from '../../context/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Building2, Plus, Edit, Trash2, Star, MapPin, DollarSign } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import TravelService from '../../lib/api/services/travelService';

export function HotelManagement() {
  const { hotels, addHotel, updateHotel, deleteHotel } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    phone: '',
    description: '',
    destinationId: '',
    starRating: 3,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: {} as Record<string, any>,
    image: '',
  });
  const [amenityKey, setAmenityKey] = useState('');
  const [amenityValue, setAmenityValue] = useState('yes');
  const [destMap, setDestMap] = useState<Record<string, string>>({});

  const defaultImage = "https://images.unsplash.com/photo-1731080647266-85cf1bc27162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJlc29ydHxlbnwxfHx8fDE3NTU4MzAzMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      slug: formData.slug || slugify(formData.name),
      address: formData.address,
      phone: formData.phone || undefined,
      description: formData.description,
      destinationId: Number(formData.destinationId),
      starRating: Number(formData.starRating),
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      amenities: formData.amenities,
    };
    try {
      if (editingHotel) {
        const apiId = (editingHotel as any).backendId || editingHotel.id;
        await TravelService.updateHotel(apiId, payload);
        // Refetch single for accuracy
        const updated = await TravelService.getHotelById(String(apiId));
        updateHotel(editingHotel.id, {
          name: updated.name,
          location: updated.address,
          rating: Number(updated.starRating || 0),
          pricePerNight: 0,
          amenities: Object.keys(updated.amenities || {}).filter(k => {
            const v = (updated.amenities as any)[k];
            return v === true || v === 'yes' || v === 'Yes' || v === 'YES';
          }),
          image: formData.image || defaultImage,
          description: updated.description,
        });
      } else {
        const created = await TravelService.createHotel(payload);
        addHotel({
          id: String(created.id),
          name: created.name,
          location: created.address || '',
          rating: Number(created.starRating || 0),
          pricePerNight: 0,
          amenities: Object.keys(created.amenities || {}).filter(k => {
            const v = (created.amenities as any)[k];
            return v === true || v === 'yes' || v === 'Yes' || v === 'YES';
          }),
          image: formData.image || defaultImage,
          description: created.description || '',
        });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Hotel save failed', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      phone: '',
      description: '',
      destinationId: '',
      starRating: 3,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      amenities: {},
      image: '',
    });
    setAmenityKey('');
    setAmenityValue('yes');
    setEditingHotel(null);
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    const amenMap = Array.isArray((hotel as any).amenities)
      ? (hotel.amenities as string[]).reduce<Record<string, any>>((acc, key) => {
          if (key) acc[key] = 'yes';
          return acc;
        }, {})
      : ((hotel as any).amenities || {});
    setFormData({
      name: hotel.name,
      slug: hotel.slug || '',
      address: (hotel as any).address || hotel.location || '',
      phone: (hotel as any).phone || '',
      description: hotel.description,
      destinationId: String((hotel as any).destinationId || ''),
      starRating: Number((hotel as any).starRating || hotel.rating || 0),
      checkInTime: (hotel as any).checkInTime || '14:00',
      checkOutTime: (hotel as any).checkOutTime || '12:00',
      amenities: amenMap,
      image: hotel.image,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (hotelId: string) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      try {
        const h = hotels.find(x => x.id === hotelId);
        const apiId = (h as any)?.backendId || hotelId;
        await TravelService.archiveHotel(apiId);
        deleteHotel(hotelId);
      } catch (err) {
        console.error('Hotel delete failed', err);
      }
    }
  };

  const addAmenity = () => {
    const key = amenityKey.trim();
    if (!key) return;
    setFormData({
      ...formData,
      amenities: { ...formData.amenities, [key]: amenityValue },
    });
    setAmenityKey('');
    setAmenityValue('yes');
  };

  const removeAmenity = (key: string) => {
    const next = { ...formData.amenities };
    delete next[key];
    setFormData({ ...formData, amenities: next });
  };

  useEffect(() => {
    (async () => {
      try {
        const map = await TravelService.getDestinationMap();
        setDestMap(map || {});
      } catch (e) {
        console.error('Failed to load destination map', e);
      }
    })();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Hotel Management</span>
              </CardTitle>
              <CardDescription>
                Manage your hotel inventory and partnerships
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hotel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingHotel ? 'Update hotel information' : 'Add a new hotel to your inventory'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Hotel Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated if blank" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="destination">Destination</Label>
                        <select
                          id="destination"
                          className="w-full border rounded h-10 px-3"
                          value={formData.destinationId}
                          onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                          required
                        >
                          <option value="" disabled>Select destination</option>
                          {Object.entries(destMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="starRating">Star Rating (1-5)</Label>
                        <Input id="starRating" type="number" min="1" max="5" value={formData.starRating} onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) || 0 })} required />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkInTime">Check-In Time</Label>
                        <Input id="checkInTime" type="time" value={formData.checkInTime} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="checkOutTime">Check-Out Time</Label>
                        <Input id="checkOutTime" type="time" value={formData.checkOutTime} onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })} required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">Image URL (optional)</Label>
                      <Input
                        id="image"
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/hotel-image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label>Amenities</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2 items-center">
                        <Input value={amenityKey} onChange={(e) => setAmenityKey(e.target.value)} placeholder="key (e.g., pool)" />
                        <select className="border rounded h-10 px-2" value={amenityValue} onChange={(e) => setAmenityValue(e.target.value)}>
                          <option value="yes">yes</option>
                          <option value="no">no</option>
                        </select>
                        <Button type="button" onClick={addAmenity}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(formData.amenities).map(([key, val]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAmenity(key)}
                          >
                            {key}: {String(val)} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingHotel ? 'Update' : 'Create'} Hotel
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <ImageWithFallback
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg">{hotel.name}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(hotel.rating)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <DollarSign className="w-4 h-4" />
                    <span>${hotel.pricePerNight}/night</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {hotel.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hotel.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{hotel.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(hotel)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(hotel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}