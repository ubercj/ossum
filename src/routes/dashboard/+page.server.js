export const load = async ({ locals: { octokitApp } }) => {
	const result = await octokitApp.octokit.request('GET /app/installations');
	console.log('🌮 --- file: +page.server.js:32 --- result.data --- 🌮', result.data);
	// return result.data;
};
