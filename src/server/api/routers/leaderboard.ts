import { z } from "zod";
import type { Player } from "../../../helpers/api";
import { getPlayers } from "../../../helpers/api";
import { createTRPCRouter, publicProcedure } from "../trpc";

const calculateDefaultPoints = (stats: Player["statistics"]["safewalk"]) => {
  const winPoints = stats.wins * 50;
  const killPoints = stats.kills * 10;
  const deathPoints = stats.deaths * -5;
  const playPoints = stats.plays * 2;

  return winPoints + killPoints + deathPoints + playPoints;
};

const getTop3 = (
  players: Player[],
  callback: (p: Player) => Player["statistics"]["safewalk"]
) =>
  players
    .map((p) => ({
      name: p.name,
      points: calculateDefaultPoints(callback(p)),
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((p, i) => ({ ...p, rank: i + 1 }));

export const leaderBoardRouter = createTRPCRouter({
  overview: publicProcedure.query(async () => {
    const players = await getPlayers();

    return {
      safewalk: getTop3(players, (p) => p.statistics.safewalk),
      smash: getTop3(players, (p) => p.statistics.smash),
    };
  }),
  byName: publicProcedure
    .input(
      z.object({ name: z.union([z.literal("safewalk"), z.literal("smash")]) })
    )
    .query(async ({ input }) => {
      const players = await getPlayers();

      return {
        name: input.name === "safewalk" ? "SafeWalk" : "Smash",
        items: players
          .filter((p) => p.statistics[input.name].plays > 0)
          .map((p) => ({
            name: p.name,
            points: calculateDefaultPoints(p.statistics[input.name]),
          }))
          .sort((a, b) => b.points - a.points)
          .map((p, i) => ({ ...p, rank: i + 1 })),
      };
    }),
});
