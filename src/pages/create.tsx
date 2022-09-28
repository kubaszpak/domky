import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useZodForm } from "@/components/utils/zod";
import { createSchema } from "@/components/utils/schemas";
import { useEffect, useRef, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "@/components/maps/Map";
import Marker from "@/components/maps/Marker";

const ListingCreator: NextPage = () => {
	const { register, handleSubmit, reset, formState, setValue } = useZodForm({
		schema: createSchema,
		defaultValues: {
			longitude: "0.0",
			latitude: "0.0",
			guests: 1,
		},
	});
	const mutation = trpc.proxy.auth.createListing.useMutation();
	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date());
	console.log(formState.errors);

	useEffect(() => {
		setValue("date_start", startDate);
		setValue("date_end", endDate);
	}, [startDate, endDate, setValue]);

	// const center = { lat: -34.397, lng: 150.644 };
	// const zoom = 4;
	const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
	const [zoom, setZoom] = useState(3); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 0,
		lng: 0,
	});

	const onClick = (e: google.maps.MapMouseEvent) => {
		// avoid directly mutating state
		setClicks([...clicks, e.latLng!]);
	};

	const onIdle = (m: google.maps.Map) => {
		console.log("onIdle");
		setZoom(m.getZoom()!);
		setCenter(m.getCenter()!.toJSON());
	};

	return (
		<>
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
			<form
				className="space-y-2"
				onSubmit={handleSubmit(async (values) => {
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
				<button
					type="submit"
					disabled={mutation.isLoading}
					className="border bg-blue-500 text-white p-2 font-bold"
				>
					{mutation.isLoading ? "Loading" : "Submit"}
				</button>
			</form>
			<Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
				{/* <MyMapComponent center={center} zoom={zoom} /> */}
				<Map
					center={center}
					onClick={onClick}
					onIdle={onIdle}
					zoom={zoom}
					style={{ flexGrow: "1", height: "400px" }}
				>
					{clicks.map((latLng, i) => (
						<Marker key={i} position={latLng} />
					))}
				</Map>
				{/* style={{ height: "400px" }} */}
			</Wrapper>
		</>
	);
};

export default ListingCreator;
