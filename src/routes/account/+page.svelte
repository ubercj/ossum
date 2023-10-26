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

	/**
	 * @typedef {object} Contribution
	 *
	 * @property {string} title
	 * @property {string} description
	 * @property {string} opened_date
	 * @property {string} [closed_date]
	 * @property {string} [url]
	 * @property {string[]} [tags]
	 */

	/**
	 * @type {Contribution[]}
	 */
	let contributions;

	/**
	 * @type {Contribution}
	 */
	let newContribution = {
		title: '',
		description: '',
		opened_date: '',
		closed_date: '',
		url: '',
		tags: []
	};

	/**
	 * @type {HTMLElement}
	 */
	let drawer;

	onMount(() => {
		getProfile();
		drawer.addEventListener('sl-request-close', closeDrawer);

		return () => {
			drawer.removeEventListener('sl-request-close', closeDrawer);
		};
	});

	// This is a dumb workaround but it's necessary because of shoelace wonkiness
	const closeDrawer = () => {
		drawerOpen = false;
	};

	const getProfile = async () => {
		// First, grab data from Github profile if it exists
		if (isGithub && data.session?.provider_token) {
			githubUserData = await getUser(data.session.provider_token);

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
			const { data: contributionData, error: contributionError } = await getContributions(user.id);

			if (error && status !== 406) throw error;
			if (contributionError) throw contributionError;

			if (data) {
				currentProfile = {
					username: currentProfile.username || data.username,
					shirt_size: data.shirt_size,
					website: currentProfile.website || data.website,
					avatar_url: currentProfile.avatar_url || data.avatar_url
				};
			}

			if (contributionData) {
				contributions = contributionData;
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

	/**
	 * @param {string} userId
	 */
	const getContributions = async (userId) => {
		return await supabase
			.from('contributions')
			.select('title, description, url, opened_date, closed_date, tags')
			.eq('user_id', userId);
	};

	const createContribution = async () => {
		const { error } = await supabase.from('contributions').insert(newContribution);

		if (error) {
			console.error(error);
		} else {
			newContribution = {
				title: '',
				description: '',
				opened_date: '',
				closed_date: '',
				url: '',
				tags: []
			};
			drawerOpen = false;
		}
	};

	let drawerOpen = false;
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
			<div class="contributions-heading">
				<h3>Contributions</h3>
				<sl-button on:click={() => (drawerOpen = true)}>Add New</sl-button>
			</div>
			{#if contributions}
				<p>Total: {contributions.length}</p>
				<ul class="response">
					{#each contributions as contribution}
						<li>
							<sl-card>
								<div slot="header">
									<h3>{contribution.title}</h3>
									<p>{contribution.description}</p>
								</div>
								<p>Opened: {contribution.opened_date}</p>
								<p>Closed: {contribution.closed_date || 'Still open'}</p>
								{#if contribution.url}
									<p>Link: <a href={contribution.url}>{contribution.url}</a></p>
								{/if}
								{#if contribution.tags}
									<h4>Tags</h4>
									<ul>
										{#each contribution.tags as tag}
											<li>{tag}</li>
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

	<sl-drawer bind:this={drawer} label="New Contribution" id="contribution-drawer" open={drawerOpen}>
		<form class="form-widget" on:submit|preventDefault={createContribution}>
			<sl-input
				id="contribution-title"
				label="Title"
				type="text"
				value={newContribution.title}
				on:sl-input={(e) => (newContribution.title = e.target.value)}
			/>
			<sl-input
				id="contribution-description"
				label="Description"
				type="text"
				value={newContribution.description}
				on:sl-input={(e) => (newContribution.description = e.target.value)}
			/>
			<sl-input
				id="contribution-opened"
				label="Opened"
				type="date"
				value={newContribution.opened_date}
				on:sl-input={(e) => (newContribution.opened_date = e.target.value)}
			/>
			<sl-input
				id="contribution-closed"
				label="Closed"
				type="date"
				value={newContribution.closed_date}
				on:sl-input={(e) => (newContribution.closed_date = e.target.value)}
			/>
			<sl-input
				id="contribution-url"
				label="Link"
				type="text"
				value={newContribution.url}
				on:sl-input={(e) => (newContribution.url = e.target.value)}
			/>
			<sl-button type="submit">Submit</sl-button>
		</form>
	</sl-drawer>
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

	.contributions-heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	sl-drawer {
		--size: 50vw;
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
