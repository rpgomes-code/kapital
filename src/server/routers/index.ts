import { router } from '../trpc';

// You can add your routers here as you develop your application
// Example: import { userRouter } from './user';

export const appRouter = router({
  // Example: user: userRouter,
});

export type AppRouter = typeof appRouter;
