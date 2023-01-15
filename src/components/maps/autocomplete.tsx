import React from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

interface AutocompleteProps {
	onChange: (...event: any[]) => void;
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
	({ onChange }, ref) => {
		const {
			ready,
			value,
			suggestions: { status, data },
			setValue,
			clearSuggestions,
		} = usePlacesAutocomplete({
			requestOptions: {
				language: "pl",
				types: ["(cities)"],
				bounds: new google.maps.LatLngBounds(
					new google.maps.LatLng(54.67863, 13.772219),
					new google.maps.LatLng(48.878539, 24.169497)
				),
			},
		});

		const handleSelect = (
			e: React.MouseEvent<HTMLLIElement>,
			cityName: string
		) => {
			setValue(e.currentTarget.textContent!, false);
			onChange(cityName);
			clearSuggestions();
		};

		const clearRef = useOnclickOutside(() => {
			clearSuggestions();
		});

		return (
			<div ref={clearRef} className="relative">
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
					value={value}
					className="date-input inset-y-0 border border-[#BCBEC0] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Where"
					required
					autoComplete={"off"}
					onChange={(e) => {
						setValue(e.target.value);
						onChange(e.target.value);
					}}
				/>
				{status === "OK" && (
					<ul className="absolute border border-[#BCBEC0] py-1 rounded-lg w-4/5 z-50 bg-white">
						{data.map((city, idx) => {
							return (
								<li
									className="px-3 py-2 cursor-pointer hover:bg-gray-200 z-50"
									key={idx}
									onClick={(e) =>
										handleSelect(e, city.structured_formatting.main_text)
									}
								>
									{city.description}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		);
	}
);

Autocomplete.displayName = "Autocomplete";
export default Autocomplete;
