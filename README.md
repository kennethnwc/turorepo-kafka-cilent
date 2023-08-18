# Turborepo Shared typed kafka client

This is an example to show how to share one kafka client with different backend services.
Imagine you have a kafka cluster and two backend services(backend1, backend2) want to producer and consume the messages from the cluster.
You dont want to repeat the same codes for kafka implementation in two backend 1 and 2 codebases.
Then a kafka-client package comes in handy since you can import it and use it directly.
One problem is how can we make it type safe and easy to use.
I try to write the types that can autocomplete.

# Highlight

```typescript
const kafkaClient = new KafkaClient("backend1", []); // you get the autocomplete for which services are "backend1" | "backend2"

kafkaClient.sendMessage("payment-request", {}); // auto suggest which topic to choose and get the correct message type to pass in

kafkaClient.startConsumer(["user-request"], (message, topic) => {}); // auto suggest what topics can be subscribed
```

## Limiations and Improvements

How I make the sendMessage and startConsumer to get the autocomplete working.
I have a predefined topics in the kafka-client
And I do some not elegant conditional check to make it work

```typescript
type Message<T extends Topic> = T extends "user-request"
  ? UserRequestMessage
  : T extends "payment-request"
  ? PaymentRequestMessage
  : never;
```

One down side is if I want to add more topics, I need to do the check for each topic to get the correct message types
I am still learning typescript. I would like to get some help if everyone happen to view this repo. Thanks in advance

## Using this example

Run the following command:

```sh
yarn
yarn dev
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `backend1`: a nodejs app
- `backend2`: another nodejs app
- `kafka-client`: a kakfka client package used by backend1 and backend2
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```
yarn dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
