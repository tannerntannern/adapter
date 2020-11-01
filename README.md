# 🔌 adapter
[![npm version](https://badgen.net/npm/v/adapter)](https://npmjs.com/package/adapter)
[![github actions](https://img.shields.io/github/workflow/status/tannerntannern/adapter/adapter%20CI)]()
[![min size](https://badgen.net/bundlephobia/min/adapter)](https://bundlephobia.com/result?p=adapter)
[![conventional commits](https://badgen.net/badge/Conventional%20Commits/1.0.0/yellow)](https://www.conventionalcommits.org/)

> write I/O agnostic utilities

# What is it?
`adapter` is a tiny TypeScript helper for writing I/O agnostic utilities in a standardized way.  Your code could run in a headless process, an interactive commandline tool, or in a graphical program, but either way your code remains the same.

The idea is difficult to appreciate without an example.  If you're comfortable with writing your own Promises and `async`/`await` patterns, the following example should be fairly intuitive.  <!-- Additionally, [more detailed documentation](https://tannerntannern.github.io/adapter) is available. -->

# Example
<!-- TODO: change this example to just pull an existing repo.  Then the input would depend on whether the repo was private and requires credentials.  This way the input is "unplanned" and better demonstrates the value of having an adapter. -->

Let's say that you have some code that creates a remote repository via the GitHub API.  It might look roughly like this:

```typescript
import axios from 'axios';    // http library

const url = 'https://api.github.com/user/repos';
const headers = { Authorization: 'token <access-token>' };
const data = { name: '<repo-name>', private: true };

await axios.post(url, data, {headers});
```

`adapter` can be used to improve this code by injecting (or "plugging in") the means of handling I/O (`input`/`output`), just as Promises inject the means of handling success/failure (`resolve`/`reject`).  Let's rewrite the above code leveraging these injections:

```typescript
// github-service.ts

import axios, {AxiosResponse} from 'axios';
import {makeAdapter} from 'adapter';

type Resolve = AxiosResponse;
type Input = {
    types: { 'text': string, 'yes-no': boolean },
    options: {
        [type: string]: { message: string }
    },
    keys: {
        'access-token': 'text',
        'repo-name': 'text',
        'private': 'yes-no',
        'retry': 'yes-no',
    }
};
type Output = string;

export const createRepo = () => makeAdapter<Resolve, Input, Output>(
    async (input, output) => {
        const url = 'https://api.github.com/user/repos';
        const headers = {
            Authorization: 'token ' + await input(
                'access-token', 'text', {message: 'Personal Access Token: '}
            )
        };
        const data = {
            name: await input(
                'repo-name', 'text', {message: 'Repository Name: '}
            ),
            private: await input(
                'private', 'yes-no', {message: 'Private?: '}
            )        	
        };
        
        output('Making API call to GitHub...');
        let response;
        try {
            response = await axios.post(url, data, {headers});
        } catch (e) {
            output('Something went wrong... Status code: ' + e.response.status);
            if (await input('retry', 'yes-no', {message: 'Would you like to try again? '})) {
                return await createRepo().attach({input, output});
            } else {
                throw e;
            }
        }
        
        output('Repository created!');
        return response;
    }
);
```

Now that our input and output functions are injected, we can use this service anywhere.  Say we want to use it as part of a CLI application:

```typescript
// cli-app.ts

import {prompt} from 'inquirer';    // inquirer is tool for getting cli input
import {createRepo} from './github-service';

const then = console.info;
const output = console.log;
const input = async (type, key, options) => {
    if (type === 'text') type = 'input';
    if (type === 'yes-no') type = 'confirm';
    
    return await prompt([{
        name: key,
        type: type,
        message: options.message
    }]);
};

createRepo()                        // calling our service gives us an `Adapter`
    .attach({then, output, input})  // here we "plug in" our attachments
    .exec();                        // and this executes our code
```

<!-- TODO: Here's what that might look like -->

We could also utilize the same service in a web application:

```typescript
// browser-app.ts

import service from './service';

service()                      // you can also attach handlers independently,
    .then(console.info)        // like so:
    .catch(console.error)
    .output(console.log)
    .input(async (type, key, options) => {
    	if (type === 'yes-no') {
            const yn = window.prompt(options.message + '(Y/n)');
            return yn === 'y';
    	} else {
            return window.prompt(options.message);
    	}
    })
    .exec();
```

<!-- TODO: Here's what that might look like: -->

Hopefully seeing these two applications side by side illustrates the advantages of using `adapter`.

<!-- TODO: make voice control demo just for fun? -->

# Installation
```bash
npm install adapter
```
or
```bash
yarn add adapter
```

# Documentation
More complete documentation is coming soon!  <!-- Be sure to check out [the documentation](https://tannerntannern.github.io/adapter)!  It includes examples, a detailed API description, and more. -->

# Author
Tanner Nielsen <tannerntannern@gmail.com>

[Website](https://tannernielsen.com) | [GitHub](https://github.com/tannerntannern)
