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
    const githubService = new GitHubService();
    const activity = await githubService.getRepositoryActivity(30);
    
    const commitDetails = activity.commits.map(commit => ({
      sha: commit.sha.substring(0, 7),
      author: commit.author?.name,
      date: commit.date,
      message: commit.message.split('\n')[0], // First line only
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      filesChanged: commit.files?.length || 0,
      url: commit.url
    }));

    res.status(200).json({
      total: commitDetails.length,
      commits: commitDetails
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch commits',
      error: error.message 
    });
  }
}
