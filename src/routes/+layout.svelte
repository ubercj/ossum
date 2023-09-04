<script>
	import './styles.css';

	import { invalidate, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = data.session?.user;

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	const signOut = async () => {
		await supabase.auth.signOut();
		goto('/');
	};
</script>

<div class="root">
	<header>
		<nav class="main-nav">
			<ul>
				{#if user?.id}
					<li>
						<a href="/dashboard">Dashboard</a>
					</li>
					<li>
						<a href="/account">Profile</a>
					</li>
					<li>
						<a href="/groups">Groups</a>
					</li>
					<li>
						<sl-button type="button" variant="warning" aria-live="polite" on:click={signOut}>
							<span>Sign Out</span>
						</sl-button>
					</li>
				{:else}
					<li>
						<a href="/">Login</a>
					</li>
					<li>
						<a href="/signup">Sign Up</a>
					</li>
				{/if}
			</ul>
		</nav>
	</header>

	<main class="main container">
		<slot />
	</main>
</div>

<style>
	header {
		border-bottom: 1px solid white;
	}

	.main-nav ul {
		list-style: none;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}
</style>
