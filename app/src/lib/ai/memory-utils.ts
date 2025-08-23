import { searchMemoryForEntity, createMemoryEntity, addMemoryObservation, createMemoryRelation } from './mcp/memory_mcp_server';

export interface LocationEntity {
  name: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  type: 'home' | 'office' | 'favorite' | 'other';
  description?: string;
}

export interface MemorySearchResult {
  found: boolean;
  entity?: any;
  needsMoreInfo?: boolean;
  suggestedQuestions?: string[];
}

// Common location entities that users might reference
const COMMON_LOCATION_ENTITIES = [
  'home', 'house', 'apartment', 'residence',
  'office', 'work', 'workplace', 'company',
  'gym', 'school', 'university', 'college',
  'airport', 'hotel', 'restaurant', 'store',
  'hospital', 'doctor', 'dentist', 'pharmacy',
  'mall', 'park', 'beach', 'church', 'temple'
];

/**
 * Intelligent memory search for location entities
 * This function will search for locations and provide context for missing information
 */
export async function searchLocationInMemory(locationName: string): Promise<MemorySearchResult> {
  try {
    console.log(`Searching for location: ${locationName}`);
    
    // Search for the exact location name
    const searchResult = await searchMemoryForEntity(locationName.toLowerCase(), 'location');
    
    if (searchResult && searchResult.nodes && searchResult.nodes.length > 0) {
      // Found the location in memory
      const entity = searchResult.nodes[0];
      console.log(`Found location in memory: ${locationName}`, entity);
      
      return {
        found: true,
        entity,
        needsMoreInfo: false
      };
    }
    
    // If not found, check if it's a common location type
    const normalizedName = locationName.toLowerCase();
    const isCommonLocation = COMMON_LOCATION_ENTITIES.some(common => 
      normalizedName.includes(common) || common.includes(normalizedName)
    );
    
    if (isCommonLocation) {
      // This is a common location type, ask for specific details
      const suggestedQuestions = generateLocationQuestions(normalizedName);
      
      return {
        found: false,
        needsMoreInfo: true,
        suggestedQuestions
      };
    }
    
    // Unknown location, ask for general information
    return {
      found: false,
      needsMoreInfo: true,
      suggestedQuestions: [
        `What is the address of ${locationName}?`,
        `Can you provide more details about ${locationName}?`,
        `Is ${locationName} a place you visit regularly?`
      ]
    };
    
  } catch (error) {
    console.error(`Error searching for location ${locationName}:`, error);
    return {
      found: false,
      needsMoreInfo: true,
      suggestedQuestions: [`Could you provide the address for ${locationName}?`]
    };
  }
}

/**
 * Generate contextual questions based on location type
 */
function generateLocationQuestions(locationName: string): string[] {
  const questions: string[] = [];
  
  if (locationName.includes('home') || locationName.includes('house') || locationName.includes('apartment')) {
    questions.push(
      "What's your home address?",
      "Would you like me to remember your home location for future directions?"
    );
  } else if (locationName.includes('office') || locationName.includes('work')) {
    questions.push(
      "What's your work address?",
      "Would you like me to remember your office location for future directions?"
    );
  } else if (locationName.includes('gym') || locationName.includes('school') || locationName.includes('university')) {
    questions.push(
      `What's the address of your ${locationName}?`,
      `Would you like me to remember this ${locationName} location?`
    );
  } else {
    questions.push(
      `What's the address of ${locationName}?`,
      `Would you like me to remember this location for future use?`
    );
  }
  
  return questions;
}

/**
 * Save location information to memory
 */
export async function saveLocationToMemory(
  locationName: string,
  address: string,
  coordinates?: { lat: number; lng: number },
  locationType: string = 'location',
  description?: string
): Promise<boolean> {
  try {
    console.log(`Saving location to memory: ${locationName}`);
    
    // Create the location entity
    const observations = [
      `Address: ${address}`,
      `Type: ${locationType}`,
    ];
    
    if (coordinates) {
      observations.push(`Coordinates: ${coordinates.lat}, ${coordinates.lng}`);
    }
    
    if (description) {
      observations.push(`Description: ${description}`);
    }
    
    await createMemoryEntity(locationName.toLowerCase(), 'location', observations);
    
    // Create a relation to the user (if we have user entity)
    try {
      await createMemoryRelation('user', locationName.toLowerCase(), 'frequently_visits');
    } catch (error) {
      console.log('Could not create user relation, user entity may not exist yet');
    }
    
    console.log(`Successfully saved location: ${locationName}`);
    return true;
    
  } catch (error) {
    console.error(`Error saving location ${locationName}:`, error);
    return false;
  }
}

