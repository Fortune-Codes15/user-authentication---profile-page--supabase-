// src/App.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import Account from "./Account";

function App() {
	const [session, setSession] = useState(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setSession(session);
		});
		return () => subscription.unsubscribe();
	}, []);

	return (
		<div>
			{!session ? (
				<Auth />
			) : (
				<Account key={session.user.id} session={session} />
			)}
		</div>
	);
}

export default App;
