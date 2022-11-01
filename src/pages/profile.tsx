import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

const Profile: NextPage = () => {
	const { status } = useSession();
	const listings = trpc.proxy.listing.me.useQuery();
	// const reservations = trpc.proxy.reservations.me.useQuery();

	if (status !== "authenticated") {
		return (
			<>
				<p>Sign in first to view this page!</p>
				<button onClick={() => signIn()}>Sign in</button>
			</>
		);
	}

	return (
		<div>
			<h1>Listings:</h1>
			{listings.data &&
				listings.data.map((listing, idx) => {
					return (
						<>
							<h1 key={idx}>{listing.name}</h1>
							<Image
								src={`https://res.cloudinary.com/${
									process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
								}/image/upload/${listing.images.split("@@@")[0]}`}
								alt={`Apartment ${idx}`}
								height={162}
								width={288}
							/>
						</>
					);
				})}
			<h1>Reservations:</h1>
		</div>
	);
};

export default Profile;
