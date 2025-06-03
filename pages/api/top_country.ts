import { NextApiRequest, NextApiResponse } from 'next';
import { fetchCountryData } from '@/lib/data_country'; // ini aman, karena ini route server

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const data = await fetchCountryData();
    if (!data) return res.status(404).json({ error: 'Data not found' });

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
}