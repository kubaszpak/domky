import { trpc } from "@/utils/trpc";
import { Modal } from "flowbite-react";
import React, { Dispatch, SetStateAction } from "react";
import ReservationList from "./reservation_list";

interface Props {
	listingId: string;
	show: boolean;
	set: Dispatch<SetStateAction<boolean>>;
}

const ReservationsModal: React.FC<Props> = ({ listingId, show, set }) => {
	const reservations = trpc.proxy.reservation.get.useQuery({
		listingId,
	});

	return (
		<Modal
			show={show}
			onClose={() => {
				set(false);
			}}
		>
			<Modal.Header>Reservations</Modal.Header>
			<Modal.Body>
				{reservations.data && (
					<ReservationList reservations={reservations.data} />
				)}
			</Modal.Body>
		</Modal>
	);
};

export default ReservationsModal;
