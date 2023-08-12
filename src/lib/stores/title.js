import { writable } from 'svelte/store';

function createTitle() {
	const { subscribe, set } = writable('');

	return {
		subscribe,
		/**
		 * @param {string} value
		 */
		set: (value) => {
			set(`${value} • Hacktoberfest Tracking`);
		},
		clear: () => {
			set('Hacktoberfest Tracking');
		}
	};
}

export const title = createTitle();
