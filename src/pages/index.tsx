import type { NextPage } from "next";
import Head from "next/head";
import { DateRangeInput, OnDatesChangeProps } from "@datepicker-react/styled";
import React, { useReducer } from "react";
import { useZodForm } from "@/components/utils/zod";
import { searchSchema } from "@/components/utils/schemas";
import {
	DateChangeAction,
	DATE_CHANGE,
	FocusChangeAction,
	FOCUS_CHANGE,
} from "@/types/dates";
import { useLoadScript } from "@react-google-maps/api";
import Autocomplete from "@/components/maps/autocomplete";

const initialState: OnDatesChangeProps = {
	startDate: null,
	endDate: null,
	focusedInput: null,
};

function reducer(
	state: OnDatesChangeProps,
	action: DateChangeAction | FocusChangeAction
) {
	switch (action.type) {
		case FOCUS_CHANGE:
			return { ...state, focusedInput: action.payload };
		case DATE_CHANGE:
			return action.payload;
		default:
			throw new Error();
	}
}

const Home: NextPage = () => {
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries: ["places"],
	});

	const [state, dispatch] = useReducer(reducer, initialState);
	const {
		register,
		handleSubmit,
		reset,
		setValue: setFormValue,
		watch,
		formState,
	} = useZodForm({
		schema: searchSchema,
		defaultValues: {
			guests: 1,
		},
	});

	// const where = watch("where");

	// useEffect(() => {
	// 	isLoaded && init()
	// 	setValue(where);
	// }, [where, setValue, isLoaded, init]);
	formState.errors && console.log(formState.errors);
	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<form
				onSubmit={handleSubmit(async () => {
					console.log("Looking ...");
					reset();
				})}
				className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-4 min-h-[80vh] lg:min-h-[40vh]"
			>
				{/* <FormItem name="where" value={where} valueSetter={setWhere} /> */}
				{isLoaded && <Autocomplete {...register("where")} />}
				<label className="date-range-picker block text-sm font-medium text-gray-900 dark:text-gray-300">
					Dates
					<div className="mt-2">
						<DateRangeInput
							onDatesChange={(data) => {
								data.startDate && setFormValue("date_start", data.startDate);
								data.endDate && setFormValue("date_end", data.endDate);
								dispatch({ type: DATE_CHANGE, payload: data });
							}}
							onFocusChange={(focusedInput) =>
								dispatch({ type: FOCUS_CHANGE, payload: focusedInput })
							}
							showClose={false}
							minBookingDays={2}
							minBookingDate={new Date()}
							startDate={state.startDate} // Date or null
							endDate={state.endDate} // Date or null
							focusedInput={state.focusedInput} // START_DATE, END_DATE or null
						/>
					</div>
				</label>
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
					className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-1"
					type="submit"
				>
					Find
				</button>
			</form>
		</>
	);
};

export default Home;
