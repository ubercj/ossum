<script>
	import { invalidate } from '$app/navigation';
	import { title } from '$lib/stores/title';

	export let data;
	let { groups, selectedGroup, profiles } = data;
	$: ({ groups, selectedGroup, profiles } = data);

	// let loading = false;

	$title = 'Dashboard';

	/**
	 * @type {string}
	 */
	let selectedGroupId = '';

	/**
	 * @param {Event} event
	 */
	const handleGroupChange = (event) => {
		let newGroup = groups?.find((group) => group.id === parseInt(event.target.value));

		// Rerun +page.js load event to get new group/profile data
		if (newGroup && newGroup.id !== parseInt(selectedGroupId)) {
			selectedGroupId = newGroup.id.toString();

			const url = new URL(window.location.toString());
			url.searchParams.set('group', selectedGroupId);
			history.replaceState(history.state, '', url);
			invalidate('group:selection');
		}
	};
</script>

<section class="dashboard">
	<header>
		<h1>{selectedGroup ? selectedGroup.name : 'Your'} Dashboard</h1>
		{#if groups?.length}
			<sl-select
				value={selectedGroupId}
				placeholder="Select a Group"
				clearable
				on:sl-change={(e) => handleGroupChange(e)}
			>
				{#each groups as group}
					<sl-option value={group.id}>{group.name}</sl-option>
				{/each}
			</sl-select>
		{:else}
			<p>
				You are not a member of any groups. <a href="/groups">Join a group.</a>
			</p>
		{/if}
	</header>

	<ul class="profiles">
		{#if profiles}
			{#each profiles as profile}
				<li>
					<sl-card>
						<div slot="header"><h3>{profile.username || 'Anonymous user'}</h3></div>
						<!-- <p>Pull requests completed: {profile.pull_requests}</p> -->
						<p>Shirt size: {profile.shirt_size || 'Not selected'}</p>
					</sl-card>
				</li>
			{/each}
		{/if}
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
