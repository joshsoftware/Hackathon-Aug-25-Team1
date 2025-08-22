import type { NextApiRequest, NextApiResponse } from 'next';
import { GitHubService } from '../../lib/github-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { days } = req.query;
    const daysBack = days ? parseInt(days as string) : 30;

    const githubService = new GitHubService();
    const activity = await githubService.getRepositoryActivity(daysBack);

    // Process and format the data
    const formattedActivity = {
      summary: {
        totalCommits: activity.commits.length,
        totalIssues: activity.issues.length,
        totalPullRequests: activity.pullRequests.length,
        activeContributors: [...new Set(activity.commits.map(c => c.author?.name))].length,
        repositoryInfo: activity.repositoryInfo
      },
      details: {
        commits: activity.commits,
        issues: activity.issues,
        pullRequests: activity.pullRequests,
        codeReviews: activity.codeReviews
      }
    };

    res.status(200).json(formattedActivity);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch repository activity',
      error: error.message 
    });
  }
}
