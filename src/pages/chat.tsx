import { Spinner } from "flowbite-react";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { prisma } from "@/server/db/client";
import UserChat from "@/components/chat/user_chat";
import { fetchUsers } from "@/server/trpc/router/message";
import ChatsList from "@/components/chat/chats_list";
import Pusher from "pusher-js";
import axios from "axios";
import { trpc } from "@/utils/trpc";

let pusher: Pusher;
const Chat: NextPage<{ chats: string }> = ({ chats }) => {
	const { data: session, status } = useSession();
	const [parsedChats, setParsedChats] = useState(JSON.parse(chats));
	const [selectedChat, setSelectedChat] = useState<any>(null);
	const {
		status: queryStatus,
		refetch: refetchQuery,
		data,
	} = trpc.proxy.message.me.useQuery();

	useEffect(() => {
		if (queryStatus === "success") {
			setParsedChats(data);
		}
	}, [queryStatus, data]);

	useEffect(() => {
		if (parsedChats && parsedChats.length > 0) {
			setSelectedChat((prev: any) =>
				!!prev
					? parsedChats.find((chat: any) => chat.id === prev.id)
					: parsedChats[0]
			);
		}
	}, [parsedChats]);

	useEffect(() => {
		if (status !== "authenticated") return;
		pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
			cluster: "eu",
		});

		const channel = pusher.subscribe(session.user!.id);

		channel.bind("message", () => {
			setTimeout(() => {
				refetchQuery({
					cancelRefetch: false,
				});
			}, 1000);
		});

		return () => {
			pusher.unsubscribe(session.user!.id);
		};
	}, [status, session, refetchQuery]);

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

	const emitPrivateMessage = (userId: string, message: string) => {
		axios.post("api/pusher", {
			message,
			senderId: session.user!.id,
			recipientId: userId,
		});
	};

	const back = () => {
		setSelectedChat(null);
	};

	return (
		<div className="flex-auto flex items-center">
			<div className="container mx-auto">
				<div className="min-w-full border rounded lg:grid lg:grid-cols-3">
					<ChatsList
						parsedChats={parsedChats}
						setSelectedChat={setSelectedChat}
						hideOnMobile={!!selectedChat}
					/>
					{selectedChat && (
						<UserChat
							selectedChat={selectedChat}
							emitPrivateMessage={emitPrivateMessage}
							hideOnMobile={!selectedChat}
							back={back}
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
