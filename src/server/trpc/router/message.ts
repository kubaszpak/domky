import { z } from "zod";
import { t, authedProcedure } from "../utils";

const sendSchema = z.object({
	date_start: z.date(),
	date_end: z.date(),
	content: z.string(),
	listingId: z.string(),
	listingOwnerId: z.string(),
});

export const messageRouter = t.router({
	contact: authedProcedure
		.input(sendSchema)
		.mutation(async ({ input, ctx }) => {
			return await ctx.prisma.message.create({
				data: {
					chat: {
						create: {
							users: {
								create: [
									{ user: { connect: { id: input.listingOwnerId } } },
									{ user: { connect: { id: ctx.session.user.id } } },
								],
							},
						},
					},
					reservation: {
						create: {
							listing: {
								connect: { id: input.listingId },
							},
							user: {
								connect: {
									id: ctx.session.user.id,
								},
							},
							dateRange: {
								create: {
									start: input.date_start,
									end: input.date_end,
								},
							},
						},
					},
					sender: {
						connect: { id: ctx.session.user.id },
					},
					content: input.content,
				},
			});
		}),
});
