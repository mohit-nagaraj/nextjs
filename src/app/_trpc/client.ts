//adding _trpc/client.ts so tht it wont be a route
import { AppRouter } from '@/trpc'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>({})