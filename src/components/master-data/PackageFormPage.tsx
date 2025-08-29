import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import TravelService from '../../lib/api/services/travelService';
import { PACKAGE_TYPE_OPTIONS } from '../../lib/api/constants';

export default function PackageFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [destMap, setDestMap] = useState<Record<string, string>>({});
  const [hotelList, setHotelList] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    typeId: 1 as number,
    destinations: [] as string[],
    hotels: [] as string[],
    duration: 7,
    description: '',
    validFrom: '' as string | '',
    validTo: '' as string | '',
  });

  useEffect(() => {
    (async () => {
      try {
        const map = await TravelService.getDestinationMap();
        setDestMap(map || {});
      } catch {}
      try {
        const hotelsRes = await TravelService.getHotels({ page: 1, size: 100 });
        setHotelList((hotelsRes.data || []).map((h: any) => ({ id: String(h.id), name: h.name })));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const pkg = await TravelService.getPackageById(String(id));
        setFormData({
          name: pkg.name,
          typeId: Number(pkg.type || 1),
          destinations: pkg.destinationId ? [String(pkg.destinationId)] : [],
          hotels: pkg.hotelId ? [String(pkg.hotelId)] : [],
          duration: Number(pkg.durationDays || 7),
          description: pkg.description || '',
          validFrom: pkg.validFrom || '',
          validTo: pkg.validTo || '',
        });
      } catch (e) {
        console.error('Failed to load package', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleArrayValue = (list: string[], value: string) => (
    list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      name: formData.name,
      description: formData.description,
      type: formData.typeId,
      durationDays: formData.duration,
      durationNights: Math.max(formData.duration - 1, 0),
      validFrom: formData.validFrom || null,
      validTo: formData.validTo || null,
      destinationId: formData.destinations[0] ? Number(formData.destinations[0]) : undefined,
      hotelId: formData.hotels[0] ? Number(formData.hotels[0]) : undefined,
    };
    try {
      if (isEdit) {
        await TravelService.updatePackage(String(id), payload);
      } else {
        await TravelService.createPackage(payload);
      }
      navigate('/packages');
    } catch (e) {
      console.error('Failed to save package', e);
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
              <CardTitle>{isEdit ? 'Edit Package' : 'Create Package'}</CardTitle>
              <CardDescription>Manage package details</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/packages')}>Back</Button>
              <Button form="package-form" type="submit" disabled={saving}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form id="package-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Package Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input id="duration" type="number" min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Package Type</Label>
                  <select id="type" className="w-full border rounded h-10 px-3" value={String(formData.typeId)} onChange={(e) => setFormData({ ...formData, typeId: parseInt(e.target.value) })}>
                    {PACKAGE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={String(opt.value)}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input id="validFrom" type="date" value={formData.validFrom || ''} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validTo">Valid To</Label>
                  <Input id="validTo" type="date" value={formData.validTo || ''} onChange={(e) => setFormData({ ...formData, validTo: e.target.value })} />
                </div>
                <div />
              </div>

              <div>
                <Label>Destination</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-36 overflow-y-auto">
                  {Object.entries(destMap).map(([did, dname]) => (
                    <label key={did} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={formData.destinations.includes(did)} onChange={() => setFormData({ ...formData, destinations: toggleArrayValue(formData.destinations, did) })} />
                      <span>{dname}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Hotels</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-36 overflow-y-auto">
                  {hotelList.map((h) => (
                    <label key={h.id} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" checked={formData.hotels.includes(h.id)} onChange={() => setFormData({ ...formData, hotels: toggleArrayValue(formData.hotels, h.id) })} />
                      <span>{h.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} required />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


