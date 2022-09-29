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
	const [url, setUrl] = useState("");
	console.log(formState.errors);

	useEffect(() => {
		setValue("date_start", startDate);
		setValue("date_end", endDate);
	}, [startDate, endDate, setValue]);

	const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
	const [zoom, setZoom] = useState(3); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 0,
		lng: 0,
	});

	const uploadImage = () => {
		if (!image) return;
		const formData = new FormData();
		formData.append("file", image);
		formData.append("upload_preset", "default_unsigned");
		formData.append("cloud_name", "kubaszpak");
		fetch("https://api.cloudinary.com/v1_1/kubaszpak/image/upload", {
			method: "post",
			body: formData,
		})
			.then((resp) => resp.json())
			.then((data) => {
				console.log(data);
				setUrl(data.url);
			})
			.catch((err) => console.log(err));
		console.log(image);
	};

	const [dateError, setDateError] = useState<string | null>(null);
	const [image, setImage] = useState<File | undefined>(undefined);
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
			<label>
				Name
				<br />
				<input
					type="file"
					accept=".jpg,.png,.jpeg"
					onChange={(e) => setImage(e.target.files![0])}
				/>
			</label>
			<br />
			<button onClick={uploadImage}>Upload</button>
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
			<img src={url} />
			{showUploadWidget && <UploadWidget />}
		</>
	);
};

export default ListingCreator;
