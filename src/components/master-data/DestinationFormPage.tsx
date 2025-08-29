import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import TravelService from '../../lib/api/services/travelService';

export default function DestinationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    region: '',
    description: '',
    language: '',
    currency: '',
    image: '',
  });

  const slugify = (value: string) =>
    value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const dest = await TravelService.getDestinationById(String(id));
        setFormData({
          name: dest.name,
          slug: dest.slug || '',
          country: dest.country,
          region: dest.region || '',
          description: dest.description || '',
          language: dest.language || '',
          currency: dest.currency || '',
          image: '',
        });
      } catch (e) {
        console.error('Failed to load destination', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await TravelService.updateDestination(String(id), {
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          country: formData.country,
          region: formData.region || undefined,
          description: formData.description,
          language: formData.language || undefined,
          currency: formData.currency || undefined,
        });
      } else {
        await TravelService.createDestination({
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          country: formData.country,
          region: formData.region || undefined,
          description: formData.description,
          language: formData.language || undefined,
          currency: formData.currency || undefined,
        });
      }
      navigate('/destinations');
    } catch (e) {
      console.error('Failed to save destination', e);
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
              <CardTitle>{isEdit ? 'Edit Destination' : 'Create Destination'}</CardTitle>
              <CardDescription>Manage destination details</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/destinations')}>Back</Button>
              <Button form="dest-form" type="submit" disabled={saving}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form id="dest-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Destination Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated if blank" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
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


