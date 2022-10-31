import { t, authedProcedure } from "../utils";
import { createSchema } from "@/components/utils/schemas";

export const authRouter = t.router({
	getSession: t.procedure.query(({ ctx }) => {
		return ctx.session;
	}),
	getSecretMessage: authedProcedure.query(() => {
		return "You are logged in and can see this secret message!";
	}),
	listings: authedProcedure.query(async ({ ctx }) => {
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
});
