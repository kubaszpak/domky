import React, { useEffect, useRef, useState } from "react";

interface MapProps extends google.maps.MapOptions {
	style?: { [key: string]: string };
	onClick?: (e: google.maps.MapMouseEvent) => void;
	onIdle?: (map: google.maps.Map) => void;
	children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({ style, children, ...options }) => {
	const [map, setMap] = useState<google.maps.Map>();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current && !map) {
			setMap(new window.google.maps.Map(ref.current, {}));
		}
	}, [ref, map]);

	return <div ref={ref} style={style} />;
};

export default Map;
