import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import { useZodForm } from "@/components/utils/zod";
import { createSchema } from "@/components/utils/schemas";
import {
	MouseEvent,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from "react";
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
		setMarker(e.latLng!);
		setValue("longitude", e.latLng!.toJSON().lng);
		setValue("latitude", e.latLng!.toJSON().lat);
	};

	const onIdle = (m: google.maps.Map) => {
		setZoom(m.getZoom()!);
		setCenter(m.getCenter()!.toJSON());
	};

	const createNewImageChain = useCallback(() => {
		if (images.length === 0) return;
		const imageChain =
			`${mainImage ? mainImage : images[0]}` +
			"@@@" +
			images?.reduce((prev, curr) => {
				return prev + "@@@" + curr;
			}, "");
		setValue("images", imageChain);
	}, [setValue, mainImage, images]);

	const addImage = useCallback((image: string) => {
		setImages((image_ids) => [...image_ids, image]);
	}, []);

	useEffect(() => {
		createNewImageChain();
	}, [images, mainImage, createNewImageChain]);

	if (status !== "authenticated") {
		return (
			<>
				<p>Sign in first to view this page!</p>
				<button onClick={() => signIn()}>Sign in</button>
			</>
		);
	}

	return (
		<form
			className="space-y-2 m-10"
			onSubmit={handleSubmit(async (values) => {
				await mutation.mutateAsync(values);
				reset();
				setImages([]);
			})}
		>
			<div className="grid md:grid-flow-col grid-equal-col items-center">
				<div className="max-w-lg pr-0 md:pr-12 flex flex-col justify-between h-full">
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
						<textarea
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
					<div className="my-3">
						<UploadWidget addImage={addImage} />
					</div>
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Mark a location
					</label>
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
						<p className="text-red-700">
							{"Put a marker on the map to continue!"}
						</p>
					)}
					<div>
						<label
							className="block my-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							htmlFor="output-location"
						>
							Output location
						</label>
						<input
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							id="output-location"
							disabled
							required
							title="Put a marker on the map!"
						/>
					</div>
				</div>
			</div>
			{!!images.length && (
				<>
					<section className="overflow-hidden text-gray-700 ">
						<div className="py-5 w-full">
							<label className="block my-2 text-sm font-medium text-gray-900 dark:text-gray-300">
								Click on an image to select it as the main one
							</label>
							<div className="pt-3 grid md:grid-cols-2 gap-3 w-full">
								{images.map((image, idx) => {
									return (
										<div
											key={image}
											className={`${mainImage === image && "selected-img"}`}
										>
											<Image
												src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image}`}
												alt={`Apartment ${idx}`}
												onClick={() => setMainImage(image)}
												width={1120}
												height={630}
											/>
										</div>
									);
								})}
							</div>
						</div>
					</section>
				</>
			)}
			{/* </div> */}
			<button
				type="submit"
				disabled={mutation.isLoading}
				className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-1"
			>
				{mutation.isLoading ? "Loading" : "Submit"}
			</button>
		</form>
	);
};

export default ListingCreator;
