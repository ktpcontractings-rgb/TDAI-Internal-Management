import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './routers.js';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const server = createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
  middleware: cors({
    origin: [
      'https://www.michiganailegalteam.com',
      'https://tdai-internal-management.vercel.app',
      'http://localhost:5173', // For local development
      /\.manus\.space$/, // Allow all Manus-hosted domains
      /\.manusvm\.computer$/, // Allow all Manus VM domains
    ],
    credentials: true,
  }),
});

server.listen(PORT);

console.log(`🚀 tRPC Server running on port ${PORT}`);
console.log(`📡 API endpoint: http://localhost:${PORT}`);
console.log(`🌐 CORS enabled for Vercel frontend`);
