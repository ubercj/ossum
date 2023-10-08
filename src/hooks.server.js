import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_GITHUB_APP_PRIVATE_KEY
} from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import crypto from 'node:crypto';
import { authenticateGHApp } from '$lib/octokit';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	// https://github.com/gr2m/universal-github-app-jwt#about-private-key-formats
	const privateKeyPkcs8 = crypto.createPrivateKey(PUBLIC_GITHUB_APP_PRIVATE_KEY).export({
		type: 'pkcs8',
		format: 'pem'
	});

	const app = await authenticateGHApp(privateKeyPkcs8);
	event.locals.octokitApp = app;

	// Auth guard
	if (event.url.pathname !== '/') {
		const session = await event.locals.getSession();
		if (!session) {
			throw redirect(303, '/');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
