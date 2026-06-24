export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('https://elena-os-wheat.vercel.app?gmail=error');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'https://elena-os-wheat.vercel.app/api/gmail-callback';
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const tokens = await tokenRes.json();

  if (!tokens.access_token) {
    return res.redirect('https://elena-os-wheat.vercel.app?gmail=error');
  }

  // Store tokens in Supabase
  const h = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };

  await fetch(`${SUPABASE_URL}/rest/v1/gmail_tokens`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      id: 1,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    })
  });

  res.redirect('https://elena-os-wheat.vercel.app?gmail=connected');
}
