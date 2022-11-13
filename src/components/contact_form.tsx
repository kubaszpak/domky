import { dates } from "@/types/dates";
import firestore from "@/utils/firebase";
import { DateRange, Listing } from "@prisma/client";
import {
	addDoc,
	collection,
	doc,
	DocumentData,
	getDoc,
	getDocs,
	query,
	QuerySnapshot,
	setDoc,
	where,
} from "firebase/firestore";
import { Modal } from "flowbite-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";

interface ContactFormProps {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	listing: Listing & { availability: DateRange | null };
	date_start: Date | undefined;
	date_end: Date | undefined;
}

function ContactForm({
	showModal,
	setShowModal,
	listing,
	date_start,
	date_end,
}: ContactFormProps) {
	const [message, setMessage] = useState(
		`Hi! I'd like to book the apartment ${
			listing.name
		} for a period of time starting from ${date_start!.getDate()} ${
			dates[date_start!.getMonth()]
		} and lasting until ${date_end!.getDate()} ${
			dates[date_end!.getMonth()]
		}. Looking forward to hearing from you. Thanks!`
	);
	const { data: session, status } = useSession();

	const getChatWithRecepient = (
		chats: QuerySnapshot<DocumentData>,
		recepientId: string
	) => {
		return !chats.empty
			? chats.docs.find((doc) => doc.data().users.includes(recepientId))
			: undefined;
	};

	return (
		<div>
			<Modal show={showModal} onClose={() => setShowModal(false)}>
				{status === "authenticated" ? (
					<div>
						<Modal.Header>
							Booking the apartment <b>{listing.name}</b>
						</Modal.Header>
						<Modal.Body>
							<Image
								src={`https://res.cloudinary.com/${
									process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
								}/image/upload/${listing.images.split("@@@")[0]}`}
								alt={`Apartment image `}
								height={90}
								width={160}
							/>
							<div className="my-5">
								Dates:{" "}
								{`${date_start!.getDate()} ${
									dates[date_start!.getMonth()]
								} - ${date_end!.getDate()} ${dates[date_end!.getMonth()]}`}
							</div>
							<div>
								<label
									htmlFor="message"
									className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
								>
									Message
								</label>
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									id="message"
									className="border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 min-h-[8rem] sm:min-h-[5rem]"
									placeholder="Enter a message"
									required
								/>
							</div>
							<button
								className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center mt-5"
								onClick={async () => {
									const chatsRef = collection(firestore, "chats");
									const q = query(
										chatsRef,
										where("users", "array-contains", session.user?.id)
									);
									const userChats = await getDocs(q);
									const chat = getChatWithRecepient(userChats, listing.userId);
									const chatRef = !chat
										? await addDoc(chatsRef, {
												users: [session.user?.id, listing.userId],
										  })
										: chat.ref;
									addDoc(collection(chatRef, "messages"), {
										message: message,
										sender: session.user?.id,
									});
									setMessage("");
									setShowModal(false);
								}}
							>
								Send
							</button>
						</Modal.Body>
					</div>
				) : (
					<div className="p-5">
						<h1>Sign in first to view this page!</h1>
						<button
							className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center my-1"
							onClick={() => signIn()}
						>
							Sign in
						</button>
					</div>
				)}
			</Modal>
		</div>
	);
}

export default ContactForm;
