import { PUBLIC_OCTOKIT_TOKEN } from '$env/static/public';
import { Octokit } from '@octokit/core';

/** @param {string} token */
export const getUser = async (token) => {
	const octokit = new Octokit({
		auth: token
	});

	const user = await octokit.request('GET /user');
	return user.data;
};

/** @param {string} username */
export const getIssues = async (username) => {
	const octokit = new Octokit({
		auth: PUBLIC_OCTOKIT_TOKEN
	});

	const issues = await octokit.request('GET /search/issues', {
		q: `type:pr author:${username} is:merged created:2022-10-01..2022-10-31`
	});

	const mappedIssues = issues.data.items.map(
		({ title, pull_request, created_at, closed_at, state, labels }) => {
			return {
				title,
				url: pull_request?.url,
				created_at,
				closed_at,
				state,
				labels
			};
		}
	);

	return { ...issues.data, items: mappedIssues };
};
