import { updateReservationStatusSchema } from "@/utils/schemas";
import { t, authedProcedure } from "../utils";

export const reservationRouter = t.router({
	me: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.reservation.findMany({
			where: {
				userId: ctx.session.user.id,
			},
			include: {
				listing: true
			}
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
});
