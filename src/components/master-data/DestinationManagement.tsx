import React, { useEffect, useState } from 'react';
import { useData, Destination } from '../../context/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Plus, Edit, Trash2, Globe } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import TravelService from '../../lib/api/services/travelService';
import { useNavigate } from 'react-router-dom';

export function DestinationManagement() {
  const navigate = useNavigate();
  const { destinations, deleteDestination } = useData();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Destination[]>(destinations);

  const handleEdit = (destination: Destination) => {
    navigate(`/destinations/${(destination as any).backendId || destination.id}`);
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

  useEffect(() => {
    setList(destinations);
  }, [destinations]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await TravelService.getDestinations({ 
        page: 1, 
        size: 12, 
        name: search || undefined,
        slug: search || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const items = (res.data || []).map((d: any) => ({
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
                <MapPin className="w-5 h-5" />
                <span>Destination Management</span>
              </CardTitle>
              <CardDescription>
                Manage travel destinations and popular attractions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
              <Button variant="outline" onClick={performSearch} disabled={loading}>Search</Button>
              <Button onClick={() => navigate('/destinations/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Destination
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((destination) => (
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