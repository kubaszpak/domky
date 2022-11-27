import { NextApiRequest, NextApiResponse } from "next";
import Pusher from "pusher";
import { prisma } from "@/server/db/client";

export const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: "eu",
	useTLS: true,
});

export default async function MessageHandler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { message, senderId, recipientId } = req.body;
	const response = await pusher.trigger(recipientId, "message", {
		message,
		senderId,
	});

	const chat = await prisma.chat.findFirstOrThrow({
		where: {
			users: {
				every: {
					OR: [
						{
							userId: recipientId,
						},
						{
							userId: senderId,
						},
					],
				},
			},
		},
	});
	await prisma.message.create({
		data: {
			chat: {
				connect: { id: chat.id },
			},
			content: message,
			sender: {
				connect: { id: senderId },
			},
		},
	});
	await prisma.chat.update({
		where: {
			id: chat.id,
		},
		data: {
			updatedAt: new Date(),
		},
	});

	res.json({ message: "Completed" });
}
