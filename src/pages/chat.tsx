import { Spinner } from "flowbite-react";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { prisma } from "@/server/db/client";
import UserChat from "@/components/chat/user_chat";
import { fetchUsers } from "@/server/trpc/router/message";
import ChatsList from "@/components/chat/chats_list";
import { trpc } from "@/utils/trpc";

let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

const socketInitializer = async (userId: string) => {
	await fetch("/api/socket");

	socket = io();

	socket.on("refetch", () => {
		console.log("Refetch");
		// messagesQuery.refetch();
	});
	socket.emit("join", { userId: userId });
};

const Chat: NextPage<{ chats: string }> = ({ chats }) => {
	const { data: session, status } = useSession();
	const [parsedChats, setParsedChats] = useState(JSON.parse(chats));
	console.log(parsedChats);
	const [selectedChat, setSelectedChat] = useState<any>(null);
	// const messagesQuery = trpc.proxy.message.me.useQuery(undefined, {
	// 	enabled: false,
	// 	refetchOnWindowFocus: false,
	// 	onSuccess: (data) => {
	// 		setParsedChats(data);
	// 	},
	// });

	useEffect(() => {
		if (!selectedChat) setSelectedChat(parsedChats[0]);
	}, [parsedChats, selectedChat]);

	useEffect(() => {
		if (status !== "authenticated") return;
		console.log("Socket initialization " + session.user!.id);
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

	const emitPrivateMessage = (userId: string, msg: string) => {
		console.log(userId, msg);
		socket.emit("private-message", {
			from: session.user!.id,
			to: userId,
			msg,
		});
	};

	return (
		<div className="flex-auto flex items-center">
			<div className="container mx-auto">
				<div className="min-w-full border rounded lg:grid lg:grid-cols-3">
					<ChatsList
						parsedChats={parsedChats}
						setSelectedChat={setSelectedChat}
					/>
					{selectedChat && (
						<UserChat
							selectedChat={selectedChat}
							emitPrivateMessage={emitPrivateMessage}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session || !session.user) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	const chatsWithSortedMessages = await fetchUsers(prisma, session.user.id);

	return {
		props: {
			chats: JSON.stringify(chatsWithSortedMessages),
		},
	};
};

export default Chat;
