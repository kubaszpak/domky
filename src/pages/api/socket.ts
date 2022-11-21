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

	if (res.socket.server.io) {
		console.log("Already set up");
		res.end();
		return;
	}

	const io = new Server(res.socket.server);
	res.socket.server.io = io;

	io.use((socket, next) => {
		const userId = socket.handshake.auth.userId;
		console.log("Middleware hit " + userId + " socket.id " + socket.id);
		if (!userId || userId !== session?.user?.id) {
			return next(new Error("Invalid userId"));
		}
		(socket as any).userId = userId;
		next();
	});

	io.on("connection", (socket) => {
		socket.join((socket as any).userId);
		socket.on("private-message", ({ msg, userId }) => {
			socket.to(userId).emit("new-message", msg);
		});
	});

	console.log("Setting up socket finished");
	res.end();
}
