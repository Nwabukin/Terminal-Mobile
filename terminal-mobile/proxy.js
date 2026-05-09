const http = require('http');
const https = require('https');
const url = require('url');

const TARGET = 'https://terminalv2-production.up.railway.app';
const PORT = 3456;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const targetUrl = `${TARGET}${req.url}`;
  const parsed = url.parse(targetUrl);

  const options = {
    hostname: parsed.hostname,
    port: 443,
    path: parsed.path,
    method: req.method,
    headers: { ...req.headers, host: parsed.hostname },
  };

  delete options.headers['origin'];
  delete options.headers['referer'];

  const proxyReq = https.request(options, (proxyRes) => {
    const headers = { ...proxyRes.headers };
    headers['access-control-allow-origin'] = '*';
    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`CORS proxy running on http://localhost:${PORT} -> ${TARGET}`);
});
