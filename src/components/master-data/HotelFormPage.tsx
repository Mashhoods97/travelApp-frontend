import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import TravelService from '../../lib/api/services/travelService';

export default function HotelFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [destMap, setDestMap] = useState<Record<string, string>>({});
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
  });
  const [amenityKey, setAmenityKey] = useState('');
  const [amenityValue, setAmenityValue] = useState('yes');

  const slugify = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  useEffect(() => {
    (async () => {
      try {
        const map = await TravelService.getDestinationMap();
        setDestMap(map || {});
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const hotel = await TravelService.getHotelById(String(id));
        setFormData({
          name: hotel.name,
          slug: hotel.slug || '',
          address: hotel.address || '',
          phone: hotel.phone || '',
          description: hotel.description || '',
          destinationId: String(hotel.destinationId || ''),
          starRating: Number(hotel.starRating || 3),
          checkInTime: hotel.checkInTime || '14:00',
          checkOutTime: hotel.checkOutTime || '12:00',
          amenities: (hotel.amenities as Record<string, any>) || {},
        });
      } catch (e) {
        console.error('Failed to load hotel', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addAmenity = () => {
    const key = amenityKey.trim();
    if (!key) return;
    setFormData({ ...formData, amenities: { ...formData.amenities, [key]: amenityValue } });
    setAmenityKey('');
    setAmenityValue('yes');
  };

  const removeAmenity = (key: string) => {
    const next = { ...formData.amenities };
    delete next[key];
    setFormData({ ...formData, amenities: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
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
      if (isEdit) {
        await TravelService.updateHotel(String(id), payload);
      } else {
        await TravelService.createHotel(payload);
      }
      navigate('/hotels');
    } catch (e) {
      console.error('Failed to save hotel', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEdit ? 'Edit Hotel' : 'Create Hotel'}</CardTitle>
              <CardDescription>Manage hotel details</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/hotels')}>Back</Button>
              <Button form="hotel-form" type="submit" disabled={saving}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form id="hotel-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Hotel Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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
                  <select id="destination" className="w-full border rounded h-10 px-3" value={formData.destinationId} onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })} required>
                    <option value="" disabled>Select destination</option>
                    {Object.entries(destMap).map(([did, dname]) => (
                      <option key={did} value={did}>{dname}</option>
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
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
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
                    <span key={key} className="text-xs bg-gray-100 rounded px-2 py-1 cursor-pointer" onClick={() => removeAmenity(key)}>
                      {key}: {String(val)} ×
                    </span>
                  ))}
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


