'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Home, Building, Heart, Trash2, Edit } from 'lucide-react';

interface MemoryEntity {
  name: string;
  entityType: string;
  observations: string[];
}

interface MemoryGraph {
  entities: MemoryEntity[];
  relations: Array<{
    from: string;
    to: string;
    relationType: string;
  }>;
}

export default function MemoryViewer() {
  const [memoryGraph, setMemoryGraph] = useState<MemoryGraph | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMemoryGraph();
  }, []);

  const loadMemoryGraph = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/memory?action=graph');
      const data = await response.json();
      
      // Parse the response structure: data.graph.content[0].text contains the JSON string
      if (data.graph && data.graph.content && data.graph.content[0] && data.graph.content[0].text) {
        const graphData = JSON.parse(data.graph.content[0].text);
        setMemoryGraph(graphData);
      }
    } catch (error) {
      console.error('Error loading memory graph:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'office':
        return <Building className="w-4 h-4" />;
      case 'favorite':
        return <Heart className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };


  const getAddressFromObservations = (observations: string[]): string => {
    const addressObservation = observations.find(obs => obs.startsWith('Address:'));
    return addressObservation ? addressObservation.replace('Address: ', '') : 'No address';
  };

  const renderEntityCard = (entity: MemoryEntity) => {
    const address = getAddressFromObservations(entity.observations);
    
    return (
      <Card key={entity.name} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getEntityIcon(entity.entityType)}
              <CardTitle className="text-base capitalize">{entity.name}</CardTitle>
              <Badge variant="outline">{entity.entityType}</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              <strong>Address:</strong> {address}
            </div>
            {entity.observations.map((obs, index) => (
              <div key={index} className="text-sm text-gray-500">
                {obs}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Memory Graph</CardTitle>
          <Button onClick={loadMemoryGraph} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {memoryGraph?.entities && memoryGraph.entities.length > 0 ? (
            <div className="space-y-4">
              {memoryGraph.entities.map((entity) => renderEntityCard(entity))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No memories stored yet.</p>
              <p className="text-sm">Start by asking for directions to save locations!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}