# tRPC Implementation Plan for Next.js App Router Project

This document outlines the step-by-step implementation plan for integrating tRPC into the Kapital project using Next.js App Router, following best practices for performance, security, architecture, and maintainability.

## Why tRPC?

- **End-to-End Type Safety**: Fully typed API without code generation or schema definitions
- **No Manual API Documentation**: Types automatically document your API
- **Excellent Developer Experience**: Autocomplete for API endpoints
- **Streamlined API Development**: Reduced boilerplate code
- **Framework-Agnostic**: Can be used across Next.js and mobile apps

## Implementation Checklist

### 1. 📦 Install Dependencies

- [ ] Install tRPC packages:
  ```bash
  bun add @trpc/server @trpc/client @trpc/react-query @trpc/next
  bun add @tanstack/react-query zod superjson
  ```

### 2. 🛠️ Server-Side Setup

- [ ] Create a `server` directory structure:
  ```
  src/
  ├── server/
  │   ├── trpc.ts
  │   ├── context.ts
  │   ├── routers/
  │   │   ├── index.ts
  │   │   └── example.ts
  │   └── api/
  │       └── trpc/
  │           └── [trpc]/
  │               └── route.ts
  ```

- [ ] Set up the tRPC instance in `src/server/trpc.ts`:
  ```typescript
  import { initTRPC } from '@trpc/server';
  import superjson from 'superjson';
  import { ZodError } from 'zod';
  import { Context } from './context';

  const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: 
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

  export const router = t.router;
  export const publicProcedure = t.procedure;
  export const middleware = t.middleware;
  ```

- [ ] Define the context in `src/server/context.ts`:
  ```typescript
  import { inferAsyncReturnType } from '@trpc/server';
  import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
  
  export async function createContext(opts: FetchCreateContextFnOptions) {
    return {
      // Add shared resources here (e.g., database, authentication)
      // session: await getSession(opts),
    };
  }
  
  export type Context = inferAsyncReturnType<typeof createContext>;
  ```

- [ ] Create a sample router in `src/server/routers/example.ts`:
  ```typescript
  import { z } from 'zod';
  import { router, publicProcedure } from '../trpc';
  
  export const exampleRouter = router({
    hello: publicProcedure
      .input(z.object({ text: z.string() }))
      .query(({ input }) => {
        return {
          greeting: `Hello ${input.text}`,
          timestamp: new Date(),
        };
      }),
  });
  ```

- [ ] Set up the root router in `src/server/routers/index.ts`:
  ```typescript
  import { router } from '../trpc';
  import { exampleRouter } from './example';
  
  export const appRouter = router({
    example: exampleRouter,
  });
  
  export type AppRouter = typeof appRouter;
  ```

- [ ] Create the API route handler in `src/app/api/trpc/[trpc]/route.ts`:
  ```typescript
  import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
  import { appRouter } from '@/server/routers';
  import { createContext } from '@/server/context';
  
  const handler = (req: Request) =>
    fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext,
    });
  
  export { handler as GET, handler as POST };
  ```

### 3. 🖥️ Client-Side Setup

- [ ] Create `src/trpc/provider.tsx` for the tRPC provider:
  ```typescript
  'use client';
  
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
  import { loggerLink, httpBatchLink } from '@trpc/client';
  import { createTRPCReact } from '@trpc/react-query';
  import { useState } from 'react';
  import superjson from 'superjson';
  
  import { type AppRouter } from '@/server/routers';
  
  export const trpc = createTRPCReact<AppRouter>();
  
  export function TRPCProvider({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 1000,
        },
      },
    }));
  
    const [trpcClient] = useState(() =>
      trpc.createClient({
        transformer: superjson,
        links: [
          loggerLink({
            enabled: (opts) =>
              process.env.NODE_ENV === 'development' ||
              (opts.direction === 'down' && opts.result instanceof Error),
          }),
          httpBatchLink({
            url: '/api/trpc',
          }),
        ],
      })
    );
  
    return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV !== 'production' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </trpc.Provider>
    );
  }
  ```

- [ ] Update the root layout in `src/app/layout.tsx`:
  ```typescript
  import { TRPCProvider } from '@/trpc/provider';
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en">
        <body>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] Create a client-side utility in `src/trpc/client.ts`:
  ```typescript
  'use client';
  
  import { trpc } from './provider';
  
  export { trpc };
  ```

### 4. 🔒 Authentication & Authorization

- [ ] Add authentication middleware in `src/server/trpc.ts`:
  ```typescript
  const isAuthenticated = t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        ...ctx,
        // Add user info to context
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
  
  // Protected procedures
  export const protectedProcedure = t.procedure.use(isAuthenticated);
  ```

### 5. 🧪 Testing & Usage

- [ ] Create a test component in `src/app/trpc-test/page.tsx`:
  ```typescript
  'use client';
  
  import { trpc } from '@/trpc/client';
  
  export default function TestPage() {
    const hello = trpc.example.hello.useQuery({ text: 'World' });
  
    if (hello.isLoading) return <div>Loading...</div>;
    if (hello.error) return <div>Error: {hello.error.message}</div>;
  
    return (
      <div>
        <h1>tRPC Test</h1>
        <p>{hello.data?.greeting}</p>
        <p>Timestamp: {hello.data?.timestamp.toLocaleString()}</p>
      </div>
    );
  }
  ```

### 6. 🔄 Advanced Features & Optimizations

- [ ] Set up input validation with Zod for all procedures
- [ ] Implement proper error handling:
  ```typescript
  try {
    // Operation
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Operation failed',
      cause: error,
    });
  }
  ```
- [ ] Configure React Query for optimal performance:
  - Adjust `staleTime` and `cacheTime` based on data requirements
  - Implement invalidation strategies for real-time updates
  - Use `prefetchQuery` for critical data paths

### 7. 📱 Mobile Optimization (If Applicable)

- [ ] Configure tRPC client for mobile with appropriate timeout and retry logic:
  ```typescript
  export const trpc = createTRPCReact<AppRouter>({
    config() {
      return {
        links: [
          httpBatchLink({
            url: 'YOUR_API_URL',
            headers() {
              return {
                'x-client-type': 'mobile',
              };
            },
          }),
        ],
        queryClientConfig: {
          defaultOptions: {
            queries: {
              retry: 2,
              cacheTime: 1000 * 60 * 60, // 1 hour
              staleTime: 1000 * 60 * 5, // 5 minutes
            },
          },
        },
      };
    },
  });
  ```

## Best Practices

1. **Modular Router Organization**: Split routers into logical domains based on features
2. **Consistent Error Handling**: Use Zod for validation and TRPCError for typed errors
3. **Type Safety**: Leverage TypeScript to ensure type safety across the entire stack
4. **Performance Optimization**: Use React Query features (caching, prefetching) for optimal performance
5. **Security**: Implement proper authentication and authorization middleware
6. **Testing**: Write unit and integration tests for tRPC routes

## Additional Resources

- [Official tRPC Documentation](https://trpc.io/docs)
- [Next.js + tRPC Examples](https://github.com/trpc/trpc/tree/main/examples/next-prisma-starter)
- [Create T3 App](https://create.t3.gg/) (includes tRPC setup)
