# Ossum

Track and share code contributions with your friends. [Check it out here](https://ossum.vercel.app/).

## Tech stack

This is a [SvelteKit](https://kit.svelte.dev/) app that uses [Supabase](https://supabase.com/) for a database and authentication, and is hosted on [Vercel](https://vercel.com/). It's registered as a [Github App](https://github.com/apps/ossum-app) for the Github registration and OAuth login. The Github REST API is accessed using the Octokit.js library.

### Resources

- [Svelte tutorial](https://learn.svelte.dev/tutorial/welcome-to-svelte)
- [SveltKit docs](https://kit.svelte.dev/docs/introduction)
- [Getting Started with Svelte](https://css-tricks.com/getting-started-with-sveltekit/)
- [Github REST API docs](https://docs.github.com/en/rest?apiVersion=2022-11-28)
- [Octokit.js docs](https://github.com/octokit/octokit.js)

### Types

This app uses .js files with JSDoc comments for typing. If you're familiar with TypeScript, JSDoc is not very different. Here's some [documentation with examples](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html). Read [this blog post](https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/) for some more background on why Svelte prefers JSDoc. If you use VSCode for your IDE, JSDoc comments provide almost all of the same type checking and code completion that TS does.

## Contributing

There is a [Github Project](https://github.com/users/ubercj/projects/1) set up for this repo. Feel free to assign yourself to any ticket in the Todo column. Don't feel limited to just what's on the board - if you see a bug or have a feature request, [make an issue](https://github.com/ubercj/ossum/issues) and add it to the board. If you'd like to work on it, don't forget to assign yourself.

You'll need to [fork this repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo) to make a PR. PRs will need to be reviewed by a maintainer before being merged.

## Working locally

Once you've forked and cloned the repo and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Supabase access and environment variables

You'll need to be invited by an admin to get access to the Supabase instance for this project. This is where you can get the `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` environment variables. Set `VITE_REDIRECT_URL` to http://localhost:5173 for local development.

