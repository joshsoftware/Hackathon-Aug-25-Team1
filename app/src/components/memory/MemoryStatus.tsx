'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Brain, Home, Building } from 'lucide-react';

interface MemoryStats {
  totalEntities: number;
  locationCount: number;
  recentLocations: Array<{ name: string; type: string }>;
}

export default function MemoryStatus() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMemoryStats();
  }, []);

  const loadMemoryStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/memory?action=graph');
      const data = await response.json();
      
      // Parse the response structure: data.graph.content[0].text contains the JSON string
      if (data.graph && data.graph.content && data.graph.content[0] && data.graph.content[0].text) {
        const graphData = JSON.parse(data.graph.content[0].text);
        
        if (graphData.entities) {
          const entities = graphData.entities;
          const locationEntities = entities.filter((e: any) => e.entityType === 'location');
          
          setMemoryStats({
            totalEntities: entities.length,
            locationCount: locationEntities.length,
            recentLocations: locationEntities.slice(0, 3).map((e: any) => ({
              name: e.name,
              type: e.observations?.find((obs: string) => obs.startsWith('Type:'))?.replace('Type: ', '') || 'location'
            }))
          });
        }
      }
    } catch (error) {
      console.error('Error loading memory stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home':
        return <Home className="w-3 h-3" />;
      case 'office':
        return <Building className="w-3 h-3" />;
      default:
        return <MapPin className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Brain className="w-4 h-4 animate-pulse" />
            Loading memory...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!memoryStats) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Memory Status</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-lg">{memoryStats.totalEntities}</div>
              <div className="text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{memoryStats.locationCount}</div>
              <div className="text-gray-500">Locations</div>
            </div>
          </div>
          
          {memoryStats.recentLocations.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Recent Locations:</div>
              <div className="space-y-1">
                {memoryStats.recentLocations.map((location, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {getLocationIcon(location.type)}
                    <span className="capitalize">{location.name}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {location.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}