import "../Styles/App.css";
import "../Styles/BreakPoints.css";
import ParkSlides from "./ParkSlides";

export default function ListResult(props) {
	return (
		<div className="listResult flexb col">
			<div>
				<h2>Search Results</h2>
			</div>
			{props.parks?.map((park, index) => {
				return (
					<ParkSlides
						key={park.pid || index}
						sortie={index}
						{...park}
						selected={index === props.selected}
						setSelected={props.setSelected}
					/>
				);
			})}
		</div>
	);
}
