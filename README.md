# 🔌 adapter
[![npm version](https://badgen.net/npm/v/adapter)](https://npmjs.com/package/adapter)
[![Build Status](https://travis-ci.org/tannerntannern/adapter.svg?branch=master)](https://travis-ci.org/tannerntannern/adapter)
[![Coverage Status](https://coveralls.io/repos/github/tannerntannern/adapter/badge.svg?branch=master)](https://coveralls.io/github/tannerntannern/adapter?branch=master)
[![min size](https://badgen.net/bundlephobia/min/adapter)](https://bundlephobia.com/result?p=adapter)
[![conventional commits](https://badgen.net/badge/Conventional%20Commits/1.0.0/yellow)](https://www.conventionalcommits.org/)

> write I/O agnostic utilities

# What is it?
`adapter` is a tiny TypeScript helper for writing I/O agnostic utilities in a standardized way.  Your code could run in a headless process, an interactive commandline tool, or in a graphical program, but either way your code remains the same.

The idea is difficult to appreciate without an example.  If you're comfortable with writing your own Promises and `async`/`await` patterns, the following example should be fairly intuitive.  Additionally, [more detailed documentation](https://tannerntannern.github.io/adapter) is available.

# Example
`adapter` works its magic by injecting (or "plugging in") the means of handling I/O (`input`/`output`), just as Promises inject the means of handling success/failure (`resolve`/`reject`).  Pay attention to how they're used in the service below:

```typescript
// service.ts

import {makeAdapter} from 'adapter';

type Resolve = string;
type Output = string;
type Input = {'input1': string, 'input2': string};

export default () => makeAdapter<Resolve, Output, Input>(
    async (resolve, reject, output, input) => {
    	output('Starting task 1...');
        const input1 = await input('input1');
        const result1 = await doSubTask1(input1);
        output(result1.msg);
        
        output('Starting task 2...');
        const input2 = await input('input2');
        const result2 = await doSubTask2(input2);
        output(result2.msg);
        
        if (result1.success && result2.success)
            resolve('Tasks successful!');
        else
            reject('One or more tasks failed.  See previous output for details.');
    }
);
```

With our portable service written, we can now put it to work.  Let's say we want to use it as part of a CLI application:

```typescript
// cli-app.ts

import {prompt} from 'inquirer';    // inquirer is tool for getting cli input
import service from './service';

const then = console.info;
const output = console.log;
const input = async (key) => prompt([{
    name: key,
    message: `Please enter a value for ${key}:`
}]);

service()                           // calling our service gives us an `Adapter`
    .attach({then, output, input})  // here we "plug in" our attachments
    .exec();                        // and this executes our code
```

We could also utilize the same service in a web application:

```typescript
// browser-app.ts

import service from './service';

service()                      // you can also attach handlers independently,
    .then(console.info)        // like so:
    .catch(console.error)
    .output(console.log)
    .input(async (key) => {
    	return window.prompt(`Please enter a value for ${key}`);
    })
    .exec();
```

Hopefully seeing the `cli-app.ts` next to `browser-app.ts` illustrates the power of using `adapter`.  It doesn't take much to imagine how the same service could be used with voice control and text-to-speech, or any number of other I/O requirements.

# Installation
```bash
npm install adapter
```
or
```bash
yarn add adapter
```

### HEADS UP!
I am still in the process of negotiating rights to the npm package name from the current owner, so you cannot install via npm at the moment.  For the few if any of you who stumble upon this package and are interested: it will be available within a few days.

# Documentation
Be sure to check out [the documentation](https://tannerntannern.github.io/adapter)!  It includes examples, a detailed API description, and more.

# Author
Tanner Nielsen <tannerntannern@gmail.com>

[Website](https://tannernielsen.com) | [GitHub](https://github.com/tannerntannern)
