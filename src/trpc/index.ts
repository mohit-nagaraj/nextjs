import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { absoluteUrl } from "@/lib/util";
import { getUserSubscriptionPlan, stripe } from "@/lib/stripe";
import { PLANS } from "../../stripe";

const INFINITE_QUERY_LIMIT = 10;
//can export as we are using it only on server side
// querys and mutations are used to create api endpoints
// query is for get requests
// mutation is for post,patch,delete requests
// all the api endpoints are defined here
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user?.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    //check if user is in db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });
    if (!dbUser) {
      //create user in db
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  //shud be private as we are getting user files
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
  //api endpoint to get all the messages of a file
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT
      //again the typical check
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
      //get messages from db
      const messages = await db.message.findMany({
        // imp cuz as tracker to get the next set of messages (first point in it)
        take: limit + 1,
        where: {
          fileId,
        },
        //order by latest first
        //so tht it chronologically displays
        orderBy: {
          createdAt: 'desc',
        },
        //if cursor is present, get messages after that
        cursor: cursor ? { id: cursor } : undefined,
        //select only the required fields
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })
      //to determine the next cursor if there are more messages
      let nextCursor: typeof cursor | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })
      //we added as const to tell typescript that the value is fixed
      if (!file) return { status: 'PENDING' as const}

      return { status: file.uploadStatus }
    }),
  //polling route
  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      return file
    }),
    createStripeSession: privateProcedure.mutation(
      async ({ ctx }) => {
        const { userId } = ctx
  
        const billingUrl = absoluteUrl('/dashboard/billing')
  
        if (!userId)
          throw new TRPCError({ code: 'UNAUTHORIZED' })
  
        const dbUser = await db.user.findFirst({
          where: {
            id: userId,
          },
        })
  
        if (!dbUser)
          throw new TRPCError({ code: 'UNAUTHORIZED' })
  
        const subscriptionPlan =
          await getUserSubscriptionPlan()
  
        if (
          subscriptionPlan.isSubscribed &&
          dbUser.stripeCustomerId
        ) {
          const stripeSession =
            await stripe.billingPortal.sessions.create({
              customer: dbUser.stripeCustomerId,
              return_url: billingUrl,
            })
  
          return { url: stripeSession.url }
        }
  
        const stripeSession =
          await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            line_items: [
              {
                price: PLANS.find(
                  (plan) => plan.name === 'Pro'
                )?.price.priceIds.test,
                quantity: 1,
              },
            ],
            metadata: {
              userId: userId,
            },
          })
  
        return { url: stripeSession.url }
      }
    ),
  //since we need a post body
  //we need to take input as the id of the file
  //use a schema validation library like zod to validate the input
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      //dince this is a private route, id is already passed
      //as defined in the middle ware
      const { userId } = ctx;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file
    }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
