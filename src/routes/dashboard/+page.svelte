<script>
	import { onMount } from 'svelte';
	import { title } from '$lib/stores/title';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);
	$: user = data.session?.user;

	/**
	 * @param {string} userId
	 */
	export const getGroups = async (userId) => {
		return await supabase
			.from('groups')
			.select(
				`
          id,
          name,
          group_profile!inner (
            id
          )
        `
			)
			.eq('group_profile.profile_id', userId);
	};

	/**
	 * @param {number} groupId
	 */
	export const getProfilesForGroup = async (groupId) => {
		return await supabase
			.from('profiles')
			.select(
				`
          id,
          username,
           website,
           avatar_url,
           shirt_size,
           pull_requests,
           group_profile!inner (
            id,
            group_id
            )
          `
			)
			.eq('group_profile.group_id', groupId);
	};

	let loading = false;

	$title = 'Dashboard';

	/**
	 * @type {Group[]}
	 */
	let userGroups = [];

	/**
	 * @type {Group}
	 */
	let selectedGroup;

	/**
	 * @type {Profile[]}
	 */
	let profiles = [];

	onMount(() => {
		getDashboardData();
	});

	const getDashboardData = async () => {
		loading = true;
		try {
			const { data: groupData, error: groupError } = await getGroups(user.id);
			if (groupData) {
				userGroups = groupData;
				if (!selectedGroup) selectedGroup = groupData[0];
			}
			if (groupError) {
				throw new Error(`There was an error retrieving group data`);
			}

			const { data: groupProfiles, error: profilesError } = await getProfilesForGroup(
				selectedGroup.id
			);
			if (groupProfiles) {
				profiles = groupProfiles;
			}
			if (profilesError) {
				throw new Error(`There was an error retrieving profiles for ${selectedGroup.name}`);
			}
		} catch (error) {
			console.error(error);
			alert(error.message);
		} finally {
			loading = false;
		}
	};

	const handleGroupChange = (event) => {
		let currGroup = selectedGroup;
		selectedGroup = userGroups.find((group) => group.id === parseInt(event.target.value));

		// Re-render list of profiles when group changes
		if (selectedGroup.id !== currGroup.id) {
			getDashboardData();
		}
	};
</script>

<section class="dashboard">
	<header>
		<h1>{selectedGroup ? selectedGroup.name : 'Your'} Dashboard</h1>
		{#if userGroups.length}
			<sl-select
				value={selectedGroup.id}
				placeholder="Select a Group"
				on:sl-change={(e) => handleGroupChange(e)}
			>
				{#each userGroups as group}
					<sl-menu-item value={group.id}>{group.name}</sl-menu-item>
				{/each}
			</sl-select>
		{:else}
			<p>
				You are not a member of any groups. <a href="/groups">Join a group.</a>
			</p>
		{/if}
	</header>

	<ul class="profiles">
		{#each profiles as profile}
			<li>
				<sl-card>
					<div slot="header"><h3>{profile.username}</h3></div>
					<p>Pull requests completed: {profile.pull_requests}</p>
					<p>Shirt size: {profile.shirt_size}</p>
				</sl-card>
			</li>
		{/each}
	</ul>

	<p><a href="/groups">See all groups.</a></p>
</section>

<style>
	.dashboard {
		flex: 2;
		padding: 2rem;
	}

	.profiles {
		padding: 1rem 0;
		border-top: 1px solid var(--sl-panel-border-color);
	}

	ul {
		list-style: none;
	}

	sl-card {
		width: 100%;
	}
</style>
