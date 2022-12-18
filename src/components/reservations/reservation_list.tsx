import { dates } from "@/types/dates";
import { DateRange, Listing, Reservation } from "@prisma/client";
import { Table } from "flowbite-react";
import Image from "next/image";
import React from "react";

interface Props {
	reservations: (Reservation & {
		listing: Listing;
		dateRange: DateRange;
	})[];
}

const ReservationList: React.FC<Props> = ({ reservations }) => {
	return (
		<Table hoverable={true}>
			<Table.Head className="[&>*]:text-center">
				<Table.HeadCell>Status</Table.HeadCell>
				<Table.HeadCell>Listing</Table.HeadCell>
				<Table.HeadCell>
					<span className="sr-only">Main image</span>
				</Table.HeadCell>
				<Table.HeadCell>Dates</Table.HeadCell>
			</Table.Head>
			<Table.Body className="divide-y">
				{reservations.map((reservation, idx) => (
					<Table.Row
						key={idx}
						className="bg-white dark:border-gray-700 dark:bg-gray-800 [&>*]:text-center"
					>
						<Table.Cell>{reservation.status}</Table.Cell>
						<Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
							{reservation.listing.name}
						</Table.Cell>
						<Table.Cell className="p-0">
							<Image
								src={`https://res.cloudinary.com/${
									process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
								}/image/upload/${reservation.listing.images.split("@@@")[0]}`}
								alt={`Apartment ${idx}`}
								height={162}
								width={288}
							/>
						</Table.Cell>
						<Table.Cell>
							{`${reservation.dateRange.start!.getDate()} ${
								dates[reservation.dateRange.start!.getMonth()]
							} -
										${reservation.dateRange.end!.getDate()} ${
								dates[reservation.dateRange.end!.getMonth()]
							}`}
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	);
};

export default ReservationList;
