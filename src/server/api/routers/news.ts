import { z } from "zod";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const newsRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    const news = await prisma.news.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
        likes: {
          where: {
            userId: ctx.session?.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!ctx.session) return news.map((n) => ({ ...n, hasLiked: false }));

    return news.map((n) => ({ ...n, hasLiked: n.likes.length > 0 }));
  }),
  toggleLikeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const like = await prisma.like.findFirst({
        where: {
          newsId: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (like) {
        await prisma.like.delete({
          where: {
            id: like.id,
          },
        });
        return;
      }

      await prisma.like.create({
        data: {
          newsId: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
