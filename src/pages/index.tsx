import type { NextPage } from "next";
import Head from "next/head";
import { useSession, signIn, signOut } from "next-auth/react";
import { FormEvent, useState } from "react";
import FormItem from "@/components/form_item";
import Link from "next/link";
import {
	DateRangeInput,
	FocusedInput,
	OnDatesChangeProps,
} from "@datepicker-react/styled";
import React, { useReducer } from "react";
import Image from "next/image";

const FOCUS_CHANGE = "focusChange";
type FOCUS_CHANGE = typeof FOCUS_CHANGE;
const DATE_CHANGE = "dateChange";
type DATE_CHANGE = typeof DATE_CHANGE;

const initialState: OnDatesChangeProps = {
	startDate: null,
	endDate: null,
	focusedInput: null,
};

interface DateChangeAction {
	type: DATE_CHANGE;
	payload: OnDatesChangeProps;
}

interface FocusChangeAction {
	type: FOCUS_CHANGE;
	payload: FocusedInput;
}

function reducer(
	state: OnDatesChangeProps,
	action: DateChangeAction | FocusChangeAction
) {
	switch (action.type) {
		case FOCUS_CHANGE:
			return { ...state, focusedInput: action.payload };
		case DATE_CHANGE:
			console.log(action.payload);
			return action.payload;
		default:
			throw new Error();
	}
}

const Home: NextPage = () => {
	const { data: session, status } = useSession();
	const [where, setWhere] = useState("");
	const [guests, setGuests] = useState("");
	const [state, dispatch] = useReducer(reducer, initialState);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("Looking ...");
	};

	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="min-h-screen w-full">
				<form
					className="flex flex-col items-center justify-center min-h-[inherit]"
					onSubmit={handleSubmit}
				>
					<FormItem name="where" value={where} valueSetter={setWhere} />
					<DateRangeInput
						onDatesChange={(data) =>
							dispatch({ type: DATE_CHANGE, payload: data })
						}
						onFocusChange={(focusedInput) =>
							dispatch({ type: FOCUS_CHANGE, payload: focusedInput })
						}
						minBookingDays={2}
						minBookingDate={new Date()}
						startDate={state.startDate} // Date or null
						endDate={state.endDate} // Date or null
						focusedInput={state.focusedInput} // START_DATE, END_DATE or null
					/>
					<FormItem
						name="guests"
						value={guests}
						valueSetter={setGuests}
						type="number"
					/>
					<button type="submit">Find</button>
				</form>
			</div>
			<div className="flex gap-4 justify-end px-8 py-4 relative">
				{status === "authenticated" ? (
					<>
						<Link href={"/create"}>
							<a>
								<b>Create a Listing</b>
							</a>
						</Link>
						Signed in as {session.user?.name} <br />
						<button onClick={() => signOut()}>Sign out</button>
					</>
				) : (
					<>
						Not signed in <br />
						<button onClick={() => signIn()}>Sign in</button>
					</>
				)}
			</div>
		</>
	);
};

export default Home;
