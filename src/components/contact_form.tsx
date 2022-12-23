import { dates } from "@/types/dates";
import { trpc } from "@/utils/trpc";
import { DateRange, Listing } from "@prisma/client";
import { Modal } from "flowbite-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import BookingPreview from "./listing/booking_preview";
import SignIn from "./sign_in";

interface ContactFormProps {
	showModal: boolean;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
	listing: Listing & { availability: DateRange | null };
	date_start: Date;
	date_end: Date;
}

function ContactForm({
	showModal,
	setShowModal,
	listing,
	date_start,
	date_end,
}: ContactFormProps) {
	const defaultMessage = `Hi! I'd like to book the apartment ${
		listing.name
	} for a period of time starting from ${date_start!.getDate()} ${
		dates[date_start!.getMonth()]
	} and lasting until ${date_end!.getDate()} ${
		dates[date_end!.getMonth()]
	}. Looking forward to hearing from you. Thanks!`;
	const [message, setMessage] = useState(defaultMessage);
	const { data: session, status } = useSession();
	const sendMutation = trpc.proxy.message.contact.useMutation();

	return (
		<Modal show={showModal} onClose={() => setShowModal(false)}>
			{status === "authenticated" ? (
				listing.userId === session.user?.id ? (
					<Modal.Header>You are the owner of this listing</Modal.Header>
				) : (
					<div>
						<Modal.Header>
							Booking the apartment <b>{listing.name}</b>
						</Modal.Header>
						<Modal.Body>
							<BookingPreview
								images={listing.images}
								date_start={date_start}
								date_end={date_end}
							/>
							<div className="mt-3">
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
									if (listing.userId === session.user?.id) return;
									sendMutation.mutate({
										content: message,
										date_start: date_start,
										date_end: date_end,
										listingOwnerId: listing.userId,
										listingId: listing.id,
									});
									setMessage(defaultMessage);
									setShowModal(false);
								}}
							>
								Send
							</button>
						</Modal.Body>
					</div>
				)
			) : (
				<Modal.Body>
					<SignIn />
				</Modal.Body>
			)}
		</Modal>
	);
}

export default ContactForm;
