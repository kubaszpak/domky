import { trpc } from "@/utils/trpc";
import { Carousel } from "flowbite-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { z } from "zod";

function Listing() {
	const { query, isReady } = useRouter();
	const { id } = query;
	const [parsedId, setParsedId] = useState<string | null>(null);

	useEffect(() => {
		if (!isReady) return;
		setParsedId(z.string().parse(id));
	}, [id, isReady]);

	const getQuery = trpc.proxy.listing.get.useQuery(parsedId);
	const images =
		getQuery.isSuccess && !!getQuery.data
			? getQuery.data.images.split("@@@").filter((image_id) => !!image_id)
			: null;

			return getQuery.isSuccess && !!getQuery.data ? (
		<div className="listing px-5 py-10">
			<div className="h-80 sm:h-96 md:h-[36rem] lg:h-[45rem]">
				<Carousel slide={false}>
					{images &&
						images.map((imageId, idx) => {
							return (
								<div key={idx} className="h-full w-full">
									<Image
										src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${imageId}`}
										alt={`Apartment image ${idx}`}
										layout="fill"
										objectFit="cover"
									/>
								</div>
							);
						})}
				</Carousel>
			</div>
			<div className="mt-5 float-right text-right">
				<h1 className="font-semibold text-3xl">{getQuery.data.name}</h1>
			</div>
		</div>
	) : (
		<div>Listing not found</div>
	);
}

export default Listing;
