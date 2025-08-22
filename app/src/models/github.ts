import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

const githubToken = process.env.GITHUB_TOKEN || '';

const axiosInstance = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    Authorization: `token ${githubToken}`,
    Accept: 'application/vnd.github.v3+json',
  },
});

export interface Commit {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  author: { login: string } | null;
}

export interface PullRequest {
  id: number;
  state: string;
  title: string;
  user: { login: string };
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
}

export interface Issue {
  id: number;
  state: string;
  title: string;
  user: { login: string };
  created_at: string;
  closed_at: string | null;
  pull_request?: object; // Issues can also be pull requests; this field exists if it's a PR
}

export async function fetchCommits(owner: string, repo: string): Promise<Commit[]> {
  const response = await axiosInstance.get<Commit[]>(`/repos/${owner}/${repo}/commits`);
  return response.data;
}

export async function fetchPullRequests(owner: string, repo: string): Promise<PullRequest[]> {
  const response = await axiosInstance.get<PullRequest[]>(`/repos/${owner}/${repo}/pulls`, {
    params: { state: 'all' },
  });
  return response.data;
}

export async function fetchIssues(owner: string, repo: string): Promise<Issue[]> {
  const response = await axiosInstance.get<Issue[]>(`/repos/${owner}/${repo}/issues`, {
    params: { state: 'all' },
  });
  return response.data;
}

export interface Collaborator {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
}

export async function fetchCollaborators(owner: string, repo: string): Promise<Collaborator[]> {
  const response = await axiosInstance.get<Collaborator[]>(`/repos/${owner}/${repo}/collaborators`);
  return response.data;
}
