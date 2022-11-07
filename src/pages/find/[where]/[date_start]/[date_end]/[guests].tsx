import { searchSchema } from "@/components/utils/schemas";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { BsFillPeopleFill } from "react-icons/bs";

interface Dates {
	[key: number]: string;
}

const dates: Dates = {
	0: "Jan",
	1: "Feb",
	2: "Mar",
	3: "Apr",
	4: "May",
	5: "Jun",
	6: "Jul",
	7: "Aug",
	8: "Sep",
	9: "Oct",
	10: "Nov",
	11: "Dec",
};

const Find = () => {
	const { query, isReady } = useRouter();
	const { where, guests, date_start, date_end } = query;
	const [parsedParams, setParsedParams] = useState<z.infer<
		typeof searchSchema
	> | null>(null);

	useEffect(() => {
		if (!isReady) {
			return;
		}
		setParsedParams(
			searchSchema.parse({
				where,
				guests: parseInt(guests!.toString()),
				date_start: new Date(date_start!.toString()),
				date_end: new Date(date_end!.toString()),
			})
		);
	}, [isReady, where, date_start, date_end, guests]);

	const searchQuery = trpc.proxy.listing.search.useQuery(parsedParams, {
		enabled: !!parsedParams,
	});
	// TODO: check if, in a case where there is a colliding reservation, the listing does not appear
	return (
		<div className="grid p-5 gap-10 md:grid-cols-2 lg:max-w-7xl lg:grid-cols-3 2xl:grid-cols-4 max-w-screen-2xl mx-auto">
			{searchQuery.isSuccess &&
				searchQuery.data &&
				searchQuery.data.map((listing) => {
					const start = listing.availability?.start;
					const end = listing.availability?.end;

					return (
						<div key={listing.id} className="overflow-hidden rounded-lg">
							<Image
								src={`https://res.cloudinary.com/${
									process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
								}/image/upload/${listing.images.split("@@@")[0]}`}
								alt={`Apartment main image`}
								width={1120}
								height={630}
							/>
							<div className="float-right">
								<h1 className="font-semibold">{listing.name}</h1>
								<h2 className="text-right">
									{listing.city}
									<BsFillPeopleFill className="inline mx-1 p-0.5" />
									{listing.guests}
								</h2>
								<h2 className="text-right">
									{`${end!.getDate() + 1} ${dates[start!.getMonth()]} -
										${end!.getDate()} ${dates[end!.getMonth()]}`}
								</h2>
							</div>
						</div>
					);
				})}
		</div>
	);
};

export default Find;
