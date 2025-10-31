import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './routers.js';

const PORT = process.env.PORT || 3000;

const server = createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
});

server.listen(PORT);

console.log(`🚀 tRPC Server running on port ${PORT}`);
console.log(`📡 API endpoint: http://localhost:${PORT}`);
