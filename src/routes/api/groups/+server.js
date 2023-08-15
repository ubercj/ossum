import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals: { supabase } }) {
	const userId = url.searchParams.get('id');

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

		if (data) {
			const response = new Blob([JSON.stringify(data, undefined, 2)]);
			return new Response(response);
		}
		if (error) throw error;
		else {
			return new Response();
		}
	} catch (err) {
		throw error(500, 'There was an error retrieving group data');
	}
}
