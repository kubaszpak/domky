import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import { useZodForm } from "@/utils/zod";
import { createSchema } from "@/utils/schemas";
import { useCallback, useEffect, useReducer, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "@/components/maps/map";
import Marker from "@/components/maps/marker";
import { useSession } from "next-auth/react";
import UploadWidget from "@/components/cloudinary/upload_widget";
import Image from "next/image";
import {
	DATE_CHANGE,
	FOCUS_CHANGE,
	initialState,
	reducer,
} from "@/types/dates";
import { DateRangeInput } from "@datepicker-react/styled";
import useWindowSize from "@/utils/use_window_size";
import { useRouter } from "next/router";
import Spinner from "@/components/spinner";
import { useLoadScript } from "@react-google-maps/api";
import SignIn from "@/components/sign_in";

interface Props {
	parsedId: string;
}

const ListingCreator: NextPage<Props> = ({ parsedId: listingId }) => {
	const [libraries] = useState<Libraries>(["places"]);
	useLoadScript({
		id: "google-map-script",
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
		libraries,
	});
	const { register, handleSubmit, formState, setValue } = useZodForm({
		schema: createSchema,
		defaultValues: {
			guests: 1,
			city: "",
		},
	});
	const { status } = useSession();
	const [width] = useWindowSize();
	const [state, dispatch] = useReducer(reducer, initialState);

	const createListingMutation = trpc.proxy.listing.createListing.useMutation();
	const editListingMutation = trpc.proxy.listing.edit.useMutation();
	const listingQuery = trpc.proxy.listing.get.useQuery(listingId, {
		enabled: !!listingId,
		onSuccess: (data) => {
			if (!data) throw new Error(`Listing ${listingId} does not eexist`);
			setValue("name", data.name);
			setValue("guests", data.guests);
			setValue("city", data.city);
			setValue("longitude", data.longitude);
			setValue("latitude", data.latitude);
			setValue("description", data.description);
			setValue("date_start", new Date());
			setValue("date_end", new Date());
			setMarker(
				new google.maps.LatLng({
					lat: data.latitude,
					lng: data.longitude,
				})
			);
			setCenter({
				lat: data.latitude,
				lng: data.longitude,
			});
			setImages(data.images.split("@@@"));
			setMainImage(data.images.split("@@@")[0]!);
		},
	});

	const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
	const [zoom, setZoom] = useState(7); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 52.339811,
		lng: 18.87222,
	});

	const [mainImage, setMainImage] = useState<string | null>(null);
	const [images, setImages] = useState<string[]>([]);
	const [enterCityManually, setEnterCityManually] = useState(false);
	const router = useRouter();

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
		const main = `${mainImage ? mainImage : images[0]}`;
		const imageChain = images?.reduce((prev, curr) => {
			if (curr === main) return prev;
			return prev + "@@@" + curr;
		}, main);
		setValue("images", imageChain);
	}, [setValue, mainImage, images]);

	const addImage = useCallback((image: string) => {
		setImages((image_ids) => [...image_ids, image]);
	}, []);

	useEffect(() => {
		createNewImageChain();
	}, [images, mainImage, createNewImageChain]);

	useEffect(() => {
		if (!marker) return;
		const formattedLatLng = `${marker?.lat()}, ${marker?.lng()}`;
		async function geocode() {
			fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${formattedLatLng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
			)
				.then((data) => {
					if (data.ok) return data.json();
				})
				.then((json) => {
					const cityData = json.results[0]?.address_components?.filter(
						(ac: any) => ac.types?.includes("locality")
					)[0];
					if (cityData) {
						setValue("city", cityData.long_name);
						setEnterCityManually(false);
						return;
					}
					setValue("city", "");
					setEnterCityManually(true);
				});
		}
		geocode();
	}, [marker, setValue]);

	if (!!listingId && listingQuery.isLoading) {
		return <Spinner />;
	}

	if (status !== "authenticated") {
		return <SignIn />;
	}

	return (
		<form
			className="space-y-2 m-10 max-w-6xl xl:mx-auto xl:min-w-[950px]"
			onSubmit={handleSubmit((values) => {
				if (!!listingId) {
					editListingMutation.mutate({ ...values, listingId });
				} else {
					createListingMutation.mutate(values);
				}
				router.push("/");
			})}
		>
			<div className="grid md:grid-flow-col grid-equal-col items-center">
				<div className="max-w-lg pr-0 md:pr-12 flex flex-col justify-between h-full">
					<div>
						<label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
							Dates
						</label>
						{!listingId ? (
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
								{(formState.errors.date_start?.message ||
									formState.errors.date_end?.message) && (
									<p className="text-red-700">{"Select a valid date range!"}</p>
								)}
							</div>
						) : (
							<div className="mb-1">
								You can edit the availability only from the profile page!
							</div>
						)}
					</div>
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
					{formState.errors.images?.message && (
						<p className="text-red-700">
							{formState.errors.images?.message} - Upload images to continue!
						</p>
					)}
				</div>
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Mark a location
					</label>
					<Wrapper
						id="google-map-script"
						apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
					>
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
						formState.errors.longitude?.message ||
						formState.errors.city?.message) && (
						<p className="text-red-700">
							{"Select a valid city name to continue!"}
						</p>
					)}
					<div>
						<label
							className="block my-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							htmlFor="output-location"
						>
							Output city
						</label>
						<input
							className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							id="output-location"
							disabled={!enterCityManually}
							required
							title="Put a marker on the map!"
							placeholder={
								enterCityManually
									? "City name not available, enter it manually or move the marker"
									: "Put a marker on the map!"
							}
							{...register("city")}
						/>
					</div>
				</div>
			</div>
			{!!images.length && (
				<>
					<section className="overflow-hidden text-gray-700 ">
						<div className="py-5 w-full">
							<label className="block my-2 text-sm font-medium text-gray-900 dark:text-gray-300">
								Select the main image
							</label>
							<div className="pt-3 grid md:grid-cols-2 gap-3 w-full">
								{images.map((image, idx) => {
									return (
										<div
											key={image}
											className={`${
												mainImage === image && "selected-img"
											} overflow-hidden rounded-lg`}
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
			<button
				type="submit"
				disabled={createListingMutation.isLoading}
				className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-1"
			>
				{createListingMutation.isLoading ? "Loading" : "Submit"}
			</button>
		</form>
	);
};

export default ListingCreator;
