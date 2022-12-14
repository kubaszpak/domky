import {
	DATE_CHANGE,
	FOCUS_CHANGE,
	initialState,
	reducer,
} from "@/types/dates";
import { trpc } from "@/utils/trpc";
import useWindowSize from "@/utils/use_window_size";
import { DateRangeInput } from "@datepicker-react/styled";
import { DateRange, Listing } from "@prisma/client";
import { Modal, Table } from "flowbite-react";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useReducer, useState } from "react";
import { BsCalendar3 } from "react-icons/bs";
import { IoMdCalendar } from "react-icons/io";

interface ModalInfo {
	listing: Listing & { availability: DateRange | null };
}

const Profile: NextPage = () => {
	const { status } = useSession();
	const [width] = useWindowSize();
	const [state, dispatch] = useReducer(reducer, initialState);
	const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);

	const listings = trpc.proxy.listing.me.useQuery();
	const reservations = trpc.proxy.reservation.me.useQuery();
	const changeDateMutation =
		trpc.proxy.listing.changeAvailability.useMutation();

	// console.log(
	// 	changeDateMutation.error,
	// 	changeDateMutation.data,
	// 	changeDateMutation.status
	// );

	if (status !== "authenticated") {
		return (
			<>
				<p>Sign in first to view this page!</p>
				<button onClick={() => signIn()}>Sign in</button>
			</>
		);
	}

	return (
		<>
			<div className="container mx-auto my-5 px-3">
				<h1 className="text-2xl font-semibold text-gray-700">Listings</h1>
				<Table hoverable={true}>
					<Table.Head className="[&>*]:text-center">
						<Table.HeadCell>Status</Table.HeadCell>
						<Table.HeadCell>Listings</Table.HeadCell>
						<Table.HeadCell>Main image</Table.HeadCell>
						<Table.HeadCell>Guests</Table.HeadCell>
						<Table.HeadCell>Availability</Table.HeadCell>
						<Table.HeadCell>
							<span className="sr-only">Edit</span>
						</Table.HeadCell>
					</Table.Head>
					<Table.Body className="divide-y">
						{listings.data &&
							listings.data.map((listing, idx) => (
								<Table.Row
									key={idx}
									className="bg-white dark:border-gray-700 dark:bg-gray-800 [&>*]:text-center"
								>
									<Table.Cell>{listing.status}</Table.Cell>
									<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
										{listing.name}
									</Table.Cell>
									<Table.Cell>
										<Image
											src={`https://res.cloudinary.com/${
												process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
											}/image/upload/${listing.images.split("@@@")[0]}`}
											alt={`Apartment ${idx}`}
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
													setModalInfo({ listing: listing });
												}}
											/>
										</div>
									</Table.Cell>
									<Table.Cell>
										<a className="font-medium text-blue-600 hover:underline dark:text-blue-500">
											Edit
										</a>
									</Table.Cell>
								</Table.Row>
							))}
					</Table.Body>
				</Table>

				<h1 className="text-2xl font-semibold text-gray-700 mt-5">
					Reservations
				</h1>
				{reservations.data && (
					<Table hoverable={true}>
						<Table.Head className="[&>*]:text-center">
							<Table.HeadCell>Status</Table.HeadCell>
							<Table.HeadCell>Listing</Table.HeadCell>
							<Table.HeadCell>
								<span className="sr-only">Main image</span>
							</Table.HeadCell>
							<Table.HeadCell>Dates</Table.HeadCell>
							<Table.HeadCell>
								<span className="sr-only">Edit</span>
							</Table.HeadCell>
						</Table.Head>
						<Table.Body className="divide-y">
							{reservations.data.map((reservation, idx) => (
								<Table.Row
									key={idx}
									className="bg-white dark:border-gray-700 dark:bg-gray-800 [&>*]:text-center"
								>
									<Table.Cell>{reservation.status}</Table.Cell>
									<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
										{reservation.listing.name}
									</Table.Cell>
									<Table.Cell>
										<Image
											src={`https://res.cloudinary.com/${
												process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
											}/image/upload/${
												reservation.listing.images.split("@@@")[0]
											}`}
											alt={`Apartment ${idx}`}
											height={162}
											width={288}
										/>
									</Table.Cell>
									<Table.Cell>
										<div className="flex justify-center cursor-pointer">
											<IoMdCalendar size={28} />
										</div>
									</Table.Cell>
									<Table.Cell>
										<a className="font-medium text-blue-600 hover:underline dark:text-blue-500">
											Edit
										</a>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				)}
			</div>
			{!!modalInfo && (
				<Modal show={!!modalInfo} onClose={() => setModalInfo(null)}>
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
						<button
							className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 enabled:hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center my-1 disabled:grayscale"
							onClick={() =>
								changeDateMutation.mutate({
									listingId: modalInfo.listing.id,
									dateStart: state.startDate!,
									dateEnd: state.endDate!,
									// TODO: add blocking dates to GUI datePicker and handle error
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
