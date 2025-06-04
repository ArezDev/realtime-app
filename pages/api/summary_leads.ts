import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSummary } from '@/lib/get_summary'; // ini aman, karena ini route server

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    const Saiki = `${year}-${month}-${day}`;

    const { start, end } = req.query;

    if(typeof start !== 'string' || typeof end !== 'string') {
        return res.status(404).json({ error: 'Missing parameter date!' });
    }

    try {
        const data = await fetchSummary(start, end);
        if (!data) return res.status(404).json({ error: 'Data not found' });

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
  
}