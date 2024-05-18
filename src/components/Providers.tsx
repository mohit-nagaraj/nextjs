"use client";
import { trpc } from "@/app/_trpc/client";
import { absoluteUrl } from "@/lib/util";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { PropsWithChildren, useState } from "react";

//Props with children is provided by react as {children: ReactNode}
const Providers = ({ children }: PropsWithChildren) => {
  //queryClient is a react-query hook
  const [queryClient] = useState(() => new QueryClient());
  //trpcClient is a trpc hook, thing wrapper around react query
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: absoluteUrl("/api/trpc"),
        }),
      ],
    })
  );

  return (
    // pass both to provider of trpc
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {/* we need to use react query independently */}
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
