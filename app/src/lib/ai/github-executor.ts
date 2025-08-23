import { z } from 'zod';

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to make GitHub API calls
async function githubApiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Assistant/1.0',
  };

  // Add GitHub token if available
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    headers['Authorization'] = `token ${githubToken}`;
  }

  // Add any additional headers from options
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          headers[key] = String(value);
        }
      });
    }
  }

  console.log(`Making GitHub API call to: ${url}`);

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`GitHub API call successful for: ${url}`);
    return result;
  } catch (error) {
    console.error(`GitHub API call failed for ${url}:`, error);
    throw error;
  }
}

// GitHub Repository Tools
export async function getRepositoryInfo(args: { owner: string; repo: string }) {
  const { owner, repo } = args;
  return await githubApiCall(`/repos/${owner}/${repo}`);
}

export async function searchRepositories(args: {
  query: string;
  language?: string;
  stars?: string;
  sort?: 'stars' | 'forks' | 'updated' | 'help-wanted-issues';
  order?: 'desc' | 'asc';
}) {
  const { query, language, stars, sort, order } = args;
  let searchQuery = query;

  if (language) searchQuery += ` language:${language}`;
  if (stars) searchQuery += ` stars:${stars}`;

  const params = new URLSearchParams({
    q: searchQuery,
    sort: sort || 'stars',
    order: order || 'desc',
    per_page: '100'
  });

  return await githubApiCall(`/search/repositories?${params}`);
}

export async function getRepositoryIssues(args: {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string;
  assignee?: string;
  creator?: string;
  per_page?: number;
}) {
  const { owner, repo, state, labels, assignee, creator, per_page } = args;
  const params = new URLSearchParams();

  if (state) params.append('state', state);
  if (labels) params.append('labels', labels);
  if (assignee) params.append('assignee', assignee);
  if (creator) params.append('creator', creator);
  if (per_page) params.append('per_page', per_page.toString());

  const queryString = params.toString();
  return await githubApiCall(`/repos/${owner}/${repo}/issues${queryString ? `?${queryString}` : ''}`);
}

export async function getRepositoryPullRequests(args: {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  base?: string;
  head?: string;
  per_page?: number;
}) {
  const { owner, repo, state, base, head, per_page } = args;
  const params = new URLSearchParams();

  if (state) params.append('state', state);
  if (base) params.append('base', base);
  if (head) params.append('head', head);
  if (per_page) params.append('per_page', per_page.toString());

  const queryString = params.toString();
  return await githubApiCall(`/repos/${owner}/${repo}/pulls${queryString ? `?${queryString}` : ''}`);
}

export async function getRepositoryCommits(args: {
  owner: string;
  repo: string;
  branch?: string;
  since?: string;
  until?: string;
  author?: string;
  per_page?: number;
}) {
  const { owner, repo, branch, since, until, author, per_page } = args;
  const params = new URLSearchParams();

  if (branch) params.append('sha', branch);
  if (since) params.append('since', since);
  if (until) params.append('until', until);
  if (author) params.append('author', author);
  if (per_page) params.append('per_page', per_page.toString());

  const queryString = params.toString();
  return await githubApiCall(`/repos/${owner}/${repo}/commits${queryString ? `?${queryString}` : ''}`);
}

export async function getRepositoryContributors(args: {
  owner: string;
  repo: string;
  per_page?: number;
}) {
  const { owner, repo, per_page } = args;
  const params = per_page ? `?per_page=${per_page}` : '';
  return await githubApiCall(`/repos/${owner}/${repo}/contributors${params}`);
}

export async function getRepositoryLanguages(args: { owner: string; repo: string }) {
  const { owner, repo } = args;
  return await githubApiCall(`/repos/${owner}/${repo}/languages`);
}

export async function getRepositoryTopics(args: { owner: string; repo: string }) {
  const { owner, repo } = args;
  return await githubApiCall(`/repos/${owner}/${repo}/topics`);
}

export async function getRepositoryReadme(args: { owner: string; repo: string; ref?: string }) {
  const { owner, repo, ref } = args;
  const params = ref ? `?ref=${ref}` : '';
  return await githubApiCall(`/repos/${owner}/${repo}/readme${params}`);
}

export async function getRepositoryFiles(args: { owner: string; repo: string; path?: string; ref?: string }) {
  const { owner, repo, path, ref } = args;
  const params = new URLSearchParams();

  if (path) params.append('path', path);
  if (ref) params.append('ref', ref);

  const queryString = params.toString();
  const endpoint = path ? `/repos/${owner}/${repo}/contents/${path}` : `/repos/${owner}/${repo}/contents`;
  return await githubApiCall(`${endpoint}${queryString ? `?${queryString}` : ''}`);
}

