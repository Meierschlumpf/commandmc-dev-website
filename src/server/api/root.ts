import { createTRPCRouter } from "./trpc";
import { playerRouter } from "./routers/player";
import { leaderBoardRouter } from "./routers/leaderboard";
import { newsRouter } from "./routers/news";
import { serverRouter } from "./routers/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  player: playerRouter,
  leaderBoard: leaderBoardRouter,
  news: newsRouter,
  server: serverRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
