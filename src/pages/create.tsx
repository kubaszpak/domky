import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useZodForm } from "@/components/utils/zod";
import { createSchema } from "@/components/utils/schemas";
import { ChangeEvent, useReducer, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "@/components/maps/map";
import Marker from "@/components/maps/marker";
import { signIn, useSession } from "next-auth/react";
import UploadWidget from "@/components/cloudinary/upload_widget";
import Image from "next/image";
import {
	DATE_CHANGE,
	FOCUS_CHANGE,
	initialState,
	reducer,
} from "@/types/dates";
import { DateRangeInput } from "@datepicker-react/styled";
import useWindowSize from "@/components/utils/use_window_size";

const ListingCreator: NextPage = () => {
	const [width] = useWindowSize();
	const { status } = useSession();
	const { register, handleSubmit, reset, formState, setValue } = useZodForm({
		schema: createSchema,
		defaultValues: {
			guests: 1,
		},
	});

	const [state, dispatch] = useReducer(reducer, initialState);
	const mutation = trpc.proxy.auth.createListing.useMutation();

	const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
	const [zoom, setZoom] = useState(7); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 52.339811,
		lng: 18.87222,
	});
	const [mainImage, setMainImage] = useState<string | null>(null);
	const [dateError, setDateError] = useState<string | null>(null);
	const [images, setImages] = useState<string[]>([]);

	const onClick = (e: google.maps.MapMouseEvent) => {
		// avoid directly mutating state
		setMarker(e.latLng!);
		// console.log(e.latLng.)
		setValue("longitude", e.latLng!.toJSON().lng);
		setValue("latitude", e.latLng!.toJSON().lat);
	};

	const onIdle = (m: google.maps.Map) => {
		setZoom(m.getZoom()!);
		setCenter(m.getCenter()!.toJSON());
	};

	if (status !== "authenticated") {
		return (
			<>
				<p>Sign in first to view this page!</p>
				<button onClick={() => signIn()}>Sign in</button>
			</>
		);
	}

	const addImage = (image: string) => {
		setImages((image_ids) => [...image_ids!, image]);
	};

	const handleMainChange = (e: ChangeEvent<HTMLInputElement>) => {
		setMainImage(e.currentTarget.value);
		const imageChain =
			e.currentTarget.value +
			"@@@" +
			images?.reduce((prev, curr) => {
				return prev + "@@@" + curr;
			}, "");
		console.log(imageChain);
		setValue("images", imageChain);
	};

	return (
		<div className="m-10 flex">
			<div className="flex-1 pr-10">
				<form
					className="space-y-2"
					onSubmit={handleSubmit(async (values) => {
						if (values.date_start >= values.date_end) {
							setDateError(
								"Date range invalid!\nThere must be at least 1 day between startDate and endDate!"
							);
							return;
						}
						await mutation.mutateAsync(values);
						reset();
					})}
				>
					<div>
						<label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
							Dates
						</label>
						<div className="date-range-picker">
							<DateRangeInput
								onDatesChange={(data) => {
									data.startDate && setValue("date_start", data.startDate);
									data.endDate && setValue("date_end", data.endDate);
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
					{dateError && <p className="text-red-700">{dateError}</p>}
					<div>
						<label
							htmlFor="name"
							className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>
							Name
						</label>
						<input
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							id="name"
							required
							{...register("name")}
						/>
						{formState.errors.name?.message && (
							<p className="text-red-700">{formState.errors.name?.message}</p>
						)}
					</div>
					<div>
						<label
							className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							htmlFor="description"
						>
							Description
						</label>
						<input
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							id="description"
							required
							{...register("description")}
						/>
						{formState.errors.description?.message && (
							<p className="text-red-700">
								{formState.errors.description?.message}
							</p>
						)}
					</div>
					<div>
						<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
							Guests
						</label>
						<input
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							type="number"
							required
							{...register("guests", {
								valueAsNumber: true,
							})}
						/>
						{formState.errors.guests?.message && (
							<p className="text-red-700">{formState.errors.guests?.message}</p>
						)}
					</div>
					<div className="flex">
						<button
							type="submit"
							disabled={mutation.isLoading}
							className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-1"
						>
							{mutation.isLoading ? "Loading" : "Submit"}
						</button>
						<UploadWidget addImage={addImage} />
					</div>
				</form>
				{images &&
					images.map((image, idx) => {
						return (
							<label key={idx}>
								<input
									type="radio"
									name="main"
									value={image}
									checked={image === mainImage}
									onChange={handleMainChange}
								/>
								<Image
									src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image}`}
									alt={`Apartment ${idx}`}
									height={1080}
									width={1920}
								/>
							</label>
						);
					})}
			</div>
			<Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
				<Map
					center={center}
					onClick={onClick}
					onIdle={onIdle}
					zoom={zoom}
					style={{ flexGrow: "1", height: "400px" }}
				>
					{marker && <Marker position={marker} />}
				</Map>
			</Wrapper>
			{(formState.errors.latitude?.message ||
				formState.errors.longitude?.message) && (
				<p className="text-red-700">{"Put a marker on the map to continue!"}</p>
			)}
		</div>
	);
};

export default ListingCreator;
