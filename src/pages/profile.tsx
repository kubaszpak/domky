import { trpc } from "@/utils/trpc";
import { Table } from "flowbite-react";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { IoMdCalendar } from "react-icons/io";

const Profile: NextPage = () => {
	const { status } = useSession();
	const listings = trpc.proxy.listing.me.useQuery();
	const reservations = trpc.proxy.reservation.me.useQuery();

	if (status !== "authenticated") {
		return (
			<>
				<p>Sign in first to view this page!</p>
				<button onClick={() => signIn()}>Sign in</button>
			</>
		);
	}

	return (
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
									<div className="flex justify-center">
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
									<div className="flex justify-center">
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
	);
};

export default Profile;
