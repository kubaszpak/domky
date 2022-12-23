import {
	changeListingsAvailabilitySchema,
	createSchema,
	searchSchema,
} from "@/utils/schemas";
import { ListingStatus, ReservationStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authedProcedure, t } from "../utils";

export const listingRouter = t.router({
	all: t.procedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany({
			where: {
				status: ListingStatus.ACTIVE,
			},
		});
	}),
	me: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				availability: true,
				reservations: {
					include: {
						dateRange: true,
					},
				},
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
	search: t.procedure
		.input(searchSchema.nullable())
		.query(async ({ ctx, input }) => {
			if (!input) return;
			return await ctx.prisma.listing.findMany({
				where: {
					city: input.where,
					status: ListingStatus.ACTIVE,
					availability: {
						start: {
							lte: input.date_start,
						},
						end: {
							gte: input.date_end,
						},
					},
					reservations: {
						none: {
							status: ReservationStatus.CONFIRMED,
							dateRange: {
								start: {
									lt: input.date_end,
								},
								end: {
									gt: input.date_start,
								},
							},
						},
					},
					guests: {
						gte: input.guests,
					},
				},
				include: {
					availability: true,
				},
			});
		}),
	get: t.procedure
		.input(z.string().nullable())
		.query(async ({ input: id, ctx }) => {
			if (!id) return;
			return await ctx.prisma.listing.findFirst({
				where: {
					id: id,
				},
				include: {
					availability: true,
				},
			});
		}),
	changeAvailability: authedProcedure
		.input(changeListingsAvailabilitySchema)
		.mutation(async ({ input, ctx }) => {
			const listing = await ctx.prisma.listing.findFirstOrThrow({
				where: {
					id: input.listingId,
				},
				include: {
					reservations: {
						include: {
							dateRange: true,
						},
					},
				},
			});

			if (ctx.session.user.id !== listing.userId) return;

			for (const reservation of listing.reservations) {
				if (
					reservation.status !== ReservationStatus.CONFIRMED ||
					reservation.dateRange.end < new Date()
				)
					continue;

				if (
					reservation.dateRange.start < input.dateStart ||
					reservation.dateRange.end > input.dateEnd
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message:
							"There is a reservation conflicting with the new date range.",
					});
				}
			}

			return await ctx.prisma.dateRange.update({
				where: {
					listingId: listing.id,
				},
				data: {
					start: input.dateStart,
					end: input.dateEnd,
				},
			});
		}),
	edit: authedProcedure
		.input(
			createSchema.extend({
				listingId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const listing = await ctx.prisma.listing.findFirstOrThrow({
				where: {
					id: input.listingId,
				},
			});

			if (ctx.session.user.id !== listing.userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Not authorized to edit this listing!",
				});
			}
			const { date_start, date_end, listingId, ...data } = input;

			return await ctx.prisma.listing.update({
				where: {
					id: listingId,
				},
				data,
			});
		}),
});
