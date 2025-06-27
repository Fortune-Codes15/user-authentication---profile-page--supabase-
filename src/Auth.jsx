// src/Auth.js
import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

function Auth() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState(""); // For user feedback

	const handleLogin = async (e) => {
		e.preventDefault();

		setLoading(true);
		setMessage(""); // Clear previous messages

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setMessage(error.message);
		}

		setLoading(false);
	};

	const handleSignup = async (e) => {
		e.preventDefault();

		setLoading(true);
		setMessage(""); // Clear previous messages

		const { data, error } = await supabase.auth.signUp({ email, password });

		if (error) {
			setMessage(error.message);
		} else if (data.user) {
			setMessage("Check your email for the confirmation link!");
			// Supabase by default sends a confirmation email.
			// After confirmation, the user will be authenticated.
		} else {
			setMessage(
				"Sign up successful! Please check your email for verification.",
			);
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Sign In or Sign Up
				</h2>
				<form className="mt-8 space-y-6" onSubmit={handleLogin}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">
								Email address
							</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							disabled={loading}>
							{loading ? "Loading..." : "Sign In"}
						</button>
					</div>
					<p className="text-center text-sm">
						Don't have an account?{" "}
						<button
							type="button"
							onClick={handleSignup}
							className="font-medium text-indigo-600 hover:text-indigo-500"
							disabled={loading}>
							Sign Up
						</button>
					</p>
					{message && (
						<p className="mt-2 text-center text-sm text-red-600">{message}</p>
					)}
				</form>
			</div>
		</div>
	);
}

export default Auth;
