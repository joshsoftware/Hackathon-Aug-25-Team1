import { Octokit } from '@octokit/rest';

export interface RepositoryActivity {
  commits: any[];
  issues: any[];
  pullRequests: any[];
  repositoryInfo: any;
  codeReviews: any[];
}

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    });
    
    this.owner = process.env.REPO_OWNER!;
    this.repo = process.env.REPO_NAME!;
  }

  async getRepositoryActivity(daysBack: number = 30): Promise<RepositoryActivity> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysBack);
    const since = thirtyDaysAgo.toISOString();

    try {
      // Fetch all activity types in parallel
      const [commits, issues, pullRequests, repositoryInfo] = await Promise.all([
        this.getCommits(since),
        this.getIssues(since),
        this.getPullRequests(),
        this.getRepositoryInfo()
      ]);

      // Get code reviews for pull requests
      const codeReviews = await this.getCodeReviews(pullRequests);

      return {
        commits,
        issues,
        pullRequests,
        repositoryInfo,
        codeReviews
      };
    } catch (error) {
      console.error('Error fetching repository activity:', error);
      throw error;
    }
  }

  private async getCommits(since: string) {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner: this.owner,
      repo: this.repo,
      since,
      per_page: 100
    });

    return data.map(commit => ({
      sha: commit.sha,
      author: commit.commit.author,
      committer: commit.commit.committer,
      message: commit.commit.message,
      date: commit.commit.author?.date,
      url: commit.html_url,
      stats: commit.stats,
      files: commit.files
    }));
  }

  private async getIssues(since: string) {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state: 'all',
      since,
      per_page: 100
    });

    // Filter out pull requests (they appear in issues API)
    const issues = data.filter(issue => !issue.pull_request);

    // Get comments for each issue
    const issuesWithComments = await Promise.all(
      issues.map(async (issue) => {
        const { data: comments } = await this.octokit.rest.issues.listComments({
          owner: this.owner,
          repo: this.repo,
          issue_number: issue.number
        });

        return {
          ...issue,
          comments_data: comments
        };
      })
    );

    return issuesWithComments;
  }

  private async getPullRequests() {
    const { data } = await this.octokit.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state: 'all',
      sort: 'updated',
      direction: 'desc',
      per_page: 100
    });

    return data;
  }

  private async getRepositoryInfo() {
    const { data } = await this.octokit.rest.repos.get({
      owner: this.owner,
      repo: this.repo
    });

    return {
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.watchers_count,
      open_issues: data.open_issues_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
      language: data.language,
      size: data.size
    };
  }

  private async getCodeReviews(pullRequests: any[]) {
    const reviews = await Promise.all(
      pullRequests.map(async (pr) => {
        try {
          const { data } = await this.octokit.rest.pulls.listReviews({
            owner: this.owner,
            repo: this.repo,
            pull_number: pr.number
          });

          return {
            pullRequestNumber: pr.number,
            reviews: data
          };
        } catch (error) {
          console.error(`Error fetching reviews for PR #${pr.number}:`, error);
          return {
            pullRequestNumber: pr.number,
            reviews: []
          };
        }
      })
    );

    return reviews.flat();
  }
}
