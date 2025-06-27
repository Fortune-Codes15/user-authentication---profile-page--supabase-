// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // Make sure this path is correct
import Auth from "./Auth";
import Account from "./Account";

function App() {
	const [session, setSession] = useState(null);

	useEffect(() => {
		// This listener is crucial for managing the user's session state.
		// It updates 'session' whenever the auth state changes (login, logout, token refresh).
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);
		});

		// Clean up the subscription when the component unmounts
		return () => subscription.unsubscribe();
	}, []); // Empty dependency array means this runs once on mount

	return (
		<div>
			{/* Conditionally render Auth or Account component based on session */}
			{!session ? (
				<Auth />
			) : (
				<Account key={session.user.id} session={session} />
			)}
		</div>
	);
}

export default App;
