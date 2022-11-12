import ContactForm from "@/components/contact_form";
import Map from "@/components/maps/map";
import Marker from "@/components/maps/marker";
import { dates } from "@/types/dates";
import { trpc } from "@/utils/trpc";
import { Wrapper } from "@googlemaps/react-wrapper";
import { Carousel, Spinner } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { z } from "zod";

function Listing() {
	const router = useRouter();
	const { query, isReady } = router;
	const { id, date_start, date_end } = query;
	const [parsedParams, setParsedParams] = useState<{
		id: string;
		date_start: Date;
		date_end: Date;
	} | null>(null);
	const [showModal, setShowModal] = useState<boolean>(false);

	useEffect(() => {
		if (!isReady) return;
		setParsedParams(
			z
				.object({
					id: z.string(),
					date_start: z.date(),
					date_end: z.date(),
				})
				.parse({
					id,
					date_start: new Date(date_start!.toString()),
					date_end: new Date(date_end!.toString()),
				})
		);
	}, [date_end, date_start, id, isReady]);

	const getQuery = trpc.proxy.listing.get.useQuery(parsedParams?.id || null);

	if (!getQuery.isSuccess || !getQuery.data)
		return (
			<div className="h-full w-full flex flex-auto justify-center items-center">
				<Spinner aria-label="Loading" size="xl" />
			</div>
		);

	const data = getQuery.data;
	const images = data.images.split("@@@").filter((image_id) => !!image_id);
	const today = new Date();
	const start =
		today > data.availability?.start! ? today : data.availability?.start!;
	const end = data.availability?.end;
	const marker = { lat: data.latitude, lng: data.longitude };

	if (today > end!) return;

	return (
		<div>
			<div className="listing py-5">
				<div className="h-80 sm:h-96 sm:py-5 md:h-[30rem] 2xl:h-[36rem]">
					<Carousel slide={false}>
						{images &&
							images.map((imageId, idx) => {
								const link = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${imageId}`;
								return (
									<div key={idx} className="h-full w-full">
										<a href={link}>
											<Image
												priority
												src={link}
												alt={`Apartment image ${idx}`}
												layout="fill"
												objectFit="cover"
											/>
										</a>
									</div>
								);
							})}
					</Carousel>
				</div>
				<div className="mt-5 mb-10 text-right">
					<h1 className="font-semibold text-3xl">{data.name}</h1>
					<h2 className="text-2xl">
						{data.city}
						<BsFillPeopleFill className="inline mx-1 p-0.5" />
						{data.guests}
					</h2>
					<h2 className="text-2xl">
						{`${start!.getDate()} ${dates[start!.getMonth()]} -
										${end!.getDate()} ${dates[end!.getMonth()]}`}
					</h2>
				</div>
				<Wrapper
					id="google-map-script"
					apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
				>
					<Map
						center={marker}
						zoom={11}
						style={{ width: "100%", height: "400px" }}
					>
						{marker && <Marker position={marker} />}
					</Map>
				</Wrapper>
				<div className="my-10">
					<h2 className="font-semibold text-2xl">Description</h2>
					<p className="text-xl mt-1">{data.description}</p>
				</div>
				<div className="flex justify-center">
					<button
						className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-lg px-5 py-2.5 text-center mb-1"
						onClick={() => setShowModal(true)}
					>
						Contact the owner
					</button>
				</div>
				<ContactForm
					showModal={showModal}
					setShowModal={setShowModal}
					listing={data}
					date_start={parsedParams?.date_start}
					date_end={parsedParams?.date_end}
				/>
			</div>
		</div>
	);
}

export default Listing;
