import { updateReservationStatusSchema } from "@/utils/schemas";
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
			if (input.listingOwnerId !== ctx.session.user.id) {
				return;
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
