# 🔌 adapter
`adapter` is a tiny TypeScript helper for writing I/O agnostic utilities in a standardized way.  Your code could run in a headless process, an interactive commandline tool, or in a graphical program, but either way your code remains the same.

Check out the [README](https://github.com/tannerntannern/adapter) if you just need a quick example to get up and running.

## Installation
```bash
npm install adapter
```
or
```bash
yarn add adapter
```

## Practical Example
Let's say you have some code that creates a remote repository via the GitHub API.  It might look something like this:

```typescript
import {httpClient} from 'some-http-package';

const url = 'https://api.github.com/user/repos';
const headers = {Authorization: 'token XXX'};
const data = {name: 'someuser/new-repo'};

console.log('Making request...');
const result = await httpClient.post(url, data, headers);
console.log('Done: ' + result.data);
```

This is a fine proof of concept, but now we need to make it usable.  That's where `adapter` comes in:

```typescript
import {makeAdapter} from 'adapter';

type Resolve = number;
type Output = string;
type Input = {
    'api-key': string,
    'repo-name': string
};

const createRemoteRepo = () => makeAdapter<Resolve, Output, Input>(
    async (resolve, reject, output, input) => {
        const url = 'https://api.github.com/user/repos';
        const headers = {Authorization: 'token ' + await input('api-key')};
        const data = {name: await input('repo-name')};

        output('Making request...');
        const result = await httpClient.post(url, data, headers);
        output('Done: ' + result.data);
        
        resolve(result.statusCode);
    }
);

const result = await createRemoteRepo()
    .input(async (key) => window.prompt(`Please enter your ${key}`))
    .output(msg => window.alert(`Status: ${msg}`))
    .exec();  // this just returns a regular Promise
```

Well this made the code a little bigger, but exactly what did it do for us?  If you're familiar with the Promise API, this might feel like a natural extension:  Promises allow you to inject (or "plug in") the means of handling completion and failure (`resolve` and `reject`), while adapters additionally allow you to inject the means of outputting data and requesting input while the async task is running (`output` and `input`).  This makes our code very portable and reusable!

However, these kinds of structures can easily create anxiety; it's easy to get confused and even easier to make mistakes when someone who did _not_ write your code is required to pass their functions to it.  Luckily the type aliases defined beforehand go a long way.  Let's take a closer look at that:

```typescript
type Resolve = number;
type Output = string;
type Input = {
    'api-key': string,
    'repo-name': string
};

const createRemoteRepo = () => makeAdapter<Resolve, Output, Input>(
    async (resolve, reject, output, input) => {
        // ...
    }
);
```

Because we passed our types as paramters to the `makeAdapter` function, the injected `input` and `output` are completely type-safe.  If you tried to run `output(1)` the compiler would complain because we limited output to strings.  Likewise, the `input` function will only accept `'api-key'` or `'repo-name'`, and has the appropriate return type for each.
