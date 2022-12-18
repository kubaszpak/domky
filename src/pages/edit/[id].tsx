import Spinner from "@/components/spinner";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ListingCreator from "../create";

const Edit: NextPage = () => {
	const router = useRouter();
	const { query, isReady } = router;
	const { id } = query;
	const [parsedId, setParsedId] = useState<string | null>(null);

	useEffect(() => {
		if (!isReady) return;
		setParsedId(id as string);
	}, [id, isReady, setParsedId]);

	if (!parsedId) return <Spinner />;

	return <ListingCreator parsedId={parsedId} />;
};

export default Edit;
