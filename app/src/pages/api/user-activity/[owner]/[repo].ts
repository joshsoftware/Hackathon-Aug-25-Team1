import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserActivity, UserActivity } from '../../../../processors/userActivity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { owner, repo } = req.query;

  if (typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid owner or repo parameter' });
  }

  try {
    const userActivity: UserActivity = await getUserActivity(owner, repo);
    res.status(200).json(userActivity);
  } catch (error: any) {
    console.error('Error fetching user activity:', error.message);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
}
