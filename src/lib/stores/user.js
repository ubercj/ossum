import { writable } from 'svelte/store';

function createUser() {
	const { subscribe, set } = writable({});

	return {
		subscribe,
		/** @param {import('@supabase/supabase-js').User} user */
		set: (user) => {
			set(user);
		},
		clear: () => {
			set({});
		}
	};
}

export const currentUser = createUser();
