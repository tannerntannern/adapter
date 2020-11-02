# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.0-beta.10"></a>
# [1.0.0-beta.10](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2020-11-02)



<a name="1.0.0-beta.9"></a>
# [1.0.0-beta.9](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2020-11-02)



<a name="1.0.0-beta.8"></a>
# [1.0.0-beta.8](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2019-07-20)


### Bug Fixes

* brought back the type arg so input functions can respond properly ([db08ebc](https://github.com/tannerntannern/adapter/commit/db08ebc))


### Features

* added inputBatch, which allows you to distinguish between single and grouped inputs ([50e7723](https://github.com/tannerntannern/adapter/commit/50e7723))
* simplified the input format and allowed plain objects to be passed ([3eed639](https://github.com/tannerntannern/adapter/commit/3eed639))


### Performance Improvements

* removed `async` to prevent TypeScript from adding the ES5 polyfills ([a274628](https://github.com/tannerntannern/adapter/commit/a274628))


### BREAKING CHANGES

* input type arg is required... again
* first arg is now the key and now the type; the type is always inferred from the key



<a name="1.0.0-beta.7"></a>
# [1.0.0-beta.7](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2019-06-03)


### Features

* added an optional meta property to adapters ([0e867e6](https://github.com/tannerntannern/adapter/commit/0e867e6))
* made the input format much more flexible and intuitive ([8b95bbd](https://github.com/tannerntannern/adapter/commit/8b95bbd))


### BREAKING CHANGES

* incompatible with old input format



<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2019-05-20)


### Bug Fixes

* fixed the order of the Adapter type paramters ([b229829](https://github.com/tannerntannern/adapter/commit/b229829))


### Features

* changed the input format (again) to improve the inferred types ([eb05a0e](https://github.com/tannerntannern/adapter/commit/eb05a0e))


### BREAKING CHANGES

* input format must now be keyed by type, and input functions now must take a type and a key



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2019-05-13)


### Features

* made the input format a little more intuitive to specify ([0311e0a](https://github.com/tannerntannern/adapter/commit/0311e0a))


### BREAKING CHANGES

* old input formats are now incompatible



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2019-05-12)



<a name="1.0.0-beta.3"></a>
# [1.0.0-beta.3](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2019-05-12)



<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2019-05-12)


### Features

* made the main API less cluttered ([d5f6554](https://github.com/tannerntannern/adapter/commit/d5f6554))


### BREAKING CHANGES

* 1) resolve and reject are no longer passed as the first arguments to an AdapterExecutor, 2) input now comes before output, 3) all adapter executors must be async



<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/tannerntannern/adapter/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2019-05-06)


### Features

* made the inputs allow for more than just the key to be passed ([34787d4](https://github.com/tannerntannern/adapter/commit/34787d4))


### BREAKING CHANGES

* input types can no longer be specified with simple key/value pairs; the value must now be an object with a `return` property, which allows for an optional `options` object to be passed



<a name="1.0.0-beta.0"></a>
# 1.0.0-beta.0 (2019-05-04)


### Features

* added `attach` which adds all attachments with a single function call ([5bbbd20](https://github.com/tannerntannern/adapter/commit/5bbbd20))
