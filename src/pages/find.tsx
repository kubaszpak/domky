import { searchSchema } from "@/components/utils/schemas";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React from "react";

const Find = () => {
	const { query, isReady } = useRouter();

	if (!isReady) return <></>;
	const { where, guests, date_start, date_end } = query;

	// if (!where || !guests || !date_start || !date_end) return

	const parsedParams = searchSchema.parse({
		where,
		guests: parseInt(guests!.toString()),
		date_start: new Date(date_start!.toString()),
		date_end: new Date(date_end!.toString()),
	});

	const searchQuery = trpc.proxy.listing.search.useQuery(parsedParams);

	return <div>{searchQuery.isSuccess && JSON.stringify(searchQuery.data)}</div>;
};

export default Find;
