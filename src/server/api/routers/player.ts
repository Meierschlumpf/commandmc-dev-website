import { z } from "zod";
import { getPlayerByName, getPlayers } from "../../../helpers/api";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const playerRouter = createTRPCRouter({
  all: publicProcedure.query(async () => await getPlayers()),
  byName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return getPlayerByName(input.name);
    }),
});
