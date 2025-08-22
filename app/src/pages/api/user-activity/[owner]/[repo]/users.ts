import type { NextApiRequest, NextApiResponse } from 'next';
import { getRepoCollaborators } from '../../../../../processors/userActivity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { owner, repo } = req.query;

  if (typeof owner !== 'string' || typeof repo !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid owner or repo parameter' });
  }

  try {
    const collaborators = await getRepoCollaborators(owner, repo);
    res.status(200).json(collaborators);
  } catch (error: any) {
    console.error('Error fetching collaborators:', error.message);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
}
