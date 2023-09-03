<script>
	import { PUBLIC_REDIRECT_URL } from '$env/static/public';
	import { title } from '$lib/stores/title';
	import { goto } from '$app/navigation';
	import github_logo from '$lib/assets/github.svg';

	export let data;
	let { supabase } = data;
	$: ({ supabase } = data);

	/** @type {boolean}*/
	let loading;

	/** @type {string}*/
	let signInEmail = '';

	/** @type {string}*/
	let signInPassword = '';

	/** @type {string}*/
	let errorMessage = '';

	$title = '';

	const handleSignInWithPassword = async () => {
		try {
			loading = true;
			errorMessage = '';

			const { data, error } = await supabase.auth.signInWithPassword({
				email: signInEmail,
				password: signInPassword
			});

			if (error) throw error;
			goto('/dashboard');
		} catch (error) {
			console.error(error);
			errorMessage = error.message;
		} finally {
			loading = false;
		}
	};

	const handleSignInWithOAuth = async () => {
		try {
			loading = true;
			errorMessage = '';

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'github',
				options: {
					redirectTo: PUBLIC_REDIRECT_URL
				}
			});

			if (error) throw error;
			goto('/dashboard');
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Ossum</title>
	<meta name="description" content="Create open source together" />
</svelte:head>

<section class="login">
	<h1>Ossum</h1>
	<p class="subheading">Create open source together</p>
	<div class="form-widget" aria-live="polite">
		<sl-button
			type="button"
			class="social-button"
			aria-live="polite"
			{loading}
			on:click={handleSignInWithOAuth}
		>
			<img slot="prefix" src={github_logo} alt="" />
			<span>Sign In with GitHub</span>
		</sl-button>
		<div role="separator" class="divider">
			<sl-divider /><span>or</span><sl-divider />
		</div>
		<p class="description">Sign in using your email and password below</p>
		<form class="form-widget" on:submit|preventDefault={handleSignInWithPassword}>
			<sl-input
				id="email"
				label="Email"
				type="email"
				placeholder="Your email"
				value={signInEmail}
				on:sl-input={(e) => (signInEmail = e.target.value)}
			/>
			<sl-input
				id="password"
				label="Password"
				type="password"
				placeholder="Your password"
				value={signInPassword}
				on:sl-input={(e) => (signInPassword = e.target.value)}
			/>
			<sl-button type="submit" class="sign-in" aria-live="polite" {loading}>
				<span>Submit Sign In</span>
			</sl-button>
			{#if errorMessage}
				<p style="color: red;">{errorMessage}</p>
			{/if}
		</form>

		<p class="description">
			Don't have an account? Sign up <a href="/signup">here</a>.
		</p>
	</div>
</section>

<style>
	.subheading {
		text-align: center;
	}

	.description {
		font-size: 1.1rem;
	}

	.form-widget {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		max-width: 640px;
		margin: auto;
	}
	.social-button::part(base) {
		display: flex;
		align-items: center;
	}

	.social-button::part(base):hover {
		background-color: initial;
	}

	sl-input {
		width: 100%;
	}

	sl-input::part(form-control) {
		display: flex;
		justify-content: flex-end;
		width: 100%;
	}

	sl-input::part(form-control-label) {
		display: flex;
		align-items: center;
		flex: 1 0 20%;
	}

	sl-input::part(form-control-input) {
		flex: 1 0 80%;
	}

	.divider {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 1rem;
	}

	sl-divider {
		flex: 1;
		--width: 2px;
	}
</style>
