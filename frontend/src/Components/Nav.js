import { useState, useEffect } from "react";
import "../Styles/App.css";
import "../Styles/BreakPoints.css";
import { Link } from "react-router-dom";
import searchlogo from '../ImagesIcons/search.png';
import { authenticationService } from '../Helpers/authentication.service.js';

function Nav() {
	const [currentUser, setCurrentUser] = useState(authenticationService.currentUserValue);

	useEffect(() => {
		const sub = authenticationService.currentUser.subscribe(setCurrentUser);
		return () => sub.unsubscribe();
	}, []);

	const handleLogout = () => {
		authenticationService.logout();
	};

	return (
		<div className="navContainer">
			<div className="flexb center">
				<div className="logo"></div>
				<nav className="Nav" style={{ display: "flex", alignItems: "center" }}>
					<Link className="searchLogoBtn" to="/Search">
						<img className="searchLogo" src={searchlogo} alt="Search" />Search
					</Link>
					{currentUser && (
						<button
							className="button"
							style={{
								width: "auto",
								padding: "0.25rem 0.75rem",
								marginLeft: "1rem",
								backgroundColor: "rgba(0, 0, 0, 0.4)",
								borderRadius: "4px"
							}}
							onClick={handleLogout}>
							Log Out
						</button>
					)}
				</nav>
			</div>
		</div>
	);
}
export default Nav;
