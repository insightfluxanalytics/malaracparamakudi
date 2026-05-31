// api/bookings.js
// Vercel Serverless Function to serve as a CORS-enabled proxy database for Malar A/C bookings

export default async function handler(req, res) {
  // 1. Enable CORS for all domains to support both local testing (localhost, file://) and the live domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const cloudDbUrl = 'https://jsonbin-zeta.vercel.app/api/bins/2iDz1QCCEL';

  try {
    if (req.method === 'GET') {
      const response = await fetch(cloudDbUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch database from cloud storage (Status: ${response.status})`);
      }
      const data = await response.json();
      
      // Ensure the return structure is consistently { data: [...] } for both app.js and admin.html
      const bookingsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
      return res.status(200).json({ data: bookingsArray });

    } else if (req.method === 'PUT') {
      // The frontend sends a clean array of updated bookings. We save it directly to the cloud store
      const bookings = req.body;
      
      if (!Array.isArray(bookings)) {
        return res.status(400).json({ status: 'error', message: 'Payload must be a JSON array of bookings' });
      }

      const response = await fetch(cloudDbUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookings)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save database to cloud storage (Status: ${response.status})`);
      }
      
      const resData = await response.json();
      return res.status(200).json({ status: 'success', data: resData });

    } else {
      return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Error in bookings serverless handler:", error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
