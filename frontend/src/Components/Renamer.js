//reads in array of matched parks, and array of all features
export default function Renamer(matchedParks, featuresList = []) {
	if (!Array.isArray(matchedParks)) {
		matchedParks = matchedParks ? [matchedParks] : [];
	}
	const featureMap = new Map();
	if (Array.isArray(featuresList)) {
		featuresList.forEach((f) => {
			featureMap.set(Number(f.fid), f.name);
		});
	}

	return matchedParks.map((park) => {
		const newPark = { ...park, fids: [...(park.fids || [])] };
		const seen = new Set();
		const mappedFids = [];

		newPark.fids.forEach((fid) => {
			let name =
				typeof fid === "number" || (!isNaN(Number(fid)) && fid !== "")
					? featureMap.get(Number(fid)) || fid
					: fid;

			if (name && !seen.has(name)) {
				seen.add(name);
				mappedFids.push(name);
			}
		});

		newPark.fids = mappedFids;
		return newPark;
	});
}
