<script>
	import './styles.css';
	import { currentUser } from '$lib/stores/user';
</script>

<div class="root">
	<nav class="main-nav">
		<ul>
			{#if $currentUser.id}
				<li>
					<a href="/dashboard">Dashboard</a>
				</li>
				<li>
					<a href="/account">Profile</a>
				</li>
				<li>
					<a href="/groups">Groups</a>
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
	<main class="main container">
		<slot />
	</main>
</div>
