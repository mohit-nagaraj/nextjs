import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
 
//can export as we are using it only on server side
// querys and mutations are used to create api endpoints
// query is for get requests
// mutation is for post,patch,delete requests
export const appRouter = router({
  authCallback: publicProcedure.query(async()=>{
    const {getUser}=getKindeServerSession()
    const user= await getUser()
    if(!user?.id || !user.email){
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    //check if user is in db

    return {success:true}
  })
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;