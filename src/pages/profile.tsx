import ReservationList from "@/components/reservations/reservation_list";
import SignIn from "@/components/sign_in";
import {
	DATE_CHANGE,
	FOCUS_CHANGE,
	initialState,
	reducer,
} from "@/types/dates";
import { trpc } from "@/utils/trpc";
import useWindowSize from "@/utils/use_window_size";
import { DateRangeInput } from "@datepicker-react/styled";
import {
	DateRange,
	Listing,
	Reservation,
	ReservationStatus,
} from "@prisma/client";
import { Modal, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useReducer, useState } from "react";
import { BsCalendar3, BsListUl } from "react-icons/bs";
import ReservationsModal from "../components/reservations/reservations_modal";

interface ModalInfo {
	listing: Listing & {
		availability: DateRange | null;
		reservations: (Reservation & {
			dateRange: DateRange;
		})[];
	};
	unavailableDates: Date[];
}

const Profile: NextPage = () => {
	const { status } = useSession();
	const [width] = useWindowSize();
	const [state, dispatch] = useReducer(reducer, initialState);
	const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
	const [showReservationsModal, setShowReservationsModal] = useState(false);

	const listings = trpc.proxy.listing.me.useQuery();
	const reservations = trpc.proxy.reservation.me.useQuery();
	const changeDateMutation = trpc.proxy.listing.changeAvailability.useMutation({
		onError: () => {
			!!modalInfo &&
				dispatch({
					type: DATE_CHANGE,
					payload: {
						startDate: modalInfo.listing.availability!.start,
						endDate: modalInfo.listing.availability!.end,
						focusedInput: null,
					},
				});
		},
	});

	const getUnavailableDates = (
		reservations: (Reservation & {
			dateRange: DateRange;
		})[]
	) => {
		const dates: Date[] = [];
		for (const reservation of reservations) {
			if (reservation.status !== ReservationStatus.CONFIRMED) continue;
			for (
				let d = reservation.dateRange.start;
				d <= reservation.dateRange.end;
				d.setDate(d.getDate() + 1)
			) {
				dates.push(new Date(d));
			}
		}
		return dates;
	};

	if (status !== "authenticated") {
		return <SignIn />;
	}

	return (
		<>
			<div className="container mx-auto my-5 px-3">
				<div className="flex justify-end pr-3">
					<button
						type="button"
						className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-3"
					>
						<Link href="/create">Create a listing</Link>
					</button>
				</div>
				{listings.data && listings.data.length > 0 && (
					<>
						<h1 className="text-2xl font-semibold text-gray-700 my-3">
							Listings
						</h1>
						<Table hoverable={true}>
							<Table.Head className="[&>*]:text-center">
								<Table.HeadCell>Status</Table.HeadCell>
								<Table.HeadCell>Listings</Table.HeadCell>
								<Table.HeadCell>Main image</Table.HeadCell>
								<Table.HeadCell>Guests</Table.HeadCell>
								<Table.HeadCell>Availability</Table.HeadCell>
								<Table.HeadCell>Reservations</Table.HeadCell>
								<Table.HeadCell>
									<span className="sr-only">Edit</span>
								</Table.HeadCell>
							</Table.Head>
							<Table.Body className="divide-y">
								{listings.data.map((listing) => (
									<Table.Row
										key={listing.id}
										className="bg-white dark:border-gray-700 dark:bg-gray-800 [&>*]:text-center"
									>
										<Table.Cell>{listing.status}</Table.Cell>
										<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
											{listing.name}
										</Table.Cell>
										<Table.Cell className="override-padding-0">
											<Image
												src={`https://res.cloudinary.com/${
													process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
												}/image/upload/${listing.images.split("@@@")[0]}`}
												alt={`Apartment ${listing.id}`}
												height={162}
												width={288}
											/>
										</Table.Cell>
										<Table.Cell>{listing.guests}</Table.Cell>
										<Table.Cell>
											<div className="flex justify-center cursor-pointer">
												<BsCalendar3
													size={28}
													onClick={() => {
														dispatch({
															type: DATE_CHANGE,
															payload: {
																startDate: listing.availability!.start,
																endDate: listing.availability!.end,
																focusedInput: null,
															},
														});
														setModalInfo({
															listing: listing,
															unavailableDates: getUnavailableDates(
																listing.reservations
															),
														});
													}}
												/>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="flex justify-center cursor-pointer">
												<BsListUl
													size={28}
													onClick={() => {
														setShowReservationsModal(true);
													}}
												/>
											</div>
											{showReservationsModal && (
												<ReservationsModal
													listingId={listing.id}
													show={showReservationsModal}
													set={setShowReservationsModal}
												/>
											)}
										</Table.Cell>
										<Table.Cell>
											<Link
												href={`/edit/${listing.id}`}
												className="font-medium text-blue-600 hover:underline dark:text-blue-500"
											>
												Edit
											</Link>
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table>
					</>
				)}
				{reservations.data && reservations.data.length > 0 && (
					<div className="mt-5">
						<h1 className="text-2xl font-semibold text-gray-700 my-3">
							Reservations
						</h1>
						<ReservationList reservations={reservations.data} />
					</div>
				)}
			</div>
			{!!modalInfo && (
				<Modal
					show={!!modalInfo}
					onClose={() => {
						changeDateMutation.reset();
						setModalInfo(null);
					}}
				>
					<Modal.Header>Availability</Modal.Header>
					<Modal.Body>
						<div className="space-y-6">
							<div className="flex justify-center date-range-picker">
								<DateRangeInput
									onDatesChange={(data) => {
										dispatch({ type: DATE_CHANGE, payload: data });
									}}
									onFocusChange={(focusedInput) =>
										dispatch({ type: FOCUS_CHANGE, payload: focusedInput })
									}
									vertical={width! < 640}
									showClose={false}
									unavailableDates={modalInfo.unavailableDates}
									minBookingDays={2}
									minBookingDate={new Date()}
									startDate={state.startDate}
									endDate={state.endDate}
									focusedInput={state.focusedInput}
								/>
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						{changeDateMutation.isError && (
							<p className="text-red-700">{changeDateMutation.error.message}</p>
						)}
						{changeDateMutation.isSuccess && (
							<p className="text-red-700">Successfully updated availability!</p>
						)}
						<button
							className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center my-1 disabled:grayscale"
							onClick={() =>
								changeDateMutation.mutate({
									listingId: modalInfo.listing.id,
									dateStart: state.startDate!,
									dateEnd: state.endDate!,
								})
							}
							disabled={
								modalInfo!.listing.availability!.start === state.startDate &&
								modalInfo!.listing.availability!.end === state.endDate
							}
						>
							Submit Change
						</button>
					</Modal.Footer>
				</Modal>
			)}
		</>
	);
};

export default Profile;
