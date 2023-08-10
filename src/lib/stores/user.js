import { writable } from 'svelte/store';

// /**
//  * A logged-in user of the site
//  * @typedef {Object} User
//  * @property {string} id
//  * @property {string} email
//  */

// /** @typedef {Pick<import('@supabase/supabase-js').AuthUser, "id" | "email">} User */

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
