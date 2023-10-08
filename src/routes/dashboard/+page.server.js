import { getUserAccessRepos } from '$lib/octokit.js';

export const load = async ({ locals: { octokitApp }, parent }) => {
	const { session } = await parent();

	const result = await octokitApp.octokit.request('GET /app/installations');
	const { id } = result.data[0];

	if (session && session.provider_token) {
		const userRepos = await getUserAccessRepos(session.provider_token, id);

		const userReposCount = userRepos.total_count;
		console.log('🌮 --- file: +page.server.js:25 --- userReposCount --- 🌮', userReposCount);
		const userReposNames = userRepos.repositories.map((repo) => repo.name);
		console.log('🌮 --- file: +page.server.js:27 --- userReposNames --- 🌮', userReposNames);
	}
	// return { repos: repos.data };
};
