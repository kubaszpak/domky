import { NextApiResponseWithSocket } from "@/types/next";
import { NextApiRequest } from "next";
import { Server } from "socket.io";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";

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

	// It means that socket server was already initialised
	if (res.socket.server.io) {
		console.log("Already set up");
		res.end();
		return;
	}

	const io = new Server(res.socket.server);
	res.socket.server.io = io;

	// Define actions inside
	io.on("connection", (socket) => {
		socket.on("join", async ({ userId }) => {
			console.log(`Looking for user ${userId} with socket.id ${socket.id}`);
			const clientSocket = await io.in(socket.id).fetchSockets();
			console.log(`Found ${clientSocket.length} sockets`);
			clientSocket[0]?.join(userId);
			// clientSocket.join(userId);

			// console.log(`User of id ${session.user!.id} joining room ${room}`);
		});
		socket.on("private-message", ({ msg, userId }) => {
			socket.to(userId).emit("newIncomingMessage", msg);
		});
		socket.broadcast.emit("newIncomingMessage", { msg: "Hello World" });
	});

	console.log("Setting up socket");
	res.end();
}
