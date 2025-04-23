import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { cookies } from 'next/headers';

export async function createContext(opts: FetchCreateContextFnOptions) {
  const cookieStore = cookies();
  
  return {
    headers: opts.req.headers,
    cookies: cookieStore,
    // We'll integrate database and authentication context later
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
