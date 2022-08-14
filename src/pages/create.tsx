import { trpc, useZodForm } from "@/utils/trpc";
import type { NextPage } from "next";
import { useState } from "react";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import { z } from "zod";
import dynamic from "next/dynamic";
import { DayRange } from "@hassanmojab/react-modern-calendar-datepicker";
const DatePicker = dynamic(
	() => import("@hassanmojab/react-modern-calendar-datepicker"),
	{
		ssr: false,
	}
);

export const createSchema = z.object({
	name: z.string(),
	guests: z.number(),
	description: z.string(),
	longitude: z.string(),
	latitude: z.string(),
});

const ListingCreator: NextPage = () => {
	const { register, handleSubmit, reset } = useZodForm({
		schema: createSchema,
		defaultValues: {
			longitude: "0.0",
			latitude: "0.0",
		},
	});
	const mutation = trpc.proxy.auth.createListing.useMutation();
	const [dayRange, setDayRange] = useState<DayRange>({
		from: null,
		to: null,
	});

	return (
		<>
			<DatePicker value={dayRange} onChange={setDayRange} />
			<form
				onSubmit={handleSubmit(async (values) => {
					await mutation.mutateAsync(values);
					reset();
				})}
			>
				<label>
					<input {...register("name")} />
					<br />
				</label>
				<label>
					<input {...register("description")} />
					<br />
				</label>
				<button
					type="submit"
					disabled={mutation.isLoading}
					className="border bg-primary-500 text-white p-2 font-bold"
				>
					{mutation.isLoading ? "Loading" : "Submit"}
				</button>
			</form>
		</>
	);
};

export default ListingCreator;
