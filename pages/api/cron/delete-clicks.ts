import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const liveClicksResult = await db.execute(
      "DELETE FROM live_clicks WHERE created_at < NOW() - INTERVAL 1 MINUTE"
    );

    const clicksResult = await db.execute(
      "DELETE FROM clicks WHERE created_at < NOW() - INTERVAL 1 DAY"
    );

    // The second element of the result is the ResultSetHeader
    const liveClicksHeader = liveClicksResult[0] as { affectedRows: number };
    const clicksHeader = clicksResult[0] as { affectedRows: number };

    res.status(200).json({
      success: true,
      deleted: {
        live_clicks: liveClicksHeader.affectedRows,
        clicks: clicksHeader.affectedRows
      }
    });
  } catch (error) {
    console.error('Error deleting old clicks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}