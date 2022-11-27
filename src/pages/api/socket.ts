import { NextApiResponseWithSocket } from "@/types/next";
import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import { prisma } from "@/server/db/client";

export default async function SocketHandler(
	req: NextApiRequest,
	res: NextApiResponseWithSocket
) {
	const session = await getServerSession(req, res, nextAuthOptions);

	if (!session?.user?.id) {
		console.log("User not logged in");
		res.end();
		return;
	}

	if (res.socket.server.io) {
		console.log("Already set up");
		res.end();
		return;
	}

	const io = new Server(res.socket.server);
	res.socket.server.io = io;

	io.on("connection", (socket) => {
		socket.on("join", ({ userId }) => {
			console.log("Socket " + socket.id + " connecting to room " + userId);
			socket.join(userId);
		});
		socket.on("private-message", ({ from, to, msg }) => {
			console.log(
				"Private message to " + to + " from " + socket.id + " - " + from
			);
			socket.to(to).emit("refetch");
			// const chat = await prisma.chat.findFirstOrThrow({
			// 	where: {
			// 		users: {
			// 			every: {
			// 				OR: [
			// 					{
			// 						userId: userId,
			// 					},
			// 					{
			// 						userId: session.user!.id,
			// 					},
			// 				],
			// 			},
			// 		},
			// 	},
			// });
			// await prisma.message.create({
			// 	data: {
			// 		chat: {
			// 			connect: { id: chat.id },
			// 		},
			// 		content: msg,
			// 		sender: {
			// 			connect: { id: session.user!.id },
			// 		},
			// 	},
			// });
		});
	});

	console.log("Setting up socket finished");
	res.end();
}
