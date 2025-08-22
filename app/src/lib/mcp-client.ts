import { spawn, ChildProcess } from 'child_process';

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: string;
  method: string;
  params?: any;
}

export class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
  private isInitialized = false;

  constructor(private serverCommand: string, private serverArgs: string[] = []) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      try {
        // Spawn the MCP server process with environment variables
        this.process = spawn(this.serverCommand, this.serverArgs, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            GITHUB_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN,
          },
        });

        if (!this.process.stdout || !this.process.stdin) {
          throw new Error('Failed to create stdio pipes');
        }

        // Handle stdout data (responses from MCP server)
        let buffer = '';
        this.process.stdout.on('data', (data: Buffer) => {
          buffer += data.toString();
          
          // Process complete JSON-RPC messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const message = JSON.parse(line.trim());
                this.handleMessage(message);
              } catch (error) {
                console.error('Failed to parse MCP message:', error, 'Line:', line);
              }
            }
          }
        });

        // Handle process errors
        this.process.on('error', (error) => {
          console.error('MCP server process error:', error);
          reject(error);
        });

        this.process.on('exit', (code, signal) => {
          console.log(`MCP server exited with code ${code}, signal ${signal}`);
          this.isInitialized = false;
        });

        // Initialize the MCP session
        this.sendRequest('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: {
              listChanged: true
            },
            sampling: {}
          },
          clientInfo: {
            name: 'github-activity-app',
            version: '1.0.0'
          }
        }).then(() => {
          this.isInitialized = true;
          resolve();
        }).catch(reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: MCPResponse | MCPNotification): void {
    if ('id' in message) {
      // This is a response to a request
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        this.pendingRequests.delete(message.id);
        if (message.error) {
          pending.reject(new Error(`MCP Error: ${message.error.message}`));
        } else {
          pending.resolve(message.result);
        }
      }
    } else {
      // This is a notification
      console.log('MCP Notification:', message);
    }
  }

  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('MCP client not initialized'));
        return;
      }

      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      const requestLine = JSON.stringify(request) + '\n';
      this.process.stdin.write(requestLine);

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  async listTools(): Promise<any> {
    return this.sendRequest('tools/list');
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    return this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });
  }

  async getUserActivity(username: string, limit: number = 30, fromDate?: string, toDate?: string): Promise<any> {
    const params: any = { username, limit };
    if (fromDate) params.since = fromDate;
    if (toDate) params.until = toDate;
    return this.callTool('get_user_activity', params);
  }

  async getRepoActivity(owner: string, repo: string, limit: number = 30, fromDate?: string, toDate?: string): Promise<any> {
    const params: any = { owner, repo, limit };
    if (fromDate) params.since = fromDate;
    if (toDate) params.until = toDate;
    return this.callTool('get_repo_activity', params);
  }

  async getRepoCommits(owner: string, repo: string, limit: number = 30, fromDate?: string, toDate?: string): Promise<any> {
    const params: any = { owner, repo, limit };
    if (fromDate) params.since = fromDate;
    if (toDate) params.until = toDate;
    return this.callTool('get_repo_commits', params);
  }

  async getRepoIssues(owner: string, repo: string, state: string = 'open', limit: number = 30, fromDate?: string, toDate?: string): Promise<any> {
    const params: any = { owner, repo, state, limit };
    if (fromDate) params.since = fromDate;
    if (toDate) params.until = toDate;
    return this.callTool('get_repo_issues', params);
  }

  async getRepoPullRequests(owner: string, repo: string, state: string = 'open', limit: number = 30, fromDate?: string, toDate?: string): Promise<any> {
    const params: any = { owner, repo, state, limit };
    if (fromDate) params.since = fromDate;
    if (toDate) params.until = toDate;
    return this.callTool('get_repo_pull_requests', params);
  }

  async close(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isInitialized = false;
    }
  }
}

// Singleton instance for the GitHub activity MCP server
let mcpClient: MCPClient | null = null;

export async function getMCPClient(): Promise<MCPClient> {
  if (!mcpClient) {
    // Initialize the MCP client with the GitHub activity server
    mcpClient = new MCPClient('node', ['/home/sharyu/Documents/Cline/MCP/github-activity-server/build/index.js']);
    await mcpClient.initialize();
  }
  return mcpClient;
}
