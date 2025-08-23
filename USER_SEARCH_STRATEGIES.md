# User Search Strategies for Employee Data

## 🎯 Effective User Search Queries

Since the initial "test" query returned empty results, here are better strategies to find all employees in your Jira instance:

### 1. **Search by Company Domain**

```
GET /api/mcp?action=users&query=joshsoftware.com
```

This searches for users with your company domain in their email.

### 2. **Search by Partial Domain**

```
GET /api/mcp?action=users&query=joshsoftware
```

Broader search without the .com extension.

### 3. **Search by Common Names**

```
GET /api/mcp?action=users&query=a
GET /api/mcp?action=users&query=s
GET /api/mcp?action=users&query=john
```

Search for users with common letters or names.

### 4. **Extract Users from Issues (Most Effective)**

```
GET /api/mcp?action=issues
```

Then extract unique `assignee` and `reporter` account IDs from the response.

### 5. **Get User Details**

Once you have account IDs from issues:

```
GET /api/mcp?action=user&accountId={ACCOUNT_ID}
```

## 📋 Complete Employee Data Extraction Workflow

### Step 1: Get All Projects

```bash
curl "http://localhost:3001/api/mcp?action=projects"
```

### Step 2: Get Issues from Each Project

```bash
# Replace PROJECT_KEY with actual project keys from step 1
curl "http://localhost:3001/api/mcp?action=issues&projectKey=PROJECT_KEY"
```

### Step 3: Extract Account IDs

From the issues response, collect all unique values from:

- `fields.assignee.accountId`
- `fields.reporter.accountId`

### Step 4: Get Detailed User Info

```bash
# For each unique account ID
curl "http://localhost:3001/api/mcp?action=user&accountId=ACCOUNT_ID"
```

### Step 5: Search for Additional Users

```bash
curl "http://localhost:3001/api/mcp?action=users&query=joshsoftware.com"
```

## 🔍 Postman Collection Setup

Create these requests in Postman:

### Environment Variables

- `baseUrl`: `http://localhost:3001`
- `projectKey`: (get from projects endpoint)
- `accountId`: (get from issues endpoint)

### Request Collection

1. **Health Check**: `{{baseUrl}}/api/mcp?action=health`
2. **List Projects**: `{{baseUrl}}/api/mcp?action=projects`
3. **List Issues**: `{{baseUrl}}/api/mcp?action=issues&projectKey={{projectKey}}`
4. **Search Users by Domain**: `{{baseUrl}}/api/mcp?action=users&query=joshsoftware.com`
5. **Get User Details**: `{{baseUrl}}/api/mcp?action=user&accountId={{accountId}}`

## 💡 Pro Tips

1. **Start with Issues**: Issues contain the most comprehensive user data
2. **Use Multiple Search Terms**: Try different variations of your company name
3. **Check All Projects**: Different projects may have different users
4. **Combine Results**: Merge data from issues and user search for complete coverage
5. **Export Data**: Use Postman's export feature to save the employee data

## 🚨 Troubleshooting Empty Results

If user search returns empty:

1. ✅ **Check Permissions**: Ensure your API token has user search permissions
2. ✅ **Try Broader Queries**: Use single letters or common names
3. ✅ **Focus on Issues**: Extract users from issue assignees/reporters
4. ✅ **Check Project Access**: Verify you can see projects and issues first
5. ✅ **Test Different Endpoints**: Some endpoints may have different permission requirements

## 📊 Expected Data Structure

### User Object

```json
{
  "accountId": "123456789",
  "displayName": "John Doe",
  "emailAddress": "john.doe@joshsoftware.com",
  "active": true
}
```

### Issue User References

```json
{
  "fields": {
    "assignee": {
      "accountId": "123456789",
      "displayName": "John Doe",
      "emailAddress": "john.doe@joshsoftware.com"
    },
    "reporter": {
      "accountId": "987654321",
      "displayName": "Jane Smith",
      "emailAddress": "jane.smith@joshsoftware.com"
    }
  }
}
```

This approach should help you successfully extract all employee data from your Jira instance!
