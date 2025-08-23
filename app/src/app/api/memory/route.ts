import { NextRequest, NextResponse } from 'next/server';
import {
  getUserMemoryGraph,
  searchMemoryForEntity,
  createMemoryEntity,
  addMemoryObservation
} from '@/lib/ai/mcp/memory_mcp_server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 });
        }
        const searchResult = await searchMemoryForEntity(query);
        return NextResponse.json({ result: searchResult });

      case 'graph':
        const graph = await getUserMemoryGraph();
        return NextResponse.json({ graph });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_entity':
        const { name, entityType, observations } = data;
        if (!name || !entityType) {
          return NextResponse.json({ error: 'Name and entityType are required' }, { status: 400 });
        }
        const createResult = await createMemoryEntity(name, entityType, observations || []);
        return NextResponse.json({ result: createResult });

      case 'add_observation':
        const { entityName, observation } = data;
        if (!entityName || !observation) {
          return NextResponse.json({ error: 'EntityName and observation are required' }, { status: 400 });
        }
        const addResult = await addMemoryObservation(entityName, observation);
        return NextResponse.json({ result: addResult });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}