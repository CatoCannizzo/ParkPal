import SearchName from "./Components/SearchName";
import SearchFeature from "./Components/SearchFeature";

import { useState, useEffect } from "react";
import { Modal } from "./Components/Modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./Styles/App.css";
import "./Styles/BreakPoints.css";

function Search() {
	//variable for buttons to change which controlles which search type is shown
	const [searchType, setSearchType] = useState("text");
	//String that the warning modal shows | If this is set to any nonempty string the modal pops up
	const [warning, setWarning] = useState("");
	//Search Data that is passed to searchResult
	const [searchResults, setSearchResults] = useState({
		//Which park should be highlighted first
		selected: 0,
		//array of other parks to show
		searchResults: [],
	});
	//from router package that sends data to Search Result
	let navigate = useNavigate();
	const [allParks, setAllParks] = useState([]);
	const [allFeatures, setAllFeatures] = useState([]);

	//Onload gets a list off all the parks from the backend
	useEffect(() => {
		axios.get("/parks").then(function (response) {
			// console.log("pure response", response.data);
			setAllParks(response.data);
		});
		axios.get("/features").then(function (response) {
			// console.log("pure response", response.data);
			setAllFeatures(response.data);
		});
	}, []);

	//This block decides what search type to show | Defaults to Name based search
	let searcher;
	if (searchType === "features") {
		searcher = (
			<div>
				<SearchFeature
					allFeatures={allFeatures}
					allParks={allParks}
					setSearchResults={setSearchResults}
					setWarning={setWarning}
				/>
			</div>
		);
	} else if (searchType === "az") {
		searcher = (
			<div style={{ color: "white" }}>
				Underconstruction, please try again later.
			</div>
		);
	} else {
		searcher = (
			<div>
				<SearchName
					allFeatures={allFeatures}
					allParks={allParks}
					setSearchResults={setSearchResults}
					setWarning={setWarning}
				/>
			</div>
		);
	}

	//Checks to see if user searched, if so sends user to SearchResult with search
	useEffect(() => {
		if (searchResults.searchResults.length > 0) {
			navigate("/SearchResult", { state: searchResults });
		}
	}, [searchResults, navigate]);

	return (
		<div className="flexb col">
			<div id="portal"></div>
			{warning.length > 1 && (
				<Modal warning={warning} setWarning={setWarning} />
			)}
			<div className="search">
				<div className="flexb col center">
					<div>
						<h1>Find a Park</h1>
					</div>
					<div className="flexb">
						<div className="spacer">
							<p>by</p>
						</div>
						<button
							className="button searchType"
							onClick={() => setSearchType("text")}>
							Name
						</button>
						<button
							className="button searchType"
							onClick={() => setSearchType("features")}>
							Features
						</button>
						<button
							className="button searchType"
							onClick={() => setSearchType("az")}>
							{" "}
							A to Z
						</button>
					</div>
					<div>{searcher}</div>
				</div>
			</div>
			{/* <div className="parkWeek">Park of the week</div> */}
		</div>
	);
}
export default Search;
