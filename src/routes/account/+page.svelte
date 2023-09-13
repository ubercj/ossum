<script>
	import { onMount } from 'svelte';
	import { title } from '$lib/stores/title';
	import { getIssues, getUser } from '$lib/octokit';
	import { goto } from '$app/navigation';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
	$: user = data.session?.user;
	$: isGithub = user?.app_metadata.provider === 'github';
	$: if (!isGithub && currentProfile.avatar_url) downloadImage(currentProfile.avatar_url);

	$title = 'Account';

	/**
	 * @type {string}
	 */
	let imageUrl;

	/**
	 * @type {Profile}
	 */
	let currentProfile = {
		username: '',
		shirt_size: undefined,
		website: '',
		avatar_url: ''
	};

	/**
	 * @param {string} userId
	 */
	export const getUserProfile = async (userId) => {
		return await supabase
			.from('profiles')
			.select('username, website, avatar_url, shirt_size')
			.eq('id', userId)
			.single();
	};

	/**
	 * @param {string} userId
	 * @param {Partial<Profile>} updates
	 */
	export const updateUserProfile = async (userId, updates) => {
		return await supabase
			.from('profiles')
			.upsert({ id: userId, updated_at: new Date().toISOString(), ...updates });
	};

	let loading = false;
	let allShirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

	/**
	 * @type {FileList}
	 */
	let files;

	let githubUserData;
	let githubIssueData;

	onMount(() => {
		getProfile();
	});

	const getProfile = async () => {
		// First, grab data from Github
		if (isGithub && data.session?.provider_token) {
			githubUserData = await getUser(data.session.provider_token);
			githubIssueData = await getIssues(data.session.provider_token, githubUserData.login);

			currentProfile = {
				username: githubUserData.name,
				website: githubUserData.html_url,
				avatar_url: githubUserData.avatar_url
			};
		}

		// Second, grab remaining data from Supabase
		try {
			loading = true;

			if (!user?.id) {
				throw new Error('user id is undefined');
			}

			const { data, error, status } = await getUserProfile(user.id);

			if (error && status !== 406) throw error;

			if (data) {
				currentProfile = {
					username: currentProfile.username || data.username,
					shirt_size: data.shirt_size,
					website: currentProfile.website || data.website,
					avatar_url: currentProfile.avatar_url || data.avatar_url
				};
			}
		} catch (error) {
			if (error instanceof Error) {
				console.error(error.message);
			}
		} finally {
			loading = false;
		}
	};

	/**
	 * @param {string} path
	 */
	const downloadImage = async (path) => {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path);

			if (error) {
				throw error;
			}

			const url = URL.createObjectURL(data);
			imageUrl = url;
		} catch (error) {
			if (error instanceof Error) {
				console.log('Error downloading image: ', error.message);
			}
		}
	};

	const uploadAvatar = async () => {
		try {
			loading = true;

			if (!files || files.length === 0) {
				throw new Error('You must select an image to upload.');
			}

			const file = files[0];
			const fileExt = file.name.split('.').pop();
			const filePath = `${Math.random()}.${fileExt}`;

			let { error } = await supabase.storage.from('avatars').upload(filePath, file);

			if (error) {
				throw error;
			}

			currentProfile.avatar_url = filePath;
			updateProfile();
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

	const updateProfile = async () => {
		try {
			loading = true;

			if (!user?.id) {
				throw new Error('user id is undefined');
			}

			const newProfile = isGithub ? { shirt_size: currentProfile.shirt_size } : currentProfile;

			let { error } = await updateUserProfile(user.id, newProfile);

			if (error) {
				throw error;
			}
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};
</script>

<div class="profile">
	<section class="user-account">
		<h2>Your Profile</h2>
		<form on:submit|preventDefault={updateProfile} class="form-widget">
			<div class="avatar">
				<sl-avatar shape="rounded" image={isGithub ? currentProfile.avatar_url : imageUrl} />
				<!-- TODO: This is NOT accessible to screen readers -->
				{#if !isGithub}
					<label class="upload" for="profile-pic">
						<sl-button>Upload Avatar</sl-button>
					</label>
					<input
						class="visually-hidden"
						aria-label="Upload avatar"
						type="file"
						id="profile-pic"
						accept="image/*"
						bind:files
						on:change={uploadAvatar}
						disabled={loading}
					/>
				{/if}
			</div>
			<sl-input id="email" label="Email" type="text" value={user?.email} disabled />
			<sl-input
				id="username"
				label="Name"
				type="text"
				value={currentProfile.username}
				on:sl-input={(e) => (currentProfile.username = e.target.value)}
				disabled={isGithub}
			/>
			<sl-select
				label="Shirt Size"
				value={currentProfile.shirt_size}
				placeholder="Select a Size"
				clearable
				on:sl-change={(e) => (currentProfile.shirt_size = e.target.value)}
			>
				{#each allShirtSizes as singleShirtSize}
					<sl-option value={singleShirtSize}>
						{singleShirtSize}
					</sl-option>
				{/each}
			</sl-select>
			<sl-input
				id="website"
				label="Website"
				type="text"
				value={currentProfile.website}
				on:sl-input={(e) => (currentProfile.website = e.target.value)}
				disabled
			/>
			<sl-button type="submit" class="update" aria-live="polite" {loading}>
				<span>Update Profile</span>
			</sl-button>
		</form>
	</section>

	<section class="metrics">
		<h2>Metrics</h2>
		<div>
			<h3>Pull Requests</h3>
			{#if githubIssueData}
				<p>Total: {githubIssueData.total_count}</p>
				<ul class="response">
					{#each githubIssueData.items as issue}
						<li>
							<sl-card>
								<div slot="header"><h3>{issue.title}</h3></div>
								<p>{issue.created_at}</p>
								<p>{issue.closed_at}</p>
								<p>{issue.state}</p>
								<p>{issue.url}</p>
								{#if issue.labels}
									<ul>
										{#each issue.labels as label}
											<li>{label}</li>
										{/each}
									</ul>
								{/if}
							</sl-card>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>
</div>

<style>
	.profile {
		display: grid;
		gap: 4rem;
	}

	sl-avatar {
		--size: var(--account-avatar-size);
		margin-bottom: 1rem;
	}

	.form-widget {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		margin: auto;
	}

	sl-input::part(form-control-label) {
		margin-bottom: 0.5rem;
	}

	.response {
		list-style: none;
		padding-left: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	sl-card {
		width: 100%;
	}

	.avatar sl-button {
		display: inline;
		z-index: -1;
	}

	label.upload {
		width: var(--account-avatar-size);
		display: block;
	}

	label.upload:hover {
		cursor: pointer;
	}

	label.upload:hover sl-button::part(base) {
		background-color: var(--sl-color-primary-50);
		border-color: var(--sl-color-primary-300);
		color: var(--sl-color-primary-700);
	}
</style>
