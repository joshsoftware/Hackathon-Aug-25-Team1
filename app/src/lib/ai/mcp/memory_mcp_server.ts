import { experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import type { ToolSet } from 'ai';

// Caching variables
let memoryMCPStdioClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;
let memoryToolSetsCache: ToolSet | null = null;
let isInitializing = false; // Flag to prevent concurrent initializations

async function initializeMemoryMCPClient() {
  const callId = Date.now(); // Unique ID for this call attempt
  console.log(`[${callId}] initializeMemoryMCPClient called.`);

  // Check cache first
  if (memoryMCPStdioClient) {
    console.log(`[${callId}] Returning cached Memory MCP Client.`);
    return memoryMCPStdioClient;
  }

  // Prevent multiple initializations running at the same time
  if (isInitializing) {
      console.log(`[${callId}] Memory initialization already in progress, waiting...`);
      while (isInitializing) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
      }
      console.log(`[${callId}] Memory initialization finished by another call, checking cache again.`);
      if (memoryMCPStdioClient) {
          console.log(`[${callId}] Returning cached memory client after waiting.`);
          return memoryMCPStdioClient;
      } else {
           console.error(`[${callId}] Waited for memory initialization, but client is still null!`);
           throw new Error("Failed to get memory client after waiting for initialization.");
      }
  }

  // Set the flag to block other calls
  isInitializing = true;
  console.log(`[${callId}] *** Starting NEW Memory MCP Client Initialization ***`);

  // Ensure this runs only in Node.js
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
     console.error(`[${callId}] Attempted StdioMCPTransport outside Node.js.`);
     isInitializing = false; // Release the lock
     throw new Error("StdioMCPTransport requires a Node.js environment.");
  }

  console.log(`[${callId}] Initializing Memory MCP Stdio Transport...`);
  const startTime = performance.now(); // Start timing

  // Use custom memory file path if provided, otherwise use default
  const memoryFilePath = process.env.MEMORY_FILE_PATH || undefined;
  const args = ["@modelcontextprotocol/server-memory"];

  if (memoryFilePath) {
    args.push(memoryFilePath);
  }

  const memoryMCPTransport = new StdioMCPTransport({
    command: "npx",
    args: ["-y", ...args],
    // debug: true, // Uncomment for verbose MCP logs if needed
  });

  console.log(`[${callId}] Creating Memory MCP Client...`);
  try {
    const client = await createMCPClient({
      transport: memoryMCPTransport,
    });
    const endTime = performance.now();
    console.log(`[${callId}] *** Memory MCP Client Initialized Successfully (took ${(endTime - startTime).toFixed(2)} ms) ***`);
    memoryMCPStdioClient = client; // Store in cache
    isInitializing = false; // Release the lock
    return memoryMCPStdioClient;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[${callId}] !!! Failed to initialize Memory MCP Client (after ${(endTime - startTime).toFixed(2)} ms) !!!`, error);
    isInitializing = false; // Release the lock
    memoryMCPStdioClient = null; // Ensure cache is clear on error
    throw error; // Re-throw error
  }
}

export async function getMemoryToolSets(): Promise<ToolSet> {
  const callId = Date.now();
  console.log(`[${callId}] getMemoryToolSets called.`);

  // Check tool cache first
  if (memoryToolSetsCache) {
    console.log(`[${callId}] Returning cached Memory tool sets.`);
    return memoryToolSetsCache;
  }

  console.log(`[${callId}] Memory tool cache miss. Need to initialize client (or use existing).`);
  try {
    const client = await initializeMemoryMCPClient(); // Will either init or return cache

    // Check cache *again* in case another concurrent call populated it while waiting
     if (memoryToolSetsCache) {
         console.log(`[${callId}] Memory tool cache populated while waiting for client. Returning cached tools.`);
         return memoryToolSetsCache;
     }

    console.log(`[${callId}] Fetching tools from Memory MCP Client...`);
    const tools = await client.tools();
     if (!tools || typeof tools !== 'object') {
         console.error(`[${callId}] Invalid tools format received from Memory MCP client:`, tools);
         throw new Error("Invalid tools format received from Memory MCP client.");
     }
    console.log(`[${callId}] *** Fetched and cached Memory tools:`, Object.keys(tools));
    memoryToolSetsCache = tools; // Store tools in cache
    return memoryToolSetsCache;
  } catch (error) {
     console.error(`[${callId}] Error getting Memory tool sets:`, error);
     // Don't cache on error
     memoryToolSetsCache = null; // Clear tool cache on error
     throw error; // Re-throw error
  }
}

// Helper functions for intelligent memory operations
export async function searchMemoryForEntity(entityName: string, entityType?: string): Promise<any> {
  const callId = Date.now();
  console.log(`[${callId}] Searching memory for entity: ${entityName} (type: ${entityType || 'any'})`);

  try {
    const client = await initializeMemoryMCPClient();
    const tools = await client.tools();

    if (tools.search_nodes) {
      const searchResult = await tools.search_nodes.execute({
        query: entityName
      }, {
        toolCallId: `memory-search-${callId}`,
        messages: []
      });

      console.log(`[${callId}] Memory search result for ${entityName}:`, searchResult);
      return searchResult;
    }

    return null;
  } catch (error) {
    console.error(`[${callId}] Error searching memory for entity ${entityName}:`, error);
    return null;
  }
}

export async function createMemoryEntity(name: string, entityType: string, observations: string[] = []): Promise<any> {
  const callId = Date.now();
  console.log(`[${callId}] Creating memory entity: ${name} (type: ${entityType})`);

  try {
    const client = await initializeMemoryMCPClient();
    const tools = await client.tools();

    if (tools.create_entities) {
      const result = await tools.create_entities.execute({
        entities: [{
          name,
          entityType,
          observations
        }]
      }, {
        toolCallId: `memory-create-${callId}`,
        messages: []
      });

      console.log(`[${callId}] Created memory entity ${name}:`, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error(`[${callId}] Error creating memory entity ${name}:`, error);
    throw error;
  }
}

export async function addMemoryObservation(entityName: string, observation: string): Promise<any> {
  const callId = Date.now();
  console.log(`[${callId}] Adding observation to entity ${entityName}: ${observation}`);

  try {
    const client = await initializeMemoryMCPClient();
    const tools = await client.tools();

    if (tools.add_observations) {
      const result = await tools.add_observations.execute({
        entityName,
        observations: [observation]
      }, {
        toolCallId: `memory-add-${callId}`,
        messages: []
      });

      console.log(`[${callId}] Added observation to ${entityName}:`, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error(`[${callId}] Error adding observation to entity ${entityName}:`, error);
    throw error;
  }
}

export async function createMemoryRelation(from: string, to: string, relationType: string): Promise<any> {
  const callId = Date.now();
  console.log(`[${callId}] Creating memory relation: ${from} -> ${to} (${relationType})`);

  try {
    const client = await initializeMemoryMCPClient();
    const tools = await client.tools();

    if (tools.create_relations) {
      const result = await tools.create_relations.execute({
        relations: [{
          from,
          to,
          relationType
        }]
      }, {
        toolCallId: `memory-relation-${callId}`,
        messages: []
      });

      console.log(`[${callId}] Created memory relation ${from} -> ${to}:`, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error(`[${callId}] Error creating memory relation ${from} -> ${to}:`, error);
    throw error;
  }
}

export async function getUserMemoryGraph(): Promise<any> {
  const callId = Date.now();
  console.log(`[${callId}] Fetching user memory graph`);

  try {
    const client = await initializeMemoryMCPClient();
    const tools = await client.tools();

    if (tools.read_graph) {
      const result = await tools.read_graph.execute({}, {
        toolCallId: `memory-graph-${callId}`,
        messages: []
      });

      console.log(`[${callId}] Retrieved memory graph:`, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error(`[${callId}] Error fetching memory graph:`, error);
    throw error;
  }
}

// Consider adding a shutdown function if the MCP server process needs explicit cleanup
// export async function shutdownMemoryMCPClient() {
//   if (memoryMCPStdioClient) {
//     console.log("Shutting down Memory MCP client...");
//     await memoryMCPStdioClient.transport.terminate(); // Assuming transport has terminate
//     memoryMCPStdioClient = null;
//     memoryToolSetsCache = null;
//     console.log("Memory MCP client shut down.");
//   }
// }