#!/usr/bin/env node
import { createServer, request as httpRequest } from 'node:http';
import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const PROXY_PORT = Number(process.env.PORT || 3001);
const ROOT = process.cwd();

const MINT_PORT_START = 40000 + Math.floor(Math.random() * 10000);
const mint = spawn('npx', ['mint', 'dev', '--port', String(MINT_PORT_START), '--no-open'], {
  stdio: ['inherit', 'pipe', 'pipe'],
});

const cleanup = () => { mint.kill('SIGTERM'); process.exit(0); };
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
mint.on('exit', (code) => { console.log(`mint dev exited (${code})`); process.exit(code ?? 1); });

let mintPort = null;
let started = false;

const watchForPort = (chunk) => {
  process.stdout.write(chunk);
  if (mintPort) return;
  const match = chunk.toString().match(/localhost:(\d+)/);
  if (match) {
    mintPort = Number(match[1]);
    if (mintPort !== PROXY_PORT && !started) {
      started = true;
      startProxy();
    }
  }
};
mint.stdout.on('data', watchForPort);
mint.stderr.on('data', (chunk) => process.stderr.write(chunk));

const STATIC_PREFIXES = ['/resources/', '/api-reference/specs/'];
const isStaticJson = (url) => {
  const path = url.split('?')[0];
  return path.endsWith('.json') && STATIC_PREFIXES.some((p) => path.startsWith(p));
};

const stripDocsPrefix = (url) => {
  if (url === '/docs') return '/';
  if (url.startsWith('/docs/')) return url.slice('/docs'.length);
  return url;
};

function startProxy() {
  const server = createServer(async (req, res) => {
    const path = stripDocsPrefix(req.url);
    if ((req.method === 'GET' || req.method === 'HEAD') && isStaticJson(path)) {
      try {
        const data = await readFile(join(ROOT, path.split('?')[0]));
        const headers = {
          'content-type': 'application/json; charset=utf-8',
          'content-length': String(data.length),
        };
        res.writeHead(200, headers);
        res.end(req.method === 'HEAD' ? undefined : data);
        return;
      } catch {}
    }
    const proxyReq = httpRequest(
      { hostname: 'localhost', port: mintPort, method: req.method, path, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', (err) => { res.writeHead(502); res.end(`proxy error: ${err.message}`); });
    req.pipe(proxyReq);
  });

  server.on('upgrade', (req, socket, head) => {
    const upstream = connect(mintPort, 'localhost', () => {
      upstream.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
      for (const [k, v] of Object.entries(req.headers)) upstream.write(`${k}: ${v}\r\n`);
      upstream.write('\r\n');
      if (head?.length) upstream.write(head);
      socket.pipe(upstream).pipe(socket);
    });
    upstream.on('error', () => socket.end());
    socket.on('error', () => upstream.end());
  });

  server.listen(PROXY_PORT, () => {
    console.log(`\n  unified dev server → http://localhost:${PROXY_PORT}`);
    console.log(`  static JSON from disk; everything else proxied to mint dev (:${mintPort})\n`);
  });
}
