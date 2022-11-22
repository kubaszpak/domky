import Image from "next/image";
import React from "react";

interface UserChatProps {
	chats: string;
}

const UserChat: React.FC<UserChatProps> = ({ chats }) => {
	console.log(JSON.parse(chats));
	// TODO: Setup text truncate https://css-tricks.com/snippets/css/truncate-string-with-ellipsis/
	return (
		<div className="container mx-auto">
			<div className="min-w-full border rounded lg:grid lg:grid-cols-3">
				<div className="border-r border-gray-300 lg:col-span-1 chat-height">
					<ul className="overflow-auto">
						<h2 className="my-5 ml-5 text-lg font-semibold text-gray-600">
							Chats
						</h2>
						<li>
							{JSON.parse(chats).map((chat: any) => {
								return (
									<a
										key={chat.id}
										className="flex items-center p-5 text-sm transition duration-150 ease-in-out border-y border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
									>
										<div className="rounded-full overflow-hidden">
											<Image
												src={chat.users.user.image}
												height={40}
												width={40}
												alt="Profile image"
											/>
										</div>
										<div className="flex justify-between mx-2">
											<span className="block font-semibold text-gray-600">
												{chat.users.user.name}
											</span>
										</div>
										<span className="block text-sm text-gray-600">
											{chat.messages[0].content}
										</span>
									</a>
								);
							})}
						</li>
					</ul>
				</div>
				<div className="hidden lg:col-span-2 lg:block">
					<div className="w-full flex flex-col h-full">
						<div className="relative flex items-center p-5 border-b border-gray-300">
							<div className="object-cover w-10 h-10 rounded-full overflow-hidden">
								{/* <Image /> */}
							</div>
							<span className="block ml-2 font-bold text-gray-600">Emma</span>
						</div>
						<div className="relative w-full p-6 overflow-y-auto flex-1">
							<ul className="space-y-2">
								<li className="flex justify-start">
									<div className="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">
										<span className="block">Hi</span>
									</div>
								</li>
							</ul>
						</div>

						<div className="flex items-center justify-between w-full p-3 border-t border-gray-300 h-min">
							<button></button>
							<button></button>

							<input
								type="text"
								placeholder="Message"
								className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
								name="message"
								required
							/>
							<button></button>
							<button type="submit"></button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UserChat;
