import React from "react";
import { Noop } from "react-hook-form";
import usePlacesAutocomplete from "use-places-autocomplete";

interface AutocompleteProps {
	onChange: (...event: any[]) => void;
	onBlur: Noop;
	value: string;
	name: string;
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps
>((props, ref) => {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			types: ["(cities)"],
			bounds: new google.maps.LatLngBounds(
				new google.maps.LatLng(54.67863, 13.772219),
				new google.maps.LatLng(48.878539, 24.169497)
			),
		},
	});
	console.log(status);
	status === "OK" && console.log(data);

	return (
		<div>
			<label
				htmlFor="where"
				className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
			>
				Where
			</label>
			<input
				disabled={!ready}
				ref={ref}
				type="text"
				id="where"
				{...props}
				value={value}
				className="date-input border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				placeholder="Where"
				required
				onChange={(e) => {
					setValue(e.target.value);
					props.onChange(e.target.value);
				}}
				onBlur={props.onBlur}
			/>
		</div>
	);
});

Autocomplete.displayName = "Autocomplete";
export default Autocomplete;
