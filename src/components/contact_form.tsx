import { DateRange, Listing } from "@prisma/client";
import { Modal } from "flowbite-react";
import React from "react";

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
	return (
		<div>
			<Modal show={showModal} onClose={() => setShowModal(false)}>
				<Modal.Header>Terms of Service</Modal.Header>
			</Modal>
		</div>
	);
}

export default ContactForm;
