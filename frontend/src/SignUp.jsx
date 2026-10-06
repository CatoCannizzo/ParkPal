import "./Styles/App.css";
import "./Styles/BreakPoints.css";
import axios from "axios";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';

function SignUp() {
	const [user, setUser] = useState("");
	const [pass, setPass] = useState("");
	const [confirm, setConfirm] = useState("");
	const [ishuman, setIshuman] = useState(null);
	const [err, setErr] = useState("");
	const captchaRef = useRef(null);
	let navigate = useNavigate();

	const onLoad = () => {
		if (captchaRef.current) {
			captchaRef.current.execute();
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (pass === confirm) {
			// In development mode, allow proceeding if captcha is not configured or bypassed
			const canProceed = ishuman || process.env.NODE_ENV === "development";
			if (canProceed) {
				axios({
					method: "post",
					url: "/auth_register",
					data: {
						username: user,
						password: pass,
					},
				})
					.then(function (response) {
						navigate('/login');
					})
					.catch(function (err) {
						if (err.response && err.response.status === 409) {
							setErr("Username already taken");
						} else {
							setErr(err.response?.data?.["msg"] || "Registration failed");
						}
					});
			} else {
				setErr("Please complete the verification to continue");
			}
		} else {
			setErr("Your passwords do not match");
		}
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
					name="username"
					required></input>
				<label htmlFor="password">Password:</label>
				<input
					value={pass}
					onChange={(e) => setPass(e.target.value)}
					type="password"
					id="password"
					name="password"
					required></input>
				<label htmlFor="confirm">Confirm Password:</label>
				<div className="pwCheck">
					<input
						style={{marginRight: "0.5rem", marginBottom: "0.5rem"}}
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						type="password"
						id="confirm"
						name="confirm"
						required></input>
					{pass && confirm && (pass === confirm ? <div className="pwCheck">✅</div> : <div className="pwCheck">❌</div>)}
				</div>
				{ishuman === null && 
				<HCaptcha
					sitekey="04c36887-2836-4c0d-8467-9c13577fd631"
					onLoad={onLoad}
					onVerify={setIshuman}
					ref={captchaRef}
				/>}
				<div style={{color:"#ff96fb"}}>{err}</div>
				<div>
					<input className="authButton" id="signUp" type="submit" value="Sign Up"></input>
					<Link to="/login" style={{color: "white", paddingLeft: "0.25rem"}}>Or Log In</Link>
				</div>
			</form>
		</div>
	);
}
export default SignUp;
