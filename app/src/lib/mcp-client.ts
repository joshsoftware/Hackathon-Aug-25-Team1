import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class GitHubMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async initialize() {
    try {
      // Create transport for GitHub MCP server
      this.transport = new StdioClientTransport({
        command: 'mcp-server-github',
        args: [],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN!,
          ...process.env
        }
      });

      // Create and connect client
      this.client = new Client({
        name: 'github-activity-client',
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await this.client.connect(this.transport);
      
      console.log('GitHub MCP client connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      return false;
    }
  }

  async callTool(toolName: string, arguments_: Record<string, any>) {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: arguments_
      });
      
      return result;
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.transport) {
      await this.client.close();
      await this.transport.close();
    }
  }
}
