<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores/user';
	import { title } from '$lib/stores/title';
	import { getGroups } from '$lib/services/supabase';

	$title = 'Groups';

	/**
	 * @type {Group[]}
	 */
	let allGroups = [];

	/**
	 * @type {Group[]}
	 */
	let userGroups = [];

	onMount(() => {
		getGroupsData();
	});

	const getGroupsData = async () => {
		try {
			const { data: groupData, error: groupError } = await getGroups($currentUser.id);
			if (groupData) {
				userGroups = groupData;
			}
			if (groupError) {
				throw new Error(`There was an error retrieving group data`);
			}

			await getUnjoinedGroups();
		} catch (error) {
			console.error(error);
			alert(error.message);
		}
	};

	const getUnjoinedGroups = async () => {
		const { data: groupsData, error: groupsError } = await supabase
			.from('groups')
			.select(
				`
          id,
          name
        `
			)
			.not('id', 'in', `(${userGroups.map((group) => group.id)})`);

		if (groupsData) {
			allGroups = groupsData;
		}
	};

	/**
	 * @param {MouseEvent} event
	 */
	const handleClick = (event) => {
		joinGroup(parseInt(event.target.dataset.groupId));
	};

	/**
	 * @param {number} groupId
	 */
	const joinGroup = async (groupId) => {
		try {
			let { error, status } = await supabase
				.from('group_profile')
				.insert({ group_id: groupId, profile_id: $currentUser.id });

			if (status === 201) {
				alert('You have successfully joined the group.');

				// Re-render list of groups to remove group just joined
				getGroupsData();
			}

			if (error) throw error;
		} catch (error) {
			console.log(error);
			alert('There was an error joining this group.');
		}
	};
</script>

<section class="groups">
	<h1>Groups</h1>

	{#if !allGroups.length}
		<p>There are no groups to show.</p>
	{/if}

	<ul>
		{#each allGroups as group}
			<li>
				<sl-card>
					<h3>{group.name}</h3>
					<sl-button data-group-id={group.id} on:click={handleClick}>Join</sl-button>
				</sl-card>
			</li>
		{/each}
	</ul>

	<a href="/dashboard">Back to Dashboard</a>
</section>

<style>
	.groups {
		width: 50%;
		margin: 0 auto;
	}

	li {
		list-style: none;
	}

	sl-card {
		width: 100%;
		margin-bottom: 1rem;
	}

	sl-card::part(body) {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
