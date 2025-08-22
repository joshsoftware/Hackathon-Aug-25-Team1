import { fetchCommits, fetchPullRequests, fetchIssues, Commit, PullRequest, Issue } from '../models/github';

export interface UserActivity {
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
}

export async function getUserActivity(owner: string, repo: string): Promise<UserActivity> {
  const [commits, pullRequests, issues] = await Promise.all([
    fetchCommits(owner, repo),
    fetchPullRequests(owner, repo),
    fetchIssues(owner, repo),
  ]);

  return {
    commits,
    pullRequests,
    issues,
  };
}
