import type { ToolSet } from 'ai';
import { executableTools } from './executable-tools';

/**
 * Fetches tool sets from all registered providers and combines them.
 * This function provides a simple chat assistant with GitHub, Jira, file system, and memory tools.
 * All tools are executable directly without human confirmation.
 */
export async function getAllTools(): Promise<ToolSet> {
  let combinedTools: ToolSet = {};

  // Add executable GitHub and Jira tools (no authentication required for basic usage)
  try {
    console.log(`Adding GitHub and Jira tools:`, Object.keys(executableTools));
    combinedTools = { ...combinedTools, ...executableTools };
  } catch (error) {
    console.error(`Error adding tools:`, error);
  }

  console.log("Final Combined Tools:", Object.keys(combinedTools));
  return combinedTools;
}