/**
 * Update location information in memory
 */
export async function updateLocationInMemory(
  locationName: string,
  newInformation: string
): Promise<boolean> {
  try {
    console.log(`Updating location in memory: ${locationName}`);
    
    await addMemoryObservation(locationName.toLowerCase(), newInformation);
    
    console.log(`Successfully updated location: ${locationName}`);
    return true;
    
  } catch (error) {
    console.error(`Error updating location ${locationName}:`, error);
    return false;
  }
}

/**
 * Extract location entities from user input
 */
export function extractLocationEntities(userInput: string): string[] {
  const input = userInput.toLowerCase();
  const foundLocations: string[] = [];
  
  // Look for common location patterns
  const locationPatterns = [
    /(?:from|to|at|near|by)\s+(?:my\s+)?(home|house|apartment|residence)/gi,
    /(?:from|to|at|near|by)\s+(?:my\s+)?(office|work|workplace|company)/gi,
    /(?:from|to|at|near|by)\s+(?:my\s+)?(gym|school|university|college)/gi,
    /(?:from|to|at|near|by)\s+([A-Za-z\s]+(?:street|road|avenue|ave|st|rd|blvd|drive|dr|lane|ln|way|plaza|square|mall|center|airport|hospital|hotel|restaurant|store|park|beach|church|temple))/gi,
    /(?:from|to|at|near|by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
  ];
  
  locationPatterns.forEach(pattern => {
    const matches = Array.from(input.matchAll(pattern));
    matches.forEach(match => {
      if (match[1]) {
        foundLocations.push(match[1].trim());
      }
    });
  });
  
  // Remove duplicates
  return [...new Set(foundLocations)];
}

/**
 * Generate memory-aware response for location requests
 */
export async function generateMemoryAwareLocationResponse(
  userInput: string,
  extractedLocations: string[]
): Promise<{
  needsMoreInfo: boolean;
  questions: string[];
  foundLocations: any[];
  missingLocations: string[];
}> {
  const foundLocations: any[] = [];
  const missingLocations: string[] = [];
  const questions: string[] = [];
  
  for (const location of extractedLocations) {
    const searchResult = await searchLocationInMemory(location);
    
    if (searchResult.found && searchResult.entity) {
      foundLocations.push({
        name: location,
        entity: searchResult.entity
      });
    } else {
      missingLocations.push(location);
      if (searchResult.suggestedQuestions) {
        questions.push(...searchResult.suggestedQuestions);
      }
    }
  }
  
  return {
    needsMoreInfo: missingLocations.length > 0,
    questions: [...new Set(questions)], // Remove duplicates
    foundLocations,
    missingLocations
  };
}

/**
 * Process user response and save to memory
 */
export async function processLocationResponse(
  locationName: string,
  userResponse: string,
  confirmSave: boolean = false
): Promise<{
  saved: boolean;
  message: string;
  coordinates?: { lat: number; lng: number };
}> {
  if (!confirmSave) {
    return {
      saved: false,
      message: "Location not saved as requested."
    };
  }
  
  try {
    // Extract address from user response
    const address = userResponse.trim();
    
    // Try to geocode the address (this would typically use Google Maps API)
    // For now, we'll save without coordinates
    const saved = await saveLocationToMemory(locationName, address);
    
    if (saved) {
      return {
        saved: true,
        message: `I've saved "${locationName}" with address "${address}" to your memory. I'll remember this for future directions.`
      };
    } else {
      return {
        saved: false,
        message: `Sorry, I couldn't save the location "${locationName}". Please try again.`
      };
    }
    
  } catch (error) {
    console.error('Error processing location response:', error);
    return {
      saved: false,
      message: `Sorry, there was an error saving the location. Please try again.`
    };
  }
}