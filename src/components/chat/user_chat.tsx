import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { BiSend } from "react-icons/bi";
import BookingPreview from "../listing/booking_preview";
import { BiArrowBack } from "react-icons/bi";

interface UserChatProps {
	selectedChat: any;
	emitPrivateMessage: (userId: string, message: string) => void;
	hideOnMobile: boolean;
	back: () => void;
}

const UserChat: React.FC<UserChatProps> = ({
	selectedChat,
	emitPrivateMessage,
	hideOnMobile,
	back,
}) => {
	const [message, setMessage] = useState("");
	const { data: session } = useSession();

	const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
		if (!selectedChat) return;
		e.preventDefault();
		emitPrivateMessage(selectedChat.users.userId, message);
		selectedChat.messages.push({
			senderId: session?.user?.id,
			content: message,
		});
		setMessage("");
	};

	return (
		<div
			className={`${
				hideOnMobile && "hidden lg:block"
			} lg:col-span-2 chat-height`}
		>
			<div className="w-full flex flex-col h-full">
				<div className="relative flex items-center p-5 border-b border-gray-300 justify-between">
					<div className="flex items-center">
						<div className="object-cover relative w-10 h-10 rounded-full overflow-hidden">
							<Image
								src={selectedChat.users.user.image}
								alt="Profile image"
								layout="fill"
							/>
						</div>
						<span className="block ml-2 font-bold text-gray-600">
							{selectedChat.users.user.name}
						</span>
					</div>
					<button className="lg:hidden" onClick={() => back()}>
						<BiArrowBack size={28} />
					</button>
				</div>
				<div className="relative w-full p-6 overflow-y-auto flex flex-col-reverse column flex-1">
					<ul className="space-y-2">
						{selectedChat &&
							selectedChat.messages.map((message: any, idx: number) => {
								const messageFromSelf = message.senderId === session?.user!.id;

								return (
									<li
										key={message.id ? message.id : idx}
										className={`flex ${
											messageFromSelf ? "justify-end" : "justify-start"
										}`}
									>
										<div
											className={`relative max-w-xl px-4 py-2 text-gray-700 rounded shadow justify-start ${
												messageFromSelf && "bg-gray-100"
											}`}
										>
											<span className="block">
												{message.content}
												<>
													{!!message.reservation &&
														(() => {
															const listing = message.reservation.listing;
															const dateRange = message.reservation.dateRange;
															return (
																<div className="mt-3 border-2 p-3 flex">
																	<div>
																		<h1 className="mb-3">
																			Reservation request for:
																			<br />
																			<b>{listing.name}</b>
																		</h1>
																		<BookingPreview
																			images={listing.images}
																			date_start={new Date(dateRange.start)}
																			date_end={new Date(dateRange.end)}
																		/>
																	</div>
																</div>
															);
														})()}
												</>
											</span>
										</div>
									</li>
								);
							})}
					</ul>
				</div>
				<form onSubmit={handleSend}>
					<div className="flex items-center justify-between w-full p-3 border-t border-gray-300 h-min">
						<input
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							type="text"
							placeholder="Message"
							className="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
							name="message"
							required
						/>
						<button type="submit">
							<BiSend size={28} />
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UserChat;
