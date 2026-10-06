import { useEffect, useRef, useMemo, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import "../Styles/BreakPoints.css";
import "../Styles/App.css";

export default function ParkMap(props) {
	const mapRef = useRef();

	const selectedPark = props.parks && props.parks[props.selected] ? props.parks[props.selected] : props.parks?.[0];

	const center = useMemo(
		() => ({
			lat: selectedPark?.lat || 47.6062,
			lng: selectedPark?.lon || -122.3321,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const options = useMemo(
		() => ({
			disableDefaultUI: true,
			clickableIcons: false,
			mapId: "25ac3acdfb42c68c",
		}),
		[]
	);

	useEffect(() => {
		if (selectedPark && selectedPark.lat && selectedPark.lon) {
			mapRef.current?.panTo({
				lat: selectedPark.lat,
				lng: selectedPark.lon,
			});
		}
	}, [selectedPark]);

	const onLoad = useCallback((map) => (mapRef.current = map), []);

	return (
		<GoogleMap
			zoom={12}
			center={center}
			mapContainerClassName="mapContainer"
			options={options}
			onLoad={onLoad}>
			{props.parks?.map((park, i) => (
				<Marker
					key={park.pid || i}
					position={{ lat: park.lat, lng: park.lon }}
					onClick={() => {
						props.setSelected(i);
					}}
				/>
			))}
		</GoogleMap>
	);
}
