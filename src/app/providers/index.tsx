"use client";
import React, { PropsWithChildren } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientConfig,
  QueryClientProvider,
} from "@tanstack/react-query";
import { SessionProvider } from "./SessionProviders";
import { ThemeProvider } from "./ThemeProvider";

const Providers = ({ children }: PropsWithChildren) => {
  const config = {
    onError: (err: { message: string }) => {
      console.log(err);
    },
  };
  const gqlGlobalOptions: QueryClientConfig = {
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache(config),
    mutationCache: new MutationCache(config),
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={new QueryClient(gqlGlobalOptions)}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
