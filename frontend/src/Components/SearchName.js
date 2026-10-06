import { useState } from "react";

import Renamer from "./Renamer";

export default function SearchName(props) {
	//list of matched parks
	const [suggestions, setSuggestions] = useState([]);
	//text input of user
	const [text, setText] = useState("");

	function send(index = 0) {
		if (suggestions.length > 0) {
			let matches = Renamer([...suggestions], props.allFeatures);
			props.setSearchResults({
				selected: index || 0,
				searchResults: matches,
			});
		} else if (text.trim().length > 0) {
			const matched = props.allParks.filter((park) =>
				park.name.toLowerCase().includes(text.trim().toLowerCase())
			);
			if (matched.length > 0) {
				let matches = Renamer([...matched], props.allFeatures);
				props.setSearchResults({
					selected: 0,
					searchResults: matches,
				});
			} else {
				props.setWarning(`Could not find park with name "${text}"`);
			}
		} else {
			props.setWarning("Please enter a park name to search");
		}
	}
	function onKeyDown(e) {
		if (e.key === "Enter") {
			send();
		}
	}
	const onSuggestHandler = (name, i) => {
		setText(name);
		send(i);
	};
	const onChangeHandler = (text) => {
		let matches = [];

		if (text.length > 0) {
			matches = props.allParks.filter((prk) => {
				const regex = new RegExp(`^${text}`, "gi");
				return prk.name.match(regex);
			});
		}
		setSuggestions(matches);
		setText(text);
	};
	return (
		<div className="autocompleteContainer">
			<input
				className="searchBar"
				onChange={(e) => onChangeHandler(e.target.value)}
				value={text}
				placeholder="Ravenna Park"
				onKeyDown={onKeyDown}
				onBlur={() => {
					setTimeout(() => {
						setSuggestions([]);
					}, 500);
				}}
			/>
			<button className="button enter name" onClick={() => send()}>
				Search
			</button>
			{suggestions &&
				suggestions.slice(0, 7).map((suggestion, i) => (
					<div
						key={i}
						className="suggestion"
						onClick={() => onSuggestHandler(suggestion.name, i)}>
						{suggestion.name}
					</div>
				))}
		</div>
	);
}
