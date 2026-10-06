import "../Styles/App.css";
import "../Styles/BreakPoints.css";
import Note from "./Note";
export default function ParkSlides(props) {
	// console.log(props);
	if (props.selected) {
		return (
			<div className="parkSlide flexb col selected">
				<div>
					<h3>{props.name}</h3>
				</div>
				<div><b>Hours:</b> {props.hours}</div>
				<b>Features:</b>
				<ul className="features">
					{props.fids?.map((fid, index) => {
						return (
							<li key={index}>{fid}</li>
						)
					})}
				</ul>
				<b>Notes:</b>
				<Note park={props.pid} />
			</div>
		);
	} else {
		return (
			<button
				className="parkSlide flexb col"
				onClick={() => props.setSelected(props.sortie)}>
				<div>
					<h3>{props.name}</h3>
				</div>
				<div><b>Hours:</b> {props.hours}</div>
			</button>
		);
	}
}
