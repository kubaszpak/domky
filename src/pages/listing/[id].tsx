import { trpc } from "@/utils/trpc";
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
	
	// TODO: extract into a seperate component 
	return getQuery.isSuccess && !!getQuery.data ? (
		<div className="listing">
			<Image
				src={`https://res.cloudinary.com/${
					process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
				}/image/upload/${getQuery.data.images.split("@@@")[0]}`}
				alt={`Apartment main image`}
				width={1120}
				height={630}
			/>
			<div className="float-right text-right">
				<h1 className="font-semibold">{getQuery.data.name}</h1>
			</div>
		</div>
	) : (
		<div>Listing not found</div>
	);
}

export default Listing;
