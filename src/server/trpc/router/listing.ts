import { createSchema, searchSchema } from "@/components/utils/schemas";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { z } from "zod";
import { authedProcedure, t } from "../utils";

export const listingRouter = t.router({
	all: t.procedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany();
	}),
	me: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany({
			where: {
				userId: ctx.session.user.id,
			},
		});
	}),
	createListing: authedProcedure
		.input(createSchema)
		.mutation(async ({ ctx, input }) => {
			const { date_start, date_end, ...data } = input;
			if (date_start >= date_end) {
				console.error("Date range invalid!");
				return;
			}
			return await ctx.prisma.listing.create({
				data: {
					userId: ctx.session.user.id,
					availability: {
						create: {
							start: date_start,
							end: date_end,
						},
					},
					...data,
				},
			});
		}),
	search: t.procedure.input(z.optional(searchSchema)).query(async ({ctx, input}) => {
		if (!input) return
		return await ctx.prisma.listing.findMany({
			where: {
				city: input.where,
				availability: {
					start: {
						lte: input.date_start
					},
					end: {
						gte: input.date_end
					}
				},
				reservations: {
					none: {
						dateRange: {
							start: {
								gte: input.date_start
							},
							end: {
								lte: input.date_end
							}
						}
					}
				}
			}
		})
	}),
});
