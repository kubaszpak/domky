import { searchSchema } from "@/components/utils/schemas";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { BsFillPeopleFill } from "react-icons/bs";
import Link from "next/link";

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
	const today = new Date();
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
	return (
		<div className="p-5 max-w-screen-2xl mx-auto lg:max-w-7xl">
			<h1 className="font-bold mb-5 text-lg">Results</h1>
			<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
				{searchQuery.isSuccess &&
					searchQuery.data &&
					searchQuery.data.map((listing) => {
						const start =
							today > listing.availability?.start!
								? today
								: listing.availability?.start!;
						const end = listing.availability?.end;

						if (today > end!) return;

						return (
							<Link
								href={`/listing/${listing.id}`}
								key={listing.id}
								legacyBehavior
							>
								<a>
									<div className="overflow-hidden rounded-lg">
										<Image
											src={`https://res.cloudinary.com/${
												process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
											}/image/upload/${listing.images.split("@@@")[0]}`}
											alt={`Apartment main image`}
											width={1120}
											height={630}
										/>
									</div>
									<div className="float-right text-right">
										<h1 className="font-semibold">{listing.name}</h1>
										<h2>
											{listing.city}
											<BsFillPeopleFill className="inline mx-1 p-0.5" />
											{listing.guests}
										</h2>
										<h2>
											{`${start!.getDate()} ${dates[start!.getMonth()]} -
										${end!.getDate()} ${dates[end!.getMonth()]}`}
										</h2>
									</div>
								</a>
							</Link>
						);
					})}
			</div>
		</div>
	);
};

export default Find;
