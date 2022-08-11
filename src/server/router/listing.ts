import { createRouter } from "./context";

export const listingRouter = createRouter().query("all", {
	async resolve({ ctx }) {
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
	},
});
