<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { title } from '$lib/stores/title';
	import { goto } from '$app/navigation';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
	$: user = data.session?.user;

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
		pull_requests: undefined,
		website: '',
		avatar_url: ''
	};

	/**
	 * @param {string} userId
	 */
	export const getUserProfile = async (userId) => {
		return await supabase
			.from('profiles')
			.select('username, website, avatar_url, shirt_size, pull_requests')
			.eq('id', userId)
			.single();
	};

	/**
	 * @param {string} userId
	 * @param {Profile} updates
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

	onMount(() => {
		getProfile();
	});

	const getProfile = async () => {
		try {
			loading = true;
			const { data, error, status } = await getUserProfile(user.id);

			if (error && status !== 406) throw error;

			if (data) {
				currentProfile = {
					username: data.username,
					shirt_size: data.shirt_size,
					pull_requests: data.pull_requests,
					website: data.website,
					avatar_url: data.avatar_url
				};
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

			let { error } = await updateUserProfile(user.id, currentProfile);
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

	const signOut = async () => {
		await supabase.auth.signOut();
		goto('/');
	};

	$: if (currentProfile.avatar_url) downloadImage(currentProfile.avatar_url);
</script>

<section class="user-account">
	<h2>Your Profile</h2>
	<form on:submit|preventDefault={updateProfile} class="form-widget">
		<Avatar
			bind:avatarUrl={currentProfile.avatar_url}
			{imageUrl}
			{files}
			{loading}
			on:upload={uploadAvatar}
		/>
		<sl-input id="email" label="Email" type="text" value={user?.email} disabled />
		<sl-input
			id="username"
			label="Name"
			type="text"
			value={currentProfile.username}
			on:sl-input={(e) => (currentProfile.username = e.target.value)}
		/>
		<!-- TODO - use #await ... :then block?  -->
		{#if currentProfile.shirt_size}
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
		{/if}
		<sl-input
			id="pullRequests"
			label="Pull Requests"
			type="number"
			value={currentProfile.pull_requests}
			on:sl-input={(e) => (currentProfile.pull_requests = e.target.value)}
		/>
		<sl-input
			id="website"
			label="Website"
			type="text"
			value={currentProfile.website}
			on:sl-input={(e) => (currentProfile.website = e.target.value)}
		/>
		<sl-button type="submit" class="update" aria-live="polite" {loading}>
			<span>Update Profile</span>
		</sl-button>
		<sl-button type="button" variant="warning" aria-live="polite" on:click={signOut}>
			<span>Sign Out</span>
		</sl-button>
	</form>
</section>

<style>
	.user-account {
		flex: 1;
		padding: 2rem;
	}

	.form-widget {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		max-width: 640px;
		margin: auto;
	}

	sl-input::part(form-control-label) {
		margin-bottom: 0.5rem;
	}
</style>
