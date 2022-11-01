import { searchSchema } from "@/components/utils/schemas";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React from "react";

const Find = () => {
	const router = useRouter();
	const params = router.query;

	const parsedParams = searchSchema.parse({
		...params,
		guests: parseInt(params.guests!.toString()),
		date_start: new Date(params.date_start!.toString()),
		date_end: new Date(params.date_end!.toString()),
	});

	const searchQuery = trpc.proxy.listing.search.useQuery(parsedParams);

	return <div>{searchQuery.isSuccess && JSON.stringify(searchQuery.data)}</div>;
};

export default Find;
