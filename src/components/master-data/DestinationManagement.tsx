import React, { useState } from 'react';
import { useData, Destination } from '../../context/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { MapPin, Plus, Edit, Trash2, Globe } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import TravelService from '../../lib/api/services/travelService';

export function DestinationManagement() {
  const { destinations, addDestination, updateDestination, deleteDestination } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    region: '',
    description: '',
    language: '',
    currency: '',
    image: '',
    popularAttractions: [] as string[]
  });
  const [attractionInput, setAttractionInput] = useState('');

  const defaultImage = "https://images.unsplash.com/photo-1755702525927-c0a7d6adb3a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMHRyb3BpY2FsfGVufDF8fHx8MTc1NTg2ODIwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const destinationData = {
      ...formData,
      image: formData.image || defaultImage,
    };

    try {
      if (editingDestination) {
        const apiId = (editingDestination as any).backendId || editingDestination.id;
        await TravelService.updateDestination(apiId, {
          name: destinationData.name,
          slug: destinationData.slug || slugify(destinationData.name),
          country: destinationData.country,
          region: destinationData.region || undefined,
          description: destinationData.description,
          language: destinationData.language || undefined,
          currency: destinationData.currency || undefined,
        });
        const updated = await TravelService.getDestinationById(String(apiId));
        updateDestination(editingDestination.id, {
          name: updated.name,
          slug: updated.slug,
          country: updated.country,
          region: updated.region,
          description: updated.description,
          language: updated.language,
          currency: updated.currency,
          image: destinationData.image,
        });
      } else {
        const created = await TravelService.createDestination({
          name: destinationData.name,
          slug: destinationData.slug || slugify(destinationData.name),
          country: destinationData.country,
          region: destinationData.region || undefined,
          description: destinationData.description,
          language: destinationData.language || undefined,
          currency: destinationData.currency || undefined,
        });
        addDestination({
          id: created.id,
          name: created.name,
          slug: created.slug,
          country: created.country,
          region: created.region,
          description: created.description,
          language: created.language,
          currency: created.currency,
          image: destinationData.image,
          popularAttractions: destinationData.popularAttractions,
        });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Destination save failed', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      country: '',
      region: '',
      description: '',
      language: '',
      currency: '',
      image: '',
      popularAttractions: []
    });
    setAttractionInput('');
    setEditingDestination(null);
  };

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      slug: destination.slug || '',
      country: destination.country,
      region: destination.region || '',
      description: destination.description,
      language: destination.language || '',
      currency: destination.currency || '',
      image: destination.image,
      popularAttractions: destination.popularAttractions
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (destinationId: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      try {
        const dest = destinations.find(d => d.id === destinationId);
        const apiId = (dest as any)?.backendId || destinationId;
        await TravelService.archiveDestination(apiId);
        deleteDestination(destinationId);
      } catch (err) {
        console.error('Destination delete failed', err);
      }
    }
  };

  const addAttraction = () => {
    if (attractionInput.trim() && !formData.popularAttractions.includes(attractionInput.trim())) {
      setFormData({
        ...formData,
        popularAttractions: [...formData.popularAttractions, attractionInput.trim()]
      });
      setAttractionInput('');
    }
  };

  const removeAttraction = (attraction: string) => {
    setFormData({
      ...formData,
      popularAttractions: formData.popularAttractions.filter(a => a !== attraction)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Destination Management</span>
              </CardTitle>
              <CardDescription>
                Manage travel destinations and popular attractions
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDestination ? 'Edit Destination' : 'Add New Destination'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDestination ? 'Update destination information' : 'Add a new destination to your catalog'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Destination Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="auto-generated if left blank"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="image">Image URL (optional)</Label>
                      <Input
                        id="image"
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/destination-image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Input
                          id="language"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Input
                          id="currency"
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Popular Attractions</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          value={attractionInput}
                          onChange={(e) => setAttractionInput(e.target.value)}
                          placeholder="Add attraction"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttraction())}
                        />
                        <Button type="button" onClick={addAttraction}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.popularAttractions.map((attraction) => (
                          <Badge
                            key={attraction}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAttraction(attraction)}
                          >
                            {attraction} ×
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
                      {editingDestination ? 'Update' : 'Create'} Destination
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <ImageWithFallback
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg">{destination.name}</h3>
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Slug: {destination.slug || '-'}</div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Globe className="w-4 h-4" />
                    <span>{destination.country}</span>
                    {destination.region && <span>• {destination.region}</span>}
                  </div>

                  <div className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {destination.description}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    <span>Language: {destination.language || '-'}</span>
                    <span className="ml-3">Currency: {destination.currency || '-'}</span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm mb-2">Popular Attractions:</p>
                    <div className="flex flex-wrap gap-1">
                      {destination.popularAttractions.slice(0, 3).map((attraction) => (
                        <Badge key={attraction} variant="outline" className="text-xs">
                          {attraction}
                        </Badge>
                      ))}
                      {destination.popularAttractions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{destination.popularAttractions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(destination)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(destination.id)}
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