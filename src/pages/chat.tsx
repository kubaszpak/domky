import { Spinner } from "flowbite-react";
import { GetServerSideProps } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { prisma } from "@/server/db/client";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const Chat = ({ messages }: { messages: string }) => {
	const { data: session, status } = useSession();
	const [id, setId] = useState("");

	const socketInitializer = async (userId: string) => {
		await fetch("/api/socket");

		socket = io({ autoConnect: false });
		socket.auth = { userId };
		socket.connect();
		socket.onAny((event, ...args) => {
			console.log(event, args);
		});
	};

	useEffect(() => {
		if (!session || status !== "authenticated") return;
		socketInitializer(session.user!.id);
	}, [status, session]);

	if (status === "loading") {
		return (
			<div className="flex justify-center items-center flex-auto">
				<Spinner size="lg" />
			</div>
		);
	}

	if (status !== "authenticated") {
		return (
			<div className="p-5">
				<h1>Sign in first to view this page!</h1>
				<button
					className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center my-1"
					onClick={() => signIn()}
				>
					Sign in
				</button>
			</div>
		);
	}

	return (
		<>
			<div>
			</div>
			<input
				type="text"
				id="id"
				name="id"
				placeholder="id"
				value={id}
				onChange={(e) => setId(e.target.value)}
			/>
			<button
				onClick={() => {
					socket.emit("private-message", {
						msg: "Hi from client!",
						userId: id,
					});
				}}
			>
				Send
			</button>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const chats = prisma.chat.findMany({
		where: {
			users: {
				
			}
		}
	})

	return {
		props: {
			messages: "",
		},
	};
};

export default Chat;
