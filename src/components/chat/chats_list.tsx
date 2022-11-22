import Image from "next/image";
import React from "react";

interface ChatsListProps {
	parsedChats: any;
	setSelectedChat: any;
}

const ChatsList: React.FC<ChatsListProps> = ({
	parsedChats,
	setSelectedChat,
}) => {
	return (
		<div className="border-r border-gray-300 lg:col-span-1 chat-height overflow-y-auto">
			<ul>
				<h2 className="my-5 ml-5 border-b text-lg font-semibold text-gray-600">
					Chats
				</h2>
				{parsedChats &&
					parsedChats.length > 0 &&
					parsedChats.map((chat: any) => {
						return (
							<li key={chat.id} onClick={() => setSelectedChat(chat)}>
								<a className="flex items-center p-5 text-sm transition duration-150 ease-in-out border-b border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none relative">
									<div className="min-w-10 block">
										<div className="rounded-full overflow-hidden">
											<Image
												src={chat.users.user.image}
												layout="fixed"
												height={40}
												width={40}
												alt="Profile image"
											/>
										</div>
									</div>
									<div className="mx-2">
										<span className="block font-semibold text-gray-600">
											{chat.users.user.name}
										</span>
									</div>
									<span className="block text-sm text-gray-600 truncate max-w-sm ml-auto">
										{chat.messages[0].content}
									</span>
								</a>
							</li>
						);
					})}
			</ul>
		</div>
	);
};

export default ChatsList;
