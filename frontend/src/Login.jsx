import "./Styles/App.css";
import "./Styles/BreakPoints.css";
import { useState } from "react";
import { authenticationService } from "./Helpers/authentication.service.js";
import { Link, useNavigate } from "react-router-dom";
// import { timeInterval } from "rxjs";

function Login() {
	const [user, setUser] = useState("");
	const [pass, setPass] = useState("");
	const [err, setErr] = useState("");
	let navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();
		authenticationService.login(user, pass).then(
			(user) => {
				navigate("/");
			},
			(error) => {
				setErr(error);
				console.log(error);
			}
		);
	};

	return (
		<div className="authContainer flexb col">
			<form className="authBox" onSubmit={handleSubmit}>
				<label htmlFor="username">Username:</label>
				<input
					value={user}
					onChange={(e) => setUser(e.target.value)}
					type="text"
					id="username"
					name="username"></input>
				<label htmlFor="password">Password:</label>
				<input
					value={pass}
					onChange={(e) => setPass(e.target.value)}
					type="password"
					id="password"
					name="password"></input>
				<div style={{ color: "#0e0182" }}>{err}</div>
				<div>
					<input
						className="authButton"
						type="submit"
						value="Log In"></input>
					<Link
						to="/signup"
						style={{ color: "white", paddingLeft: "0.25rem" }}>
						Or Sign Up
					</Link>
				</div>
			</form>
		</div>
	);
}
export default Login;
