export const load = async ({ parent, url, depends }) => {
	const { supabase, session } = await parent();
	const userId = session?.user.id;
	const selectedGroupId = url.searchParams.get('group');

	depends('group:selection');

	/**
	 * @type {Group[] | null}
	 */
	let groups = null;

	/**
	 * @type {Group | undefined}
	 */
	let selectedGroup;

	/**
	 * @type {Profile[] | null}
	 */
	let profiles = null;

	// Get Groups for user
	if (userId) {
		try {
			const { data, error } = await supabase
				.from('groups')
				.select(
					`
            id,
            name,
            group_profile!inner (
              id
            )
          `
				)
				.eq('group_profile.profile_id', userId);

			if (error) throw error;
			groups = data;
		} catch (err) {
			console.error(err.message);
		}
	}

	// Get Profiles for selected Group
	if (groups && selectedGroupId) {
		selectedGroup = groups.find((group) => group.id === parseInt(selectedGroupId));

		try {
			const { data, error } = await supabase
				.from('profiles')
				.select(
					`
          id,
          username,
           website,
           avatar_url,
           shirt_size,
           pull_requests,
           group_profile!inner (
            id,
            group_id
            )
          `
				)
				.eq('group_profile.group_id', selectedGroupId);

			if (error) throw error;
			profiles = data;
		} catch (err) {
			console.error(err.message);
		}
	}

	return { groups, selectedGroup, profiles };
};
