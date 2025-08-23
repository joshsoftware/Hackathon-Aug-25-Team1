import type { ToolSet } from 'ai';
import { getFileSystemToolSets } from './mcp/file_system_mcp_server';
import { getMemoryToolSets } from './mcp/memory_mcp_server';
import { executableTools } from './executable-tools';

/**
 * Fetches tool sets from all registered providers and combines them.
 * This function provides a simple chat assistant with GitHub, Jira, file system, and memory tools.
 * All tools are executable directly without human confirmation.
 */
export async function getAllTools(): Promise<ToolSet> {
  let combinedTools: ToolSet = {};

  // Add memory tools (available for all users)
  try {
    const memoryTools = await getMemoryToolSets();
    if (memoryTools && typeof memoryTools === 'object') {
      console.log(`Fetched Memory tools:`, Object.keys(memoryTools));
      combinedTools = { ...combinedTools, ...memoryTools };
    }
  } catch (error) {
    console.error(`Error fetching Memory tools:`, error);
  }

  // Add file system tools
  try {
    const fileSystemTools = await getFileSystemToolSets();
    if (fileSystemTools && typeof fileSystemTools === 'object') {
      console.log(`Fetched File System tools:`, Object.keys(fileSystemTools));
      combinedTools = { ...combinedTools, ...fileSystemTools };
    }
  } catch (error) {
    console.error(`Error fetching File System tools:`, error);
  }

  // Add executable GitHub and Jira tools (no authentication required for basic usage)
  try {
    console.log(`Adding executable GitHub and Jira tools:`, Object.keys(executableTools));
    combinedTools = { ...combinedTools, ...executableTools };
  } catch (error) {
    console.error(`Error adding executable tools:`, error);
  }

  console.log("Final Combined Tools:", Object.keys(combinedTools));
  return combinedTools;
}