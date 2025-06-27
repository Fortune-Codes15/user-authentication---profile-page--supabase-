// src/Account.js
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function Account({ session }) {
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState(null);
	const [avatarUrl, setAvatarUrl] = useState(null);
	const [message, setMessage] = useState("");
	const [uploading, setUploading] = useState(false);

	// Fetch profile data when the session changes or component mounts
	useEffect(() => {
		let ignore = false;
		async function getProfile() {
			setLoading(true);
			const { user } = session;

			const { data, error } = await supabase
				.from("profiles")
				.select(`username, avatar_url`)
				.eq("user_id", user.id)
				.single();

			if (!ignore) {
				if (error) {
					if (error.code === "PGRST116") {
						console.log("No profile found, creating a new one.");
						await createProfileForNewUser(user.id, user.email);
						setUsername(user.email.split("@")[0]);
						setAvatarUrl(null);
					} else {
						console.warn(error.message);
						setMessage(`Error loading profile: ${error.message}`);
					}
				} else if (data) {
					setUsername(data.username);
					setAvatarUrl(data.avatar_url);
				}
				setLoading(false);
			}
		}

		// Function to create a profile for a new user if it doesn't exist
		async function createProfileForNewUser(userId, userEmail) {
			setLoading(true);
			const { error } = await supabase.from("profiles").insert([
				{
					user_id: userId,
					username: userEmail.split("@")[0],
					avatar_url: null,
				},
			]);
			if (error) {
				console.error("Error creating profile:", error.message);
				setMessage(`Error creating profile: ${error.message}`);
			} else {
				setMessage("Profile created automatically!");
			}
			setLoading(false);
		}

		if (session) {
			getProfile();
		}

		return () => {
			ignore = true;
		};
	}, [session]);

	async function updateProfile(event) {
		event.preventDefault();

		setLoading(true);
		setMessage("");
		const { user } = session;

		const updates = {
			user_id: user.id,
			username,
			avatar_url: avatarUrl,
			updated_at: new Date().toISOString(),
		};

		const { error } = await supabase
			.from("profiles")
			.upsert(updates, { onConflict: "user_id" });

		if (error) {
			setMessage(`Error updating profile: ${error.message}`);
		} else {
			setMessage("Profile updated!");
		}
		setLoading(false);
	}

	async function uploadAvatar(event) {
		if (!event.target.files || event.target.files.length === 0) {
			setMessage("You must select an image to upload.");
			return;
		}

		setUploading(true);
		setMessage("");
		const file = event.target.files[0];
		const fileExt = file.name.split(".").pop();
		const filePath = `${session.user.id}/${Math.random()}.${fileExt}`;

		try {
			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: true,
				});

			if (uploadError) {
				throw uploadError;
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from("avatars").getPublicUrl(filePath);
			const { error: updateError } = await supabase
				.from("profiles")
				.update({ avatar_url: publicUrl })
				.eq("user_id", session.user.id);

			if (updateError) {
				throw updateError;
			}

			setAvatarUrl(publicUrl);
			setMessage("Avatar uploaded and profile updated!");
		} catch (error) {
			setMessage(`Error uploading avatar: ${error.message}`);
			console.error("Error uploading avatar:", error);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Your Profile
				</h2>
				{/* Adjusted loading check to distinguish initial data fetch vs subsequent updates */}
				{loading && !username ? (
					<p className="text-center text-gray-600">Loading profile...</p>
				) : (
					<form onSubmit={updateProfile} className="mt-8 space-y-6">
						{/* Avatar Section */}
						<div className="flex flex-col items-center gap-4">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt="Avatar"
									className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-md"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium border-2 border-indigo-300">
									No Avatar
								</div>
							)}
							<label
								htmlFor="single"
								className="block w-full text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
								{uploading ? "Uploading..." : "Upload Avatar"}
								<input
									className="sr-only"
									type="file"
									id="single"
									accept="image/*"
									onChange={uploadAvatar}
									disabled={uploading}
								/>
							</label>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700">
								Email
							</label>
							<input
								id="email"
								type="text"
								value={session.user.email}
								disabled
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>

						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700">
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username || ""}
								onChange={(e) => setUsername(e.target.value)}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>

						<div>
							<button
								type="submit"
								className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								disabled={loading || uploading}>
								{loading ? "Updating..." : "Update Username"}
							</button>
						</div>

						<div>
							<button
								type="button"
								className="mt-3 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 "
								onClick={() => supabase.auth.signOut()}
								disabled={loading || uploading}>
								Sign Out
							</button>
						</div>
						{message && (
							<p className="mt-2 text-center text-sm text-gray-600">
								{message}
							</p>
						)}
					</form>
				)}
			</div>
		</div>
	);
}

export default Account;
