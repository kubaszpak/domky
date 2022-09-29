import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useZodForm } from "@/components/utils/zod";
import { createSchema } from "@/components/utils/schemas";
import { useEffect, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "@/components/maps/Map";
import Marker from "@/components/maps/Marker";
import { signIn, useSession } from "next-auth/react";
import UploadWidget from "@/components/cloudinary/UploadWidget";
import Script from "next/script";
import Image from "next/image";

const ListingCreator: NextPage = () => {
	const { data: session, status } = useSession();
	const { register, handleSubmit, reset, formState, setValue } = useZodForm({
		schema: createSchema,
		defaultValues: {
			guests: 1,
		},
	});
	const mutation = trpc.proxy.auth.createListing.useMutation();
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());

	useEffect(() => {
		setValue("date_start", startDate);
		setValue("date_end", endDate);
	}, [startDate, endDate, setValue]);

	const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
	const [zoom, setZoom] = useState(7); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 52.339811,
		lng: 18.87222,
	});

	const [dateError, setDateError] = useState<string | null>(null);
	const [images, setImages] = useState<string[] | undefined>(undefined);
	const [showUploadWidget, setShowUploadWidget] = useState<boolean>(false);
	const onClick = (e: google.maps.MapMouseEvent) => {
		// avoid directly mutating state
		setMarker(e.latLng!);
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
		if (!images) {
			setImages([image]);
			return;
		}
		setImages([...images, image]);
	};

	return (
		<>
			<Script
				src="https://upload-widget.cloudinary.com/global/all.js"
				type="text/javascript"
				onLoad={() => {
					setShowUploadWidget(true);
				}}
			/>
			<DatePicker
				selected={startDate}
				onChange={(date: Date) => {
					setStartDate(date);
					setValue("date_start", date);
				}}
			/>
			<DatePicker
				selected={endDate}
				onChange={(date: Date) => {
					setEndDate(date);
					setValue("date_end", date);
				}}
			/>
			{dateError && <p className="text-red-700">{dateError}</p>}
			<br />
			<form
				className="space-y-2"
				onSubmit={handleSubmit(async (values) => {
					if (startDate >= endDate) {
						setDateError(
							"Date range invalid!\nThere must be at least 1 day between startDate and endDate!"
						);
						return;
					}
					await mutation.mutateAsync(values);
					reset();
				})}
			>
				<label>
					Name
					<br />
					<input required {...register("name")} />
				</label>
				{formState.errors.name?.message && (
					<p className="text-red-700">{formState.errors.name?.message}</p>
				)}
				<br />
				<label>
					Description
					<br />
					<input required {...register("description")} />
				</label>
				{formState.errors.description?.message && (
					<p className="text-red-700">
						{formState.errors.description?.message}
					</p>
				)}
				<br />
				<label>
					Guests
					<br />
					<input
						type="number"
						required
						{...register("guests", {
							valueAsNumber: true,
						})}
					/>
				</label>
				{formState.errors.guests?.message && (
					<p className="text-red-700">{formState.errors.guests?.message}</p>
				)}
				<br />
				<button
					type="submit"
					disabled={mutation.isLoading}
					className="border bg-blue-500 text-white p-2 font-bold"
				>
					{mutation.isLoading ? "Loading" : "Submit"}
				</button>
			</form>
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
			{showUploadWidget && <UploadWidget addImage={addImage} />}
			{images &&
				images.map((image, idx) => {
					return (
						<Image
							src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${image}`}
							key={idx}
							alt="apartment"
							height={600}
							width={1000}
						/>
					);
				})}
		</>
	);
};

export default ListingCreator;
