import { t, authedProcedure } from "../utils";

export const reservationsRouter = t.router({
	me: authedProcedure.query(async ({ ctx }) => {
		return await ctx.prisma.reservation.findMany({
			where: {
				userId: ctx.session.user.id,
			},
		});
	}),
});