export async function getRepositoryReleases(args: { owner: string; repo: string; per_page?: number }) {
  const { owner, repo, per_page } = args;
  const params = per_page ? `?per_page=${per_page}` : '';
  return await githubApiCall(`/repos/${owner}/${repo}/releases${params}`);
}

// GitHub User Tools
export async function getUserProfile(args: { username: string }) {
  const { username } = args;
  return await githubApiCall(`/users/${username}`);
}

export async function getUserRepositories(args: {
  username: string;
  type?: 'all' | 'owner' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  per_page?: number;
}) {
  const { username, type, sort, direction, per_page } = args;
  const params = new URLSearchParams();

  if (type) params.append('type', type);
  if (sort) params.append('sort', sort);
  if (direction) params.append('direction', direction);
  if (per_page) params.append('per_page', per_page.toString());

  const queryString = params.toString();
  return await githubApiCall(`/users/${username}/repos${queryString ? `?${queryString}` : ''}`);
}

export async function getUserActivity(args: { username: string; per_page?: number }) {
  const { username, per_page } = args;
  const params = per_page ? `?per_page=${per_page}` : '';
  return await githubApiCall(`/users/${username}/events${params}`);
}

// GitHub Organization Tools
export async function getOrganizationInfo(args: { org: string }) {
  const { org } = args;
  return await githubApiCall(`/orgs/${org}`);
}

export async function getOrganizationRepositories(args: {
  org: string;
  type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  per_page?: number;
}) {
  const { org, type, sort, direction, per_page } = args;
  const params = new URLSearchParams();

  if (type) params.append('type', type);
  if (sort) params.append('sort', sort);
  if (direction) params.append('direction', direction);
  if (per_page) params.append('per_page', per_page.toString());

  const queryString = params.toString();
  return await githubApiCall(`/orgs/${org}/repos${queryString ? `?${queryString}` : ''}`);
}

export async function getOrganizationMembers(args: { org: string; per_page?: number }) {
  const { org, per_page } = args;
  const params = per_page ? `?per_page=${per_page}` : '';
  return await githubApiCall(`/orgs/${org}/members${params}`);
}

// GitHub Search Tools
export async function searchCode(args: {
  query: string;
  language?: string;
  user?: string;
  repo?: string;
  filename?: string;
  extension?: string;
  per_page?: number;
}) {
  const { query, language, user, repo, filename, extension, per_page } = args;
  let searchQuery = query;

  if (language) searchQuery += ` language:${language}`;
  if (user) searchQuery += ` user:${user}`;
  if (repo) searchQuery += ` repo:${repo}`;
  if (filename) searchQuery += ` filename:${filename}`;
  if (extension) searchQuery += ` extension:${extension}`;

  const params = new URLSearchParams({
    q: searchQuery,
    per_page: (per_page || 100).toString()
  });

  return await githubApiCall(`/search/code?${params}`);
}

export async function searchIssues(args: {
  query: string;
  state?: 'open' | 'closed';
  author?: string;
  assignee?: string;
  mentions?: string;
  user?: string;
  repo?: string;
  label?: string;
  language?: string;
  is?: 'pr' | 'issue';
  per_page?: number;
}) {
  const { query, state, author, assignee, mentions, user, repo, label, language, is, per_page } = args;
  let searchQuery = query;

  if (state) searchQuery += ` state:${state}`;
  if (author) searchQuery += ` author:${author}`;
  if (assignee) searchQuery += ` assignee:${assignee}`;
  if (mentions) searchQuery += ` mentions:${mentions}`;
  if (user) searchQuery += ` user:${user}`;
  if (repo) searchQuery += ` repo:${repo}`;
  if (label) searchQuery += ` label:"${label}"`;
  if (language) searchQuery += ` language:${language}`;
  if (is) searchQuery += ` is:${is}`;

  const params = new URLSearchParams({
    q: searchQuery,
    per_page: (per_page || 100).toString()
  });

  return await githubApiCall(`/search/issues?${params}`);
}

export async function searchUsers(args: {
  query: string;
  sort?: 'followers' | 'repositories' | 'joined';
  order?: 'asc' | 'desc';
  per_page?: number;
}) {
  const { query, sort, order, per_page } = args;
  const params = new URLSearchParams({
    q: query,
    sort: sort || 'followers',
    order: order || 'desc',
    per_page: (per_page || 100).toString()
  });

  return await githubApiCall(`/search/users?${params}`);
}
