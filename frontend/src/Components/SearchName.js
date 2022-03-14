import { useState } from "react";

export default function SearchName(props) {
	// console.log(props);
	const [suggestions, setSuggestions] = useState([]);
	const [text, setText] = useState("");

	function send(index) {
		if (suggestions.length > 0) {
			props.setSearchResults({
				selected: index,
				searchResults: suggestions,
			});
		} else
			try {
				props.allParks.map((park) => {
					if (park.name == text) {
						// console.log("foundmyself");
						props.setSearchResults({
							selected: 0,
							searchResults: park,
						});
					}
				});
			} catch {
				props.setWarning(`Could not find park with name "${text}"`);
			}
	}
	function onKeyPress(e) {
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
				onKeyPress={onKeyPress}
				onBlur={() => {
					setTimeout(() => {
						setSuggestions([]);
					}, 500);
				}}
			/>
			<button className="button enter" onClick={() => send()}>
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
