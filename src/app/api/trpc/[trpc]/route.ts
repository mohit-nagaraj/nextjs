import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    //no use of createContext, use if we need additional context
    createContext: () => ({})
  });
export { handler as GET, handler as POST };