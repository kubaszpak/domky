import { authedProcedure, t } from "../utils";

export const listingRouter = t.router({
	all: t.procedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany();
	}),
});
