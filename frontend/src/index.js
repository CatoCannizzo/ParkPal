import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./Components/Nav";
import ParkPage from "./ParkPage";
import Search from "./Search";
import SearchResult from "./SearchResult";
import Login from "./Login";
import SignUp from "./SignUp";
import reportWebVitals from "./reportWebVitals";
import PrivateRoute from "./Components/PrivateRoute";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<BrowserRouter>
		<Nav />
		<Routes>
			<Route
				path="/"
				element={
					<PrivateRoute>
						<Search />
					</PrivateRoute>
				}
			/>
			<Route
				path="/ParkPage"
				element={
					<PrivateRoute>
						<ParkPage />
					</PrivateRoute>
				}
			/>
			<Route
				path="/Search"
				element={
					<PrivateRoute>
						<Search />
					</PrivateRoute>
				}
			/>
			<Route
				path="/SearchResult"
				element={
					<PrivateRoute>
						<SearchResult />
					</PrivateRoute>
				}
			/>
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<SignUp />} />
		</Routes>
	</BrowserRouter>
);

reportWebVitals();
