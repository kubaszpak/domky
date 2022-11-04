import { searchSchema } from "@/components/utils/schemas";
import { trpc } from "@/utils/trpc";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { z } from "zod";

const Find = () => {
	const { query, isReady } = useRouter();
	const { where, guests, date_start, date_end } = query;
	const [parsedParams, setParsedParams] = useState<
		z.infer<typeof searchSchema> | undefined
	>(undefined);

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

	const searchQuery = trpc.proxy.listing.search.useQuery(parsedParams);

	return (
		<div>
			{searchQuery.isSuccess &&
				searchQuery.data &&
				JSON.stringify(searchQuery.data)}
		</div>
	);
};

export default Find;
