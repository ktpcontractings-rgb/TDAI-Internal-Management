import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './routers.js';

const PORT = process.env.PORT || 3000;

const server = createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
});

server.server.on('request', (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
});

server.listen(PORT);

console.log(`🚀 tRPC Server running on port ${PORT}`);
console.log(`📡 API endpoint: http://localhost:${PORT}`);

