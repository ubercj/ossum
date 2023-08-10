<script>
	import { supabase } from '$lib/supabaseClient';
	import { currentUser } from '$lib/stores/user.js';
	import { onMount } from 'svelte';

	/** @type {import('@supabase/supabase-js').AuthSession} */
	let session;

	onMount(() => {
		handleAuthState();
	});

	const handleAuthState = async () => {
		const sessResp = await supabase.auth.getSession();
		if (sessResp.data.session) {
			session = sessResp.data.session;
			currentUser.set(session?.user);
		}

		supabase.auth.onAuthStateChange((_event, _session) => {
			if (_session) {
				session = _session;
				currentUser.set(session.user);
			}
		});
	};
</script>

<svelte:head>
	<title>Ossum</title>
	<meta name="description" content="Create open source together" />
</svelte:head>

<section>
	<h1>Ossum</h1>

	<div>Create open source together</div>
</section>

<section>
	<h2>Log In</h2>
</section>
