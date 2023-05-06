import type { NextPage } from "next";
import { DateRangeInput } from "@datepicker-react/styled";
import React, { useReducer, useState } from "react";
import { useZodForm } from "@/utils/zod";
import { searchSchema } from "@/utils/schemas";
import { useLoadScript } from "@react-google-maps/api";
import Autocomplete from "@/components/maps/autocomplete";
import { Controller } from "react-hook-form";
import {
	DATE_CHANGE,
	FOCUS_CHANGE,
	initialState,
	reducer,
} from "@/types/dates";
import useWindowSize from "@/utils/use_window_size";
import { useRouter } from "next/router";
import Spinner from "@/components/spinner";
import { Toast } from "flowbite-react";
import { BsFillPatchExclamationFill } from "react-icons/bs";
import Link from "next/link";

const Home: NextPage = () => {
	const router = useRouter();
	const [width] = useWindowSize();
	const [libraries] = useState<Libraries>(["places"]);
	const { isLoaded } = useLoadScript({
		id: "google-map-script",
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries,
	});

	const [state, dispatch] = useReducer(reducer, initialState);
	const {
		register,
		handleSubmit,
		setValue: setFormValue,
		control,
	} = useZodForm({
		schema: searchSchema,
		defaultValues: {
			guests: 1,
		},
	});

	return !!isLoaded ? (
		<>
			<div className="flex flex-auto flex-col justify-evenly items-center mb-10 md:mb-20">
				<h1 className="font-black text-5xl sm:text-7xl text-center py-5">
					Find your new home
				</h1>
				<form
					onSubmit={handleSubmit(async (data) => {
						router.push({
							pathname: `/find/${
								data.where
							}/${data.date_start.toUTCString()}/${data.date_end.toUTCString()}/${
								data.guests
							}`,
						});
					})}
					className="flex flex-col lg:flex-row items-center justify-center gap-4"
				>
					{isLoaded && (
						<Controller
							name="where"
							control={control}
							render={({ field: { onChange, ref } }) => (
								<Autocomplete onChange={onChange} ref={ref} />
							)}
						/>
					)}
					<div>
						<label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
							Dates
						</label>
						<div className="date-range-picker">
							<DateRangeInput
								onDatesChange={(data) => {
									data.startDate && setFormValue("date_start", data.startDate);
									data.endDate && setFormValue("date_end", data.endDate);
									dispatch({ type: DATE_CHANGE, payload: data });
								}}
								onFocusChange={(focusedInput) =>
									dispatch({ type: FOCUS_CHANGE, payload: focusedInput })
								}
								vertical={width! < 640}
								showClose={false}
								minBookingDays={2}
								minBookingDate={new Date()}
								startDate={state.startDate} // Date or null
								endDate={state.endDate} // Date or null
								focusedInput={state.focusedInput} // START_DATE, END_DATE or null
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="guests"
							className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>
							Guests
						</label>
						<input
							type="number"
							id="guests"
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							placeholder="Guests"
							required
							{...register("guests", {
								valueAsNumber: true,
							})}
						/>
					</div>
					<button
						className="lg:self-end text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-semibold rounded-lg text-sm px-5 py-2.5 text-center mb-1"
						type="submit"
					>
						Find
					</button>
				</form>
			</div>
			<Toast className="absolute bottom-4 left-4 z-50">
				<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
					<BsFillPatchExclamationFill className="h-5 w-5" />
				</div>
				<div className="ml-3 text-sm font-normal px-1">
					<Link
						href="/find/Warszawa/Tue,%2031%20Oct%202023%2023:00:00%20GMT/Thu,%2009%20Nov%202023%2023:00:00%20GMT/2"
						passHref
					>
						<a className="text-blue-300 font-semibold">Click here</a>
					</Link>{" "}
					or search: Warszawa, 1st Nov - 10th Nov, 2 guests to see a couple of
					demo offers!
				</div>
				<Toast.Toggle />
			</Toast>
		</>
	) : (
		<Spinner />
	);
};

export default Home;
