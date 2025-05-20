This game is modified based on Farmhand (A farming game by [Jeremy Kahn](https://github.com/jeremyckahn)).

Farmhand is a open source resource management game ([This GitHub project](https://github.com/jeremyckahn/farmhand/projects/1)). It is implemented as a [Progressive Web App](https://web.dev/what-are-pwas/), uses a [SemVer](https://semver.org/)-like versioning system. The project also uses [Vite](https://vitejs.dev/), so please refer to the documentation of that project to learn about the development toolchain.Farmhand uses [Piskel](https://www.piskelapp.com/) for the art assets.

We adapted the code from [This GitHub project](https://github.com/jeremyckahn/farmhand/projects/1), and implmented WaterCredit and farm practices that reduce nitrogen emission into the game. We attached a video explananing the game in the submission.

## Running locally

Requires:

- Node/NPM (npm version v1.18.26)
- Docker
- [nvm](https://github.com/nvm-sh/nvm) (or alternatively [asdf](https://asdf-vm.com))

In your shell, run this to ensure you're using the correct Node version and install all of the dependencies:

```sh
nvm i
npm ci --legacy-peer-deps
```

If `npm ci --legacy-peer-deps` errors out due to PhantomJS installation errors (this has been seen in some WSL/Linux environments), try `npm_config_tmp=/tmp npm ci` instead. [See this related comment](https://github.com/yarnpkg/yarn/issues/1016#issuecomment-283067214). Alternatively, try `npm ci --no-optional --legacy-peer-deps`.

To run the game locally with the API, Redis database, and peer pairing server, run:

```sh
npm run dev
```

To run the native app locally, run:

```sh
npm run dev:native
```

Note that you will need a Vercel account and be logged into locally for this to work (at least until [Vercel fixes this](https://github.com/vercel/vercel/discussions/4925)). Alternatively, if you just want to run the front end with no API or backend, you can run:

```sh
npm start
```

In this case, the local app will be using the Production API, database, and pairing server. However you boot, Farmhand will be accessible from http://localhost:3000/.
