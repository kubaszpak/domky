import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";
import { BiSend } from "react-icons/bi";
import BookingPreview from "../listing/booking_preview";
import { BiArrowBack } from "react-icons/bi";
import { BsCheckLg, BsXLg } from "react-icons/bs";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { trpc } from "@/utils/trpc";
import { ReservationStatus } from "@prisma/client";

interface UserChatProps {
	selectedChat: any;
	emitPrivateMessage: (userId: string, message: string) => void;
	hideOnMobile: boolean;
	back: () => void;
}

interface ModalActionType {
	action: "accept" | "deny";
	reservationId: string;
	listingOwnerId: string;
}

const UserChat: React.FC<UserChatProps> = ({
	selectedChat,
	emitPrivateMessage,
	hideOnMobile,
	back,
}) => {
	const [message, setMessage] = useState("");
	const { data: session } = useSession();
	const [modal, setModal] = useState<null | ModalActionType>(null);

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

	const changeReservationStatus = trpc.proxy.reservation.status.useMutation();

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
																<>
																	<div className="mt-3 overflow-hidden rounded p-0.5 bg-gradient-to-br from-gray-800 to-gray-600">
																		<div className="text-white font-semibold p-3 sm:flex w-full">
																			<div>
																				<h1 className="mb-3">
																					Reservation request for:
																					<br />
																					<span className="font-black">
																						{listing.name}
																					</span>
																				</h1>
																				<BookingPreview
																					images={listing.images}
																					date_start={new Date(dateRange.start)}
																					date_end={new Date(dateRange.end)}
																				/>
																			</div>
																			<div className="mt-3 sm:mt-0 sm:flex flex-1 gap-4 flex-col items-center justify-center">
																				{message.reservation.status ===
																				ReservationStatus.PENDING ? (
																					changeReservationStatus.isIdle &&
																					listing.userId ===
																						session?.user?.id && (
																						<>
																							<button
																								onClick={() =>
																									setModal({
																										action: "accept",
																										listingOwnerId:
																											listing.userId,
																										reservationId:
																											message.reservation.id,
																									})
																								}
																								className="relative items-center transition-all ease-in duration-75 border-4 border-white justify-center px-5 py-2.5 mb-2 mr-2 overflow-hidden rounded-lg hover:bg-gradient-to-br hover:from-white hover:to-slate-200 hover:text-gray-700 focus:outline-none"
																							>
																								<BsCheckLg />
																							</button>
																							<button
																								onClick={() =>
																									setModal({
																										action: "deny",
																										listingOwnerId:
																											listing.userId,
																										reservationId:
																											message.reservation.id,
																									})
																								}
																								className="relative items-center transition-all ease-in duration-75 border-4 border-white justify-center px-5 py-2.5 mb-2 mr-2 overflow-hidden rounded-lg hover:bg-gradient-to-br hover:from-white hover:to-slate-200 hover:text-gray-700 focus:outline-none"
																							>
																								<BsXLg />
																							</button>
																						</>
																					)
																				) : message.reservation.status ===
																				  ReservationStatus.CONFIRMED ? (
																					<>
																						<div>Confirmed</div>
																						<BsCheckLg size={56} />
																					</>
																				) : (
																					<>
																						<div>Declined</div>
																						<BsXLg size={56} />
																					</>
																				)}
																			</div>
																		</div>
																	</div>

																	<Modal
																		show={!!modal}
																		size="md"
																		popup={true}
																		onClose={() => setModal(null)}
																	>
																		<Modal.Header />
																		<Modal.Body>
																			<div className="text-center">
																				{modal?.action === "accept" ? (
																					<BsCheckLg className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
																				) : (
																					<HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
																				)}
																				<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
																					Are you sure you want to{" "}
																					{modal?.action} this request?
																				</h3>
																				<div className="flex justify-center gap-4">
																					<Button
																						gradientMonochrome={`${
																							modal?.action === "accept"
																								? "success"
																								: "failure"
																						}`}
																						onClick={() => {
																							changeReservationStatus.mutate({
																								status:
																									modal!.action === "accept"
																										? ReservationStatus.CONFIRMED
																										: ReservationStatus.DECLINED,
																								reservationId:
																									modal!.reservationId,
																								listingOwnerId:
																									modal!.listingOwnerId,
																							});
																							setModal(null);
																						}}
																					>
																						Yes, I&apos;m sure
																					</Button>
																					<Button
																						color="gray"
																						onClick={() => setModal(null)}
																					>
																						No, cancel
																					</Button>
																				</div>
																			</div>
																		</Modal.Body>
																	</Modal>
																</>
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
