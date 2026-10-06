//other Components
import GMap from "./Components/GMap";
import ListResult from "./Components/ListResult";
//libraries & functions
import { useLoadScript } from "@react-google-maps/api";
import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
//styles
import "./Styles/App.css";
import "./Styles/BreakPoints.css";

export default function SearchResult() {
	const [data, setData] = useState([]);
	const [selected, setSelected] = useState(0);

	const location = useLocation();
	console.log("raw data passed in search", location.state);

	const searchData = React.useMemo(() => location.state?.searchResults || [], [location.state]);
	const searchSel = location.state?.selected || 0;

	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
	});

	console.log("transformed data", searchData);

	useEffect(() => {
		setData(searchData);
		setSelected(searchSel);
	}, [searchData, searchSel]);

	if (!isLoaded)
		return (
			<div className="flexb col">
				<div className="flexb center">loading...</div>
			</div>
		);
	else if (data.length === 0)
		return (
			<div className="flexb col">
				<div className="flexb center">
					Didn't find any results. Sorry :(
				</div>
			</div>
		);
	return (
		<div className="flexb col">
			<div className="results flexb center">
				<div> Park Pal found {data.length} parks!</div>
				{/* <button className="button filter">Filter</button> */}
			</div>
			<div className="flexb split">
				<div className="splitchild one">
					<GMap
						parks={[...data]}
						selected={selected}
						setSelected={setSelected}
					/>
				</div>
				<div className="splitchild two">
					<ListResult
						parks={[...data]}
						selected={selected}
						setSelected={setSelected}
					/>
				</div>
			</div>
		</div>
	);
}
