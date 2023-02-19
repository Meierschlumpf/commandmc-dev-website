import { getPlayerCount } from "../../../helpers/rcon/player-list";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const serverRouter = createTRPCRouter({
  getPlayerCount: publicProcedure.query(async () => await getPlayerCount()),
});
