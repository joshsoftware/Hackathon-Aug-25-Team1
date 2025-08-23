# Jira MCP API Integration Project

A Next.js + TypeScript project that integrates with Jira using Model Context Protocol (MCP) to provide comprehensive API endpoints for testing in Postman and retrieving employee data.

## 🚀 Features

- **Complete Jira API Integration**: All major Jira endpoints covered
- **MCP Architecture**: Built with Model Context Protocol for extensibility
- **Postman Ready**: All endpoints documented and ready for Postman testing
- **Interactive Dashboard**: Web interface to test API endpoints
- **Employee Data Extraction**: Specialized workflow to get data from all employees
- **TypeScript Support**: Full type safety and IntelliSense
- **Error Handling**: Comprehensive error handling and validation

## 📋 API Endpoints

### Projects

- `GET /api/mcp?action=projects` - List all accessible projects
- `GET /api/mcp?action=project&projectId={id}` - Get specific project details

### Issues / Tickets

- `GET /api/mcp?action=issues` - List issues with filtering options
- `GET /api/mcp?action=issue&issueIdOrKey={key}` - Get specific issue
- `POST /api/mcp?action=create-issue` - Create new issue
- `POST /api/mcp?action=transition-issue` - Move issue between statuses
- `POST /api/mcp?action=add-comment` - Add comment to issue

### Users

- `GET /api/mcp?action=users&query={search}` - Search for users
- `GET /api/mcp?action=user&accountId={id}` - Get specific user details

### Boards / Sprints

- `GET /api/mcp?action=boards` - List all boards
- `GET /api/mcp?action=sprints&boardId={id}` - List sprints for a board
- `GET /api/mcp?action=sprint-issues&sprintId={id}` - Get issues in a sprint

### Health Check

- `GET /api/mcp?action=health` - API health status and configuration

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Jira Cloud instance with API access
- Jira API token (create at: <https://id.atlassian.com/manage-profile/security/api-tokens>)

### 1. Clone and Install

```bash
git clone <repository-url>
cd Hackathon-Aug-25-Team1
cd app
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the `app/` directory:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

**How to get your Jira API Token:**

1. Go to <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Click "Create API token"
3. Give it a label (e.g., "MCP API Integration")
4. Copy the generated token

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: <http://localhost:3000>

## 🧪 Testing

### Option 1: Web Dashboard

1. Open <http://localhost:3000> in your browser
2. Click the "Health Check" button to verify configuration
3. Test other endpoints using the interactive buttons
4. View responses in real-time with JSON formatting

### Option 2: Postman Testing

1. Import the endpoints from `POSTMAN_API_DOCUMENTATION.md`
2. Set up Postman environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `projectKey`: Your test project key
   - `issueKey`: A test issue key
   - `boardId`: A test board ID

3. Test endpoints systematically:
   - Start with Health Check
   - List Projects to get project keys
   - List Issues for each project
   - Extract user data from issues

## 👥 Getting Employee Data Workflow

To retrieve data from all employees in your organization:

### Step 1: Get All Projects

```
GET /api/mcp?action=projects
```

This returns all accessible projects with their keys.

### Step 2: Get Issues for Each Project

```
GET /api/mcp?action=issues&projectKey={PROJECT_KEY}
```

Extract unique user account IDs from `assignee` and `reporter` fields.

### Step 3: Search for Users

```
GET /api/mcp?action=users&query=@yourcompany.com
```

Search using your company domain to find all employees.

### Step 4: Get Detailed User Information

```
GET /api/mcp?action=user&accountId={ACCOUNT_ID}
```

Get complete user details for each unique account ID.

### Step 5: Aggregate Data

Combine all user information to create a comprehensive employee database.

## 📁 Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/mcp/route.ts      # Main API endpoints
│   │   ├── page.tsx              # Interactive dashboard
│   │   └── layout.tsx            # App layout
│   └── mcp/
│       └── client.ts             # Jira MCP client
├── .env.example                  # Environment template
├── .env.local                    # Your credentials (create this)
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config

POSTMAN_API_DOCUMENTATION.md      # Comprehensive API docs
README.md                         # This file
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JIRA_BASE_URL` | Your Jira instance URL | `https://mycompany.atlassian.net` |
| `JIRA_EMAIL` | Your Jira account email | `john.doe@mycompany.com` |
| `JIRA_API_TOKEN` | Your Jira API token | `ATATT3xFfGF0T4uT...` |

### Query Parameters

Most endpoints support additional filtering:

- `projectKey`: Filter by project
- `status`: Filter by issue status
- `assignee`: Filter by assignee email
- `since`: Filter by date (YYYY-MM-DD format)
- `jql`: Custom JQL queries
- `state`: Sprint state (active, closed, future)

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing parameters)
- `401`: Unauthorized (invalid credentials)
- `404`: Not Found
- `500`: Internal Server Error

## 🔍 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your API token is correct
   - Verify your email matches your Jira account
   - Ensure your Jira instance URL is correct

2. **Network Errors**
   - Verify your Jira instance is accessible
   - Check firewall/proxy settings
   - Ensure CORS is properly configured

3. **Empty Results**
   - Verify you have access to the requested resources
   - Check project permissions in Jira
   - Try different query parameters

### Debug Mode

Enable debug logging by checking the browser console or server logs for detailed error information.

## 📚 Additional Resources

- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Jira Agile REST API](https://developer.atlassian.com/cloud/jira/software/rest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review the Postman documentation
3. Check Jira API documentation
4. Create an issue in the repository

---

**Happy Testing! 🎉**

This project provides a comprehensive foundation for Jira API integration and employee data extraction. Use the interactive dashboard for quick testing or Postman for detailed API exploration.
