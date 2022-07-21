# Turbo-t3-expo

This is an example monorepo for create-t3-app and expo. If you want to create your own from scratch, make sure all of your react, react-dom, @types/react, and @types/react-dom are at the same version as the expo app in other apps.

## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org) app
- `web`: a [create-t3-app](https://github.com/t3-oss/create-t3-app) app
- `api`: a shared library for all apps. Includes a prisma client, a trpc router, next-auth options, and expo-auth functionalities
- `ui-web`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `prisma`: a `schema.prisma` file with optional `db.sqlite`

## Next-auth with Expo

This example app uses a lot of logic from Next-auth to implement the same/similar features for mobile. To make this possible, no cookies are used for authentication. Here's how it works:

1. From the Expo app, a request is made and the response is verified.
2. The Expo verfied response, is sent to a tRCP endpoint and verfied once again by the `.expo-auth` router.
3. Once successful, a JWT token is generated, the user and account is updated accordingly, and the new JWT and user is sent to the Expo app.

## Setup

This repository can be cloned from https://github.com/mrzachnugent/turbo-t3-expo.

```
git clone git@github.com:mrzachnugent/turbo-t3-expo.git
cd turbo-t3-expo
yarn
```

### Build

To build all apps and packages, run the following command in the root folder:

```
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd turbo-t3-expo
yarn run dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)
