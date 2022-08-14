import { t } from "../utils";

export const listingRouter = t.router({
	all: t.procedure.query(async ({ ctx }) => {
		return await ctx.prisma.listing.findMany({
			select: {
				name: true,
				description: true,
				availability: true,
				latitude: true,
				longitude: true,
				guests: true,
				images: true,
			},
		});
	}),
});
