// Vercel Serverless Function — reads/writes time tracker data to a GitHub Gist
// Environment variables required: GITHUB_TOKEN, GIST_ID, API_SECRET (optional)

const GIST_FILENAME = 'timetracker-data.json';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { GITHUB_TOKEN, GIST_ID, API_SECRET } = process.env;

  if (!GITHUB_TOKEN || !GIST_ID) {
    return res.status(500).json({ error: 'Server misconfigured: missing GITHUB_TOKEN or GIST_ID' });
  }

  // Optional: simple shared-secret auth to prevent strangers from writing
  if (API_SECRET) {
    const provided = req.headers['x-api-secret'] || req.query.secret;
    if (provided !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const gistUrl = `https://api.github.com/gists/${GIST_ID}`;
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  try {
    // ===== GET — read current data =====
    if (req.method === 'GET') {
      const resp = await fetch(gistUrl, { headers });
      if (!resp.ok) {
        const text = await resp.text();
        return res.status(resp.status).json({ error: 'GitHub API error', detail: text });
      }
      const gist = await resp.json();
      const file = gist.files?.[GIST_FILENAME];
      if (!file) {
        // First time — return empty structure
        return res.status(200).json({ tasks: [], archivedWeeks: [] });
      }
      // Gist truncates large files; if truncated, fetch raw_url
      let content = file.content;
      if (file.truncated && file.raw_url) {
        const rawResp = await fetch(file.raw_url, { headers });
        content = await rawResp.text();
      }
      return res.status(200).json(JSON.parse(content));
    }

    // ===== POST — write data =====
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      // Validate it's proper JSON
      JSON.parse(body);

      const resp = await fetch(gistUrl, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: { content: body }
          }
        })
      });

      if (!resp.ok) {
        const text = await resp.text();
        return res.status(resp.status).json({ error: 'GitHub API error', detail: text });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
