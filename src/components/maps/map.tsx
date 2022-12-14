import { isLatLngLiteral } from "@googlemaps/typescript-guards";
import { createCustomEqual, deepEqual } from "fast-equals";
import React, { useEffect, useRef, useState } from "react";

interface MapProps extends google.maps.MapOptions {
	style?: { [key: string]: string };
	onClick?: (e: google.maps.MapMouseEvent) => void;
	onIdle?: (map: google.maps.Map) => void;
	children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
	style,
	children,
	onClick,
	onIdle,
	...options
}) => {
	const [map, setMap] = useState<google.maps.Map>();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current && !map) {
			setMap(new window.google.maps.Map(ref.current, {}));
		}
	}, [ref, map]);

	useDeepCompareEffectForMaps(() => {
		if (map) {
			map.setOptions(options);
		}
	}, [map, options]);

	React.useEffect(() => {
		if (map) {
			["click", "idle"].forEach((eventName) =>
				google.maps.event.clearListeners(map, eventName)
			);

			if (onClick) {
				map.addListener("click", onClick);
			}

			if (onIdle) {
				map.addListener("idle", () => onIdle(map));
			}
		}
	}, [map, onClick, onIdle]);
	// [END maps_react_map_component_event_hooks]

	// [START maps_react_map_component_return]
	return (
		<>
			<div ref={ref} style={style} />
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					// set the map prop on the child component
					return React.cloneElement(child, { map } as any);
				}
			})}
		</>
	);
};

const deepCompareEqualsForMaps = createCustomEqual(() => ({
	areObjectsEqual: (a, b) => {
		if (
			isLatLngLiteral(a) ||
			a instanceof google.maps.LatLng ||
			isLatLngLiteral(b) ||
			b instanceof google.maps.LatLng
		) {
			return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
		}

		return deepEqual(a, b);
	},
}));

function useDeepCompareMemoize(value: any) {
	const ref = React.useRef();

	if (!deepCompareEqualsForMaps(value, ref.current)) {
		ref.current = value;
	}

	return ref.current;
}

function useDeepCompareEffectForMaps(
	callback: React.EffectCallback,
	dependencies: any[]
) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export default Map;
