import { updateReservationStatusSchema } from "@/utils/schemas";
import { ReservationStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t, authedProcedure } from "../utils";

export const reservationRouter = t.router({
	me: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.reservation.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				listing: true,
				dateRange: true,
			},
		});
	}),
	status: authedProcedure
		.input(updateReservationStatusSchema)
		.mutation(async ({ ctx, input }) => {
			const listing = await ctx.prisma.listing.findFirstOrThrow({
				where: {
					id: input.listingId,
				},
				include: {
					availability: true,
				},
			});

			if (listing.userId !== ctx.session.user.id) {
				return;
			}

			const reservationToChange = await ctx.prisma.reservation.findFirstOrThrow(
				{
					where: {
						id: input.reservationId,
					},
					include: {
						dateRange: true,
					},
				}
			);

			if (input.status === ReservationStatus.CONFIRMED) {
				if (
					listing.availability?.start! > reservationToChange.dateRange.start ||
					listing.availability?.end! < reservationToChange.dateRange.end
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message:
							"This offer is unavailable during the specified time period!",
					});
				}

				const reservations = await ctx.prisma.reservation.findMany({
					where: {
						listingId: input.listingId,
						status: ReservationStatus.CONFIRMED,
						dateRange: {
							start: {
								lte: reservationToChange.dateRange.end,
							},
							end: {
								gte: reservationToChange.dateRange.start,
							},
						},
					},
				});

				for (const reservation of reservations) {
					if (reservation.id === reservationToChange.id) continue;

					throw new TRPCError({
						code: "CONFLICT",
						message: "This offer is already booked for this period of time!",
					});
				}
			}

			return await ctx.prisma.reservation.update({
				where: {
					id: input.reservationId,
				},
				data: {
					status: input.status,
				},
			});
		}),
	get: authedProcedure
		.input(
			z.object({
				listingId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const listing = await ctx.prisma.listing.findFirstOrThrow({
				where: {
					id: input.listingId,
				},
			});

			if (listing.userId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User unauthorized to fetch reservations",
				});
			}

			return await ctx.prisma.reservation.findMany({
				where: {
					listingId: input.listingId,
				},
				include: {
					listing: true,
					dateRange: true,
				},
			});
		}),
});
