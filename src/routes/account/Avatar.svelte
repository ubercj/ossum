<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function upload() {
		dispatch('upload');
	}

	/**
	 * @type {string}
	 */
	export let avatarUrl;

	/**
	 * @type {string}
	 */
	export let imageUrl;

	/**
	 * @type {boolean}
	 */
	export let loading;

	/**
	 * @type {FileList}
	 */
	export let files;
</script>

<div>
	<sl-avatar shape="rounded" image={imageUrl} />
	<!-- TODO: This is NOT accessible to screen readers -->
	<label class="upload" for="profile-pic">
		<sl-button>Upload Avatar</sl-button>
	</label>
	<input
		class="visually-hidden"
		aria-label="Upload avatar"
		type="file"
		id="profile-pic"
		accept="image/*"
		bind:files
		on:change={upload}
		disabled={loading}
	/>
</div>

<style>
	sl-avatar {
		--size: var(--account-avatar-size);
		margin-bottom: 1rem;
	}
	sl-button {
		display: inline;
		z-index: -1;
	}
	label.upload {
		width: var(--account-avatar-size);
		display: block;
	}

	label.upload:hover {
		cursor: pointer;
	}

	label.upload:hover sl-button::part(base) {
		background-color: var(--sl-color-primary-50);
		border-color: var(--sl-color-primary-300);
		color: var(--sl-color-primary-700);
	}
</style>
