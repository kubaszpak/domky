import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { t, authedProcedure } from "../utils";

const sendSchema = z.object({
	date_start: z.date(),
	date_end: z.date(),
	content: z.string(),
	listingId: z.string(),
	listingOwnerId: z.string(),
});

export async function fetchUsers(
	prisma: PrismaClient<
		Prisma.PrismaClientOptions,
		never,
		Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
	>,
	id: string
) {
	const chats = await prisma.chat.findMany({
		where: {
			users: {
				some: {
					userId: id,
				},
			},
		},
		include: {
			messages: true,
			users: {
				include: {
					user: true,
				},
			},
		},
		orderBy: {
			updatedAt: "desc",
		},
	});

	const chatsWithSortedMessages = chats.map((chat) => ({
		...chat,
		messages: chat.messages.sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
		),
		users: chat.users.filter((user) => user.userId !== id)[0],
	}));

	return chatsWithSortedMessages;
}

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
	me: authedProcedure.query(async ({ ctx }) => {
		return await fetchUsers(ctx.prisma, ctx.session.user.id);
	}),
});